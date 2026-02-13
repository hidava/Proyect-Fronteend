'use client';

import { useState, useEffect } from "react";
// Importamos 'useRouter' para la navegación
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
// Asegúrate de que estas utilidades de cookies estén instaladas (cookies-next)
import { setCookie, getCookie } from 'cookies-next';
// Importamos ambas funciones de auth
// ASUMIENDO que estas funciones están en './lib/auth'
import { loginUser, verifyToken } from './lib/auth'; 

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Lógica Corregida y Robusta: Chequea y VALIDA la Cookie al cargar
    useEffect(() => {
        const checkAuth = async () => {
            const MIN_LOADING_MS = 1500; // Duración mínima del mensaje en ms
            const start = Date.now();
            const token = getCookie('authToken');

            if (token) {
                try {
                    // 1. LLAMA A LA FUNCIÓN para verificar si el token es válido
                    const isValid = await verifyToken(token);

                    const elapsed = Date.now() - start;
                    const wait = Math.max(0, MIN_LOADING_MS - elapsed);

                    if (isValid) {
                        // 2. Si es VÁLIDO, espera el mínimo y luego redirige al Dashboard
                        setTimeout(() => router.push('/dashboard'), wait);
                        return;
                    }
                } catch (err) {
                    if (process.env.NODE_ENV !== 'production') console.warn("Error al verificar el token:", err);
                    // deleteCookie('authToken'); // Descomentar si el token inválido no se borra automáticamente
                }
            }

            // 3. Si no hay token, o es inválido, mostramos el formulario pero respetando la duración mínima
            const elapsed = Date.now() - start;
            const wait = Math.max(0, MIN_LOADING_MS - elapsed);
            setTimeout(() => setLoading(false), wait);
        };

        checkAuth();
    }, [router]);

    // Función handleSubmit (Llama a la API de Login)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // NOTA: loginUser ahora devuelve { token, userInfo }
            const { token, userInfo } = await loginUser(email, password);

            // Guardamos el token por 1 día (sin opción "Recuérdame")
            const maxAge = 60 * 60 * 24; // 1 día

            // 1. GUARDA EL TOKEN DE AUTENTICACIÓN
            setCookie('authToken', token, {
                maxAge: maxAge,
                path: '/',
            });

            // 2. GUARDA LA INFORMACIÓN DEL USUARIO (convertida a JSON string)
            // Esta cookie es la que leeremos en el Dashboard
            setCookie('userInfo', JSON.stringify(userInfo), {
                maxAge: maxAge,
                path: '/',
            });

            router.push('/dashboard');

        } catch (err) {
            // Aseguramos que el error sea un string
            setError(err.message || "Error desconocido al iniciar sesión."); 
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFEC99] paws-bg py-12 px-4 sm:px-6 lg:px-8">
                <div className="tilt-card rounded-3xl bg-[#F8F7F5] shadow-2xl border-b-8 border-[#E9576E] p-8 sm:p-12 max-w-md text-center">
                    <h1 className="text-3xl font-extrabold text-[#E9576E] flex items-center justify-center">
                        Patitas Felices
                    </h1>
                    <p className="mt-3 text-lg text-[#64C2CE]">Verificando sesión. Por favor, espera...</p>
                </div>
            </div>
        );
    }

    // El JSX del formulario de Login (Ingreso) — Estilo inspirado en Dashboard

    const BrandingIcon = () => (
        <svg className="w-10 h-10 mr-3 text-[#E9576E] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
        </svg>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFEC99] paws-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl w-full">
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
                        {/* Floating decorative paws */}
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
                        <p className="mt-2 text-lg text-[#64C2CE]">Dashboard de Administración </p>
                    </div>

                    <div className="w-full md:w-1/2">
                        {error && (
                            <div className="text-center text-sm text-red-600 font-medium p-3 bg-red-100 border border-red-300 rounded-md mb-4">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* INPUT EMAIL */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
                                        Correo Electronico
                                    </label>
                                    <div className="relative">
                                        <span className="input-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l9 6 9-6M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/></svg>
                                        </span>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-1 appearance-none block w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#64C2CE] focus:border-[#64C2CE] sm:text-sm"
                                            placeholder="Ingresa tu correo electronico"
                                        />
                                    </div>
                                </div>
                                {/* INPUT PASSWORD */}
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <span className="input-icon absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3V6a3 3 0 0 0-6 0v2c0 1.657 1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/></svg>
                                        </span>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="mt-1 appearance-none block w-full pl-10 pr-10 px-4 py-3 border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#64C2CE] focus:border-[#64C2CE] sm:text-sm"
                                            placeholder="Ingresa tu contraseña"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="eye-toggle absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                        >
                                            {showPassword ? (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-7 0-11-7-11-7a15.707 15.707 0 0 1 5-5.5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18"/></svg>
                                            ) : (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ¿Olvidaste tu contraseña? (alineado a la derecha) */}
                            <div className="flex items-center justify-end mb-2">
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-[#64C2CE] hover:text-[#57aab1]">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                            </div> 

                            {/* BOTÓN DE SUBMIT */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full flex items-center justify-center gap-3 py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-[#64C2CE] hover:bg-[#E9576E] focus:outline-none focus:ring-4 focus:ring-[#E9576E]/50 disabled:bg-[#64C2CE]/50 transition duration-200 ease-in-out shadow-lg"
                                >
                                    <span className="transition-transform duration-200 transform">{loading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
                                    <span className="ml-2 paw-emoji opacity-0 group-hover:opacity-100 transition-opacity duration-200">🐾</span>
                                </button>
                            </div>

                            {/* ENLACE A REGISTRO */}
                            <div className="text-center">
                                <p className="mt-2 text-sm text-gray-600">
                                    ¿No tienes una cuenta?{' '}
                                    <Link href="/register" className="font-medium text-[#E9576E] hover:text-[#C94a60]">
                                        Regístrate
                                    </Link>
                                </p>
                            </div>
                        </form>
                        </div> {/* tilt-card */}
                    </div> {/* tilt-wrapper */}
                </div>
            </div>
        </div>
    );
}
