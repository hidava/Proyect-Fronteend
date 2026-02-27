'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// Se mantienen las funciones nativas para el manejo de cookies, ya que las librerías externas causan problemas en este entorno.

// === FUNCIONES NATIVAS PARA GESTIÓN DE COOKIES (Sin cambios) ===

/**
 * Función nativa para leer el valor de una cookie por su nombre.
 * @param {string} name El nombre de la cookie.
 * @returns {string | null} El valor de la cookie o null si no se encuentra.
 */
const getNativeCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
};

/**
 * Función nativa para eliminar una cookie estableciendo su fecha de caducidad en el pasado.
 * @param {string} name El nombre de la cookie a eliminar.
 */
const deleteNativeCookie = (name) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

// === PALETA DE COLORES REFINADA ===
// 1. Morado Pastel (Principal/Branding): #C9A8D4
// 2. Verde Menta (Acento/Botones): #9BCDB0
// 3. Amarillo Pastel (Fondo de Página): #FFF9E6
// 4. Coral Vívido (Acento Vibrante): #FF6B6B 
// 5. Blanco/Crema (Contenedores/Cards): #F8F7F5

// --- Componentes SVG Silhouette (Sin cambios) ---

const UserGroupSilhouette = (props) => (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM20 21H22V20C22 17.57 20.47 15.35 17.59 14.43C19.06 13.56 20 12.08 20 10.5V9H18V10.5C18 11.53 17.38 12.44 16.5 13.06C14.94 14.15 13.06 15 12 15C10.94 15 9.06 14.15 7.5 13.06C6.62 12.44 6 11.53 6 10.5V9H4V10.5C4 12.08 4.94 13.56 6.41 14.43C3.53 15.35 2 17.57 2 20V21H20Z"/>
    </svg>
);

const HeartCrossSilhouette = (props) => (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35ZM12 7H10V9H8V11H10V13H12V11H14V9H12V7Z"/>
    </svg>
);

const PawSilhouette = (props) => (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="M12 13C12 16.31 9.31 19 6 19C2.69 19 0 16.31 0 13C0 9.69 2.69 7 6 7C7.8 7 9.47 7.78 10.61 9H13.39C14.53 7.78 16.2 7 18 7C21.31 7 24 9.69 24 13C24 16.31 21.31 19 18 19C14.69 19 12 16.31 12 13ZM12 3C11 3 10 3.89 10 5C10 6.11 11 7 12 7C13 7 14 6.11 14 5C14 3.89 13 3 12 3ZM5 3C4 3 3 3.89 3 5C3 6.11 4 7 5 7C6 7 7 6.11 7 5C7 3.89 6 3 5 3ZM19 3C18 3 17 3.89 17 5C17 6.11 18 7 19 7C20 7 21 6.11 21 5C21 3.89 20 3 19 3Z"/>
    </svg>
);

const DropSilhouette = (props) => (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="M12 21.5C14.76 21.5 17 19.31 17 16.5C17 13.72 14.76 11.5 12 11.5C9.24 11.5 7 13.72 7 16.5C7 19.31 9.24 21.5 12 21.5ZM12 9.5C14.21 9.5 16 7.71 16 5.5V3H8V5.5C8 7.71 9.79 9.5 12 9.5Z"/>
    </svg>
);

const PillSilhouette = (props) => (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="M18.5 2C19.33 2 20 2.67 20 3.5V10.5C20 11.33 19.33 12 18.5 12H5.5C4.67 12 4 11.33 4 10.5V3.5C4 2.67 4.67 2 5.5 2H18.5ZM12 16.5C12 18.43 10.43 20 8.5 20H3.5C2.67 20 2 19.33 2 18.5V16.5H4V18.5H8.5V16.5C8.5 14.57 10.07 13 12 13C13.93 13 15.5 14.57 15.5 16.5V18.5H19.5V16.5H22V18.5C22 19.33 21.33 20 20.5 20H15.5C13.57 20 12 18.43 12 16.5Z"/>
    </svg>
);

const CalendarSilhouette = (props) => (
    <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="M19 4H18V2H16V4H8V2H6V4H5C3.89 4 3 4.9 3 6V20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V10H19V20ZM19 8H5V6H19V8ZM7 12H12V17H7V12Z"/>
    </svg>
);

const iconMap = {
    "Gestión Propietarios": UserGroupSilhouette,
    "Ficha Médica": HeartCrossSilhouette,
    "Crear Pacientes": PawSilhouette,
    "Vacunas": DropSilhouette,
    "Desparasitantes": PillSilhouette,
    "Citas": CalendarSilhouette,
};


// Componente individual de la tarjeta/opción (estilo dashboard mejorado)
const DashboardCard = ({ title, icon, color, description, link }) => {
    const IconComponent = iconMap[title];

    const colorClasses = {
        "rose-intense": { // Morado Pastel: #C9A8D4
            accent: "bg-[#C9A8D4]",
            accentHex: "#C9A8D4",
            ring: "focus:ring-[#C9A8D4]",
            bgGradient: "from-[#C9A8D4]/30 via-[#C9A8D4]/15 to-white",
            iconBg: "bg-gradient-to-br from-[#C9A8D4]/40 to-[#C9A8D4]/20",
            iconColor: "text-white",
            badge: "text-white",
            glow: "group-hover:shadow-[0_0_50px_rgba(201,168,212,0.6),0_20px_70px_rgba(201,168,212,0.4)]",
        },
        "turquoise-vibrant": { // Verde Menta: #9BCDB0
            accent: "bg-[#9BCDB0]",
            accentHex: "#9BCDB0",
            ring: "focus:ring-[#9BCDB0]",
            bgGradient: "from-[#9BCDB0]/30 via-[#9BCDB0]/15 to-white",
            iconBg: "bg-gradient-to-br from-[#9BCDB0]/40 to-[#9BCDB0]/20",
            iconColor: "text-white",
            badge: "text-white",
            glow: "group-hover:shadow-[0_0_50px_rgba(155,205,176,0.6),0_20px_70px_rgba(155,205,176,0.4)]",
        },
        "coral-vivid": { // Coral Vívido: #FF6B6B
            accent: "bg-[#FF6B6B]",
            accentHex: "#FF6B6B",
            ring: "focus:ring-[#FF6B6B]",
            bgGradient: "from-[#FF6B6B]/30 via-[#FF6B6B]/15 to-white",
            iconBg: "bg-gradient-to-br from-[#FF6B6B]/40 to-[#FF6B6B]/20",
            iconColor: "text-white",
            badge: "text-white",
            glow: "group-hover:shadow-[0_0_50px_rgba(255,107,107,0.6),0_20px_70px_rgba(255,107,107,0.4)]",
        },
    };

    const currentColors = colorClasses[color] || colorClasses["rose-intense"]; 

    return (
        <Link
            href={link}
            className={`
                group relative flex flex-col items-center text-center
                w-full aspect-square rounded-full 
                bg-gradient-to-br ${currentColors.bgGradient}
                shadow-[0_10px_40px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05)]
                transition-all duration-600 ease-out
                hover:-translate-y-4 hover:scale-110
                ${currentColors.glow}
                focus:outline-none focus:ring-4 ${currentColors.ring}
                overflow-visible
                p-4 sm:p-6
            `}
        >
            {/* Anillo decorativo animado */}
            <div className={`
                absolute inset-0 rounded-full ${currentColors.accent}
                opacity-0 scale-90 blur-md
                group-hover:opacity-40 group-hover:scale-110 group-hover:blur-xl
                transition-all duration-600
            `} />
            
            {/* Gradiente de fondo decorativo */}
            <div 
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ 
                    background: `radial-gradient(circle at center, ${currentColors.accentHex}, transparent 70%)`
                }}
            />

            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                {/* Icono con animación mejorada */}
                <div className={`
                    inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full
                    ${currentColors.accent}
                    transform transition-all duration-600
                    group-hover:scale-140 group-hover:rotate-[360deg]
                    shadow-xl group-hover:shadow-2xl
                    mb-2
                `}>
                    {IconComponent ? (
                        <IconComponent className={`
                            w-6 h-6 sm:w-7 sm:h-7 ${currentColors.iconColor}
                            transition-all duration-600
                            group-hover:scale-110
                        `} />
                    ) : (
                        <div className={`text-xl sm:text-2xl font-bold ${currentColors.iconColor}`}>{icon}</div>
                    )}
                </div>

                {/* Título con efecto */}
                <h3 className={`
                    text-xs sm:text-sm font-extrabold text-gray-900
                    transition-all duration-300 
                    group-hover:scale-110
                    mb-1
                `}>
                    {title}
                </h3>
                
                {/* Badge animado */}
                <span className={`
                    text-[8px] sm:text-[9px] font-bold uppercase tracking-wider 
                    ${currentColors.accent} ${currentColors.badge}
                    px-2 py-0.5 rounded-full
                    opacity-90 group-hover:opacity-100
                    transform transition-all duration-300
                    group-hover:scale-125
                    shadow-md
                `}>
                    Ver →
                </span>
            </div>

            {/* Efecto de brillo giratorio */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-spin" style={{ animationDuration: '3s' }} />
            
            {/* Partículas de luz */}
            <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-80 transition-all duration-500 blur-sm" />
            <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-60 transition-all duration-700 blur-sm" />
        </Link>
    );
};

export default function Dashboard() {
    
    const defaultUserInfo = {
        cedula: 'N/A', 
        nombre: 'Usuario',
        apellido: 'No Identificado',
    };
    
    const [userInfo, setUserInfo] = useState(defaultUserInfo);

    // Lógica para cargar los datos del usuario de la cookie al inicio
    useEffect(() => {
        // Usamos la función nativa para obtener la cookie
        const userInfoCookie = getNativeCookie('userInfo');
        
        // === CORRECCIÓN CLAVE ===
        // 1. Verifica si la cookie existe.
        // 2. Verifica si el contenido de la cookie NO es una cadena vacía, lo cual causaba el error de sintaxis.
        if (userInfoCookie && userInfoCookie.trim() !== '') {
            try {
                // Parseamos el string JSON de vuelta a un objeto
                const userData = JSON.parse(userInfoCookie);
                setUserInfo(userData);
            } catch (error) {
                // Captura errores de JSON.parse() para cookies corruptas.
                if (process.env.NODE_ENV !== 'production') console.warn("Error al parsear la cookie 'userInfo':", error);
                // Si la cookie está corrupta, la borramos para evitar problemas futuros.
                deleteNativeCookie('userInfo'); 
                // Establece la información del usuario en el valor por defecto
                setUserInfo(defaultUserInfo);
            }
        }
    }, []);

    // Definimos las tarjetas solicitadas (Sin cambios)
    const cardsData = [
        {
            title: "Gestión Propietarios",
            icon: "", 
            color: "rose-intense", 
            description: "Administra la información de contacto y cuentas de los dueños de mascotas.",
            link: "/GestionPropietarios"
        },
        {
            title: "Ficha Médica",
            icon: "", 
            color: "coral-vivid", 
            description: "Accede y actualiza el historial clínico completo de cada paciente.",
            link: "/dashboard/fichamedica"
        },
        {
            title: "Crear Pacientes",
            icon: "", 
            color: "turquoise-vibrant", 
            description: "Registra nuevas mascotas y asócialas a sus respectivos dueños.",
            link: "/dashboard/crearpacientes"
        },
        {
            title: "Vacunas",
            icon: "", 
            color: "coral-vivid", 
            description: "Programa, registra y da seguimiento a los esquemas de vacunación.",
            link: "/vacunas"
        },
        {
            title: "Desparasitantes",
            icon: "", 
            color: "rose-intense", 
            description: "Control de fechas de desparasitación interna y externa.",
            link: "/desparacitantes"
        },
        {
            title: "Citas",
            icon: "", 
            color: "turquoise-vibrant", 
            description: "Agenda y gestiona las citas de los pacientes.",
            link: "/citas"
        },
    ];

    // Manejador para el cierre de sesión (Borra ambas cookies usando las funciones nativas)
    const handleLogout = () => {
        try {
            deleteNativeCookie('authToken'); 
            deleteNativeCookie('userInfo'); 
            
            // Redirige al login
            window.location.href = '/'; 
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') console.warn("Error al intentar cerrar sesión:", error);
            window.location.href = '/'; 
        }
    };

    // Ícono de identificación de marca (simplificado)
    const BrandingIcon = () => (
        <svg className="w-8 h-8 mr-3 text-[#FF6B6B] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
        </svg>
    );
    
    return (
        // Contenedor principal (fondo provisto por el layout)
        <div className="min-h-screen h-full w-full p-2 sm:p-4 lg:p-6 font-sans flex flex-col">
                        
            {/* Imagen destacada */}
            <div className="px-2 sm:px-3 lg:px-4 relative z-30">
                <div className="w-full -mb-12 sm:-mb-16 -mt-12 sm:-mt-16 lg:-mt-20">
                        <div className="group relative rounded-3xl bg-transparent">
                            <div className="relative flex items-center justify-center">
                                <div className="w-full h-40 sm:h-48">
                                    <Image
                                        src="/perro.png"
                                        alt="Perro ilustracion"
                                        width={520}
                                        height={260}
                                        priority
                                        className="h-full w-full object-contain scale-x-[1.4] scale-y-[1.15] transition-transform duration-300 ease-out group-hover:scale-x-[1.45] group-hover:scale-y-[1.18] group-hover:-rotate-1"
                                    />
                                </div>
                            </div>
                        </div>
                </div>
            </div>

            {/* Encabezado flotante y estético (Fondo Blanco/Crema) */}
            <header className="mb-4 p-2 sm:p-2 pt-8 sm:pt-10 rounded-3xl bg-[#F8F7F5] shadow-2xl flex flex-col lg:flex-row justify-between items-center sticky top-4 z-10 border-b-8 border-[#C9A8D4] gap-4">
                
                {/* Información del Usuario a la IZQUIERDA */}
                <div className="text-left p-4 sm:p-5 rounded-xl bg-white border border-[#9BCDB0]/50 shadow-md flex-shrink-0 min-w-[200px] sm:min-w-[280px]">
                    <p className="text-sm sm:text-base font-bold text-gray-700 uppercase mb-1">Bienvenido/a:</p>
                    <p className="text-lg sm:text-xl font-bold text-[#C9A8D4] mb-2">{`${userInfo.nombre} ${userInfo.apellido}`}</p>
                    <p className="text-sm sm:text-base font-medium text-gray-500">Cédula: {userInfo.cedula}</p>
                </div>

                {/* Títulos y Bienvenida en el CENTRO */}
                <div className="text-center flex-grow -translate-x-16">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#FF6B6B] flex items-center justify-center">
                        <BrandingIcon />
                        Patitas Felices
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl font-medium text-[#9BCDB0] mt-2">
                        Dashboard de Administración
                    </p>
                </div>

                {/* Botón de Cerrar Sesión a la DERECHA */}
                <div className="flex-shrink-0 self-end">
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm font-semibold rounded-full text-white
                                   bg-[#9BCDB0] hover:bg-[#204051] 
                                   focus:outline-none focus:ring-4 focus:ring-[#204051]/50 
                                   transition duration-200 ease-in-out transform hover:scale-[1.02] shadow-lg"
                    >
                        {/* Ícono de salida en blanco */}
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Cuadrícula de Opciones */}
            <div className="pt-0 px-4 sm:px-6 lg:px-8 mt-[4.25rem] sm:mt-[4.5rem]"> 
                <div className="max-w-[1600px] mx-auto">
                    <div className="dashboard-cards grid grid-cols-3 sm:grid-cols-6 gap-6 sm:gap-8 lg:gap-10 justify-items-center">
                        {cardsData.map((card) => (
                            <DashboardCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>
            </div> 

            {/* Pie de página simple */}
            <footer className="mt-auto text-center text-sm text-gray-500 pt-12">
                <p className="p-2 border-t border-gray-300/50">
                    © {new Date().getFullYear()} Patitas Felices - Desarrollado para la gestión veterinaria.
                </p>
            </footer>
        </div>
    );
}
