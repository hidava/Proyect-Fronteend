'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { createPatient } from '../lib/patients';
import api from '../lib/api';

// Nota: ahora delegamos la validación y la creación al helper `createPatient`.



export default function RegistroPaciente() {
    
    // Estados del Formulario (Alineados con la tabla pacientes: nombre, especie, raza, edad, peso, altura, propietarios_cedula)
    const [nombreMascota, setNombreMascota] = useState('');
    const [especie, setEspecie] = useState('');
    const [raza, setRaza] = useState('');
    const [edad, setEdad] = useState('');
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [cedulaPropietario, setCedulaPropietario] = useState(''); // Representa propietarios_cedula
    
    // Estados de la Aplicación y Errores
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Ícono de marca reutilizado para mantener coherencia visual
    const BrandingIcon = () => (
        <svg className="w-8 h-8 mr-3 text-[#FF6B6B] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
        </svg>
    );

    // Usamos un objeto formData como en `register/page.js` para facilitar manejo y limpieza.
    const router = useRouter();
    const [formData, setFormData] = useState({
        nombreMascota: '', especie: '', raza: '', edad: '', peso: '', altura: '', cedulaPropietario: ''
    });
    const [patientExists, setPatientExists] = useState(false);
    const [checkingPatient, setCheckingPatient] = useState(false);
    const [checkTimer, setCheckTimer] = useState(null);

    useEffect(() => {
        if (!successMessage) return;

        const timer = setTimeout(() => {
            setSuccessMessage('');
        }, 2000);

        return () => clearTimeout(timer);
    }, [successMessage]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Si el nombre o la cédula cambian, re-evaluar existencia (debounce)
        if (name === 'nombreMascota' || name === 'cedulaPropietario') {
            setPatientExists(false);
            if (checkTimer) clearTimeout(checkTimer);
            setCheckingPatient(true);
            const timer = setTimeout(() => {
                checkPatientAvailability(formData.nombreMascota, formData.cedulaPropietario, name === 'nombreMascota' ? value : undefined);
            }, 600);
            setCheckTimer(timer);
        }
    };

    const checkPatientAvailability = async (currentName, currentCedula, overrideValue) => {
        try {
            const nombreToCheck = overrideValue !== undefined ? overrideValue : currentName;
            if (!nombreToCheck || !currentCedula) {
                setCheckingPatient(false);
                setPatientExists(false);
                return false;
            }

            setCheckingPatient(true);
            // Llama al API externo que comprueba duplicados (si existe)
            const res = await api.post('/api/v1/pacientes/check', {
                nombre: nombreToCheck,
                propietarios_cedula: currentCedula,
            });
            const exists = Boolean(res?.data?.exists);
            setPatientExists(exists);
            return exists;
        } catch (e) {
            if (e?.response?.status !== 404 && process.env.NODE_ENV !== 'production') {
                console.warn('Error comprobando paciente:', e);
            }
            setPatientExists(false);
            return false;
        } finally {
            setCheckingPatient(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            // Re-check before submitting (race protection)
            const isDup = await checkPatientAvailability(formData.nombreMascota, formData.cedulaPropietario);
            if (isDup) {
                setError('Paciente ya registrado para este propietario');
                setSuccessMessage('');
                setLoading(false);
                return;
            }

            await createPatient(formData);

            setSuccessMessage(`¡Registro exitoso para ${formData.nombreMascota}!`);
            setError('');

            // Limpiar el formulario (no redirigimos automáticamente)
            setFormData({ nombreMascota: '', especie: '', raza: '', edad: '', peso: '', altura: '', cedulaPropietario: '' });
            setPatientExists(false);

        } catch (err) {
            if (process.env.NODE_ENV !== 'production') console.warn("Error al registrar el paciente:", err);
            const message = err?.message || 'Error de conexión con el servicio de registro. Inténtalo de nuevo.';
            const normalizedMessage = message
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();

            if (normalizedMessage.includes('cedula no encontrada')) {
                setError('Cédula inexistente');
            } else {
                setError(message);
            }
            setSuccessMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full p-6 sm:p-10 lg:p-16 font-sans">

            <main className="max-w-6xl w-full mx-auto">
                <div className="relative bg-[#F8F7F5]/85 backdrop-blur-sm shadow-2xl rounded-3xl px-4 py-2 sm:px-6 sm:py-3 border border-[#C9A8D4]/40 overflow-hidden -mt-[44px]">
                    <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#C9A8D4]/25 blur-2xl" />
                    <div className="absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-[#9BCDB0]/30 blur-2xl" />
                    <div className="relative">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center">
                                    <BrandingIcon />
                                    <div className="ml-2 text-left">
                                        <h1 className="text-3xl font-extrabold text-[#FF6B6B]">Registro de Pacientes</h1>
                                        <p className="text-sm text-[#9BCDB0] mt-1">Formulario para registrar nuevas mascotas</p>
                                        <p className="mt-1 text-sm text-gray-600">Complete los datos de la mascota y del propietario.</p>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                    <a href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-full bg-[#C9A8D4] text-white font-semibold hover:bg-gradient-to-r hover:from-[#C9A8D4] hover:to-[#FF6B6B] transform hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out">Volver al Dashboard</a>
                                </div>
                            </div>
                            <div />
                        </div>
                    </div>
                    {/* Muestra mensaje de éxito */}
                    {successMessage && ( 
                        <div className="text-center text-sm text-green-600 font-medium p-3 bg-green-100 border border-green-300 rounded-md mt-6">
                            {successMessage}
                        </div>
                    )}

                    {/* Muestra el error */}
                    {error && ( 
                        <div className="text-center text-sm text-red-600 font-medium p-3 bg-red-100 border border-red-300 rounded-md mt-6">
                            {error}
                        </div>
                    )}

                    <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <h3 className="lg:col-span-3 text-lg font-semibold text-[#FF6B6B] border-b pb-2">Datos de la Mascota</h3>

                            {/* 1. NOMBRE MASCOTA */}
                            <div>
                                <label htmlFor="nombreMascota" className="block text-sm font-medium text-gray-700">Nombre de la Mascota</label>
                                <input
                                    id="nombreMascota"
                                    name="nombreMascota"
                                    type="text"
                                    required
                                    value={formData.nombreMascota}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                    placeholder="Nombre de la mascota"
                                />
                                {checkingPatient ? (
                                    <p className="text-xs text-gray-500 mt-1">Comprobando existencia...</p>
                                ) : patientExists ? (
                                    <p className="text-xs text-red-600 mt-1">Paciente ya registrado para este propietario</p>
                                ) : null}
                            </div>

                            {/* 2. ESPECIE */}
                            <div>
                                <label htmlFor="especie" className="block text-sm font-medium text-gray-700">Especie</label>
                                <input
                                    id="especie"
                                    name="especie"
                                    type="text"
                                    required
                                    value={formData.especie}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                    placeholder="Perro, Gato, etc."
                                />
                            </div>

                            {/* 3. RAZA */}
                            <div>
                                <label htmlFor="raza" className="block text-sm font-medium text-gray-700">Raza</label>
                                <input
                                    id="raza"
                                    name="raza"
                                    type="text"
                                    value={formData.raza}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                    placeholder="Raza de la mascota"
                                />
                            </div>

                            {/* 4. EDAD */}
                            <div>
                                <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad (años)</label>
                                <input
                                    id="edad"
                                    name="edad"
                                    type="number"
                                    min="0"
                                    value={formData.edad}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                    placeholder="Edad en años"
                                />
                            </div>

                            {/* 5. PESO */}
                            <div>
                                <label htmlFor="peso" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                                <input
                                    id="peso"
                                    name="peso"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.peso}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                    placeholder="Peso en kilogramos"
                                />
                            </div>

                            {/* 6. ALTURA */}
                            <div>
                                <label htmlFor="altura" className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                                <input
                                    id="altura"
                                    name="altura"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={formData.altura}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                    placeholder="Altura en centímetros"
                                />
                            </div>

                            {/* 7. CÉDULA DEL PROPIETARIO */}
                            <div className="lg:col-span-3">
                                <h3 className="text-lg font-semibold text-[#C9A8D4] border-b pb-2 mt-4 mb-2">Datos del Propietario</h3>
                                <label htmlFor="cedulaPropietario" className="block text-sm font-medium text-gray-700">Cédula del Propietario</label>
                                <input
                                    id="cedulaPropietario"
                                    name="cedulaPropietario"
                                    type="text"
                                    required
                                    value={formData.cedulaPropietario}
                                    onChange={handleChange}
                                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                                />
                            </div>
                        </div>
                        
                        {/* BOTÓN DE SUBMIT */}
                        <div className="pt-4 flex justify-center">
                            <button
                                type="submit"
                                disabled={loading || patientExists || checkingPatient}
                                className="inline-flex items-center px-6 py-2 rounded-full bg-[#9BCDB0] text-white font-semibold hover:bg-gradient-to-r hover:from-[#9BCDB0] hover:to-[#FF6B6B] transform hover:scale-110 hover:shadow-lg active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B] disabled:bg-[#C3DDD4] transition-transform duration-200 ease-in-out"
                            >
                                {loading ? 'Enviando...' : 'Guardar Registro del Paciente'}
                            </button>
                            {patientExists && (
                                <p className="text-sm text-red-600 mt-2">No se puede registrar: paciente duplicado.</p>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
