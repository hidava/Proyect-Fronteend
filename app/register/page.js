'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// 🛑 Importamos SOLO la función de registro
import { registerUser } from '../lib/auth';

// Componente para la página de Registro
export default function RegisterPage() {
    const router = useRouter();

    // Estados para todos los campos de registro requeridos
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        cedula: '',
        telefono: '',
        direccion: '',
        password: '',
        confirmPassword: '' // Para validación en frontend
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Manejador de cambios de input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Función handleSubmit (Llama a la API de Registro)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validación de contraseña en el frontend
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            // 1. LLAMADA A LA API de Registro
            await registerUser(formData);

            // 2. Éxito: Redirige al Login (ruta '/')
            router.push('/?registrationSuccess=true');

        } catch (err) {
            // 3. MANEJO DE ERROR
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // El JSX del formulario de Registro
    const BrandingIcon = () => (
        <svg className="w-10 h-10 mr-3 text-[#E9576E] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
        </svg>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFEC99] paws-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full">
                <div
                    className="tilt-wrapper group relative"
                    onMouseMove={(e) => {
                        const el = e.currentTarget;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;
                        const rx = (y - 0.5) * 6;
                        const ry = (x - 0.5) * -6;
                        el.style.setProperty('--rx', `${rx}deg`);
                        el.style.setProperty('--ry', `${ry}deg`);
                    }}
                    onMouseLeave={(e) => {
                        const el = e.currentTarget;
                        el.style.setProperty('--rx', `0deg`);
                        el.style.setProperty('--ry', `0deg`);
                    }}
                >
                    <div className="tilt-card rounded-3xl bg-[#F8F7F5] shadow-2xl border-b-8 border-[#E9576E] p-8 sm:p-12 flex flex-col md:flex-row items-center transform-gpu">
                        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
                            <svg className="floating-paw paw-1 text-[#E9576E]" viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                                <g fill="currentColor" opacity="0.08">
                                    <path d="M20 8c-4 0-6.5 4-6.5 7s2.5 6 6.5 6 6.5-3 6.5-6-2.5-7-6.5-7zm10 18c-6 0-14 5-14 14 0 9 6 14 14 14s14-5 14-14c0-9-8-14-14-14zM46 8c-4 0-6.5 4-6.5 7S42 21 46 21s6.5-3 6.5-6-2.5-7-6.5-7z"/>
                                </g>
                            </svg>
                            <svg className="floating-paw paw-2 text-[#E9576E]" viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                                <g fill="currentColor" opacity="0.08">
                                    <path d="M20 8c-4 0-6.5 4-6.5 7s2.5 6 6.5 6 6.5-3 6.5-6-2.5-7-6.5-7z"/>
                                </g>
                            </svg>
                            <svg className="floating-paw paw-3 text-[#E9576E]" viewBox="0 0 64 64" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                                <g fill="currentColor" opacity="0.08">
                                    <path d="M12 24c-3 0-5 2-5 4s2 4 5 4 5-2 5-4-2-4-5-4z"/>
                                </g>
                            </svg>
                        </div>

                        <div className="w-full md:w-1/2 text-center md:text-left mb-6 md:mb-0">
                            <h1 className="text-4xl font-extrabold text-[#E9576E] flex items-center justify-center md:justify-start">
                                <BrandingIcon /> Patitas Felices
                            </h1>
                            <p className="mt-2 text-lg text-[#64C2CE]">Crea tu cuenta de administrador</p>
                            <p className="mt-3 text-sm text-gray-600">
                                Completa los datos para habilitar el acceso al sistema.
                            </p>
                        </div>

                        <div className="w-full md:w-1/2">
                            {error && (
                                <div className="text-center text-sm text-red-600 font-medium p-3 bg-red-100 border border-red-300 rounded-md mb-4">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input label="Nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required={true} />
                                    <Input label="Apellido" name="apellido" type="text" value={formData.apellido} onChange={handleChange} required={true} />

                                    <Input wrapperClassName="sm:col-span-2" label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} required={true} />

                                    <Input label="Cédula" name="cedula" type="text" value={formData.cedula} onChange={handleChange} required={true} />
                                    <Input label="Teléfono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} required={true} />

                                    <Input wrapperClassName="sm:col-span-2" label="Dirección" name="direccion" type="text" value={formData.direccion} onChange={handleChange} required={true} />

                                    <Input label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} required={true} />
                                    <Input label="Confirmar Contraseña" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required={true} />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-[#64C2CE] hover:bg-[#E9576E] focus:outline-none focus:ring-4 focus:ring-[#E9576E]/50 disabled:bg-[#64C2CE]/50 transition duration-200 ease-in-out shadow-lg"
                                    >
                                        <span className="transition-transform duration-200 transform">{loading ? 'Registrando...' : 'Registrar Cuenta'}</span>
                                        <span className="ml-2 paw-emoji opacity-0 group-hover:opacity-100 transition-opacity duration-200">🐾</span>
                                    </button>
                                </div>

                                <div className="text-center">
                                    <p className="mt-2 text-sm text-gray-600">
                                        ¿Ya tienes una cuenta?{' '}
                                        <Link href="/" className="font-medium text-[#E9576E] hover:text-[#C94a60]">
                                            Iniciar Sesión
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente helper para el input (para mantener el código limpio)
const Input = ({ label, name, type, value, onChange, required, wrapperClassName = '' }) => (
    <div className={wrapperClassName}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 sr-only">
            {label}
        </label>
        <input
            id={name}
            name={name}
            type={type}
            required={required}
            value={value}
            onChange={onChange}
            className="mt-1 appearance-none block w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#64C2CE] focus:border-[#64C2CE] sm:text-sm"
            placeholder={`Ingresa tu ${label.toLowerCase()}`}
        />
    </div>
);
