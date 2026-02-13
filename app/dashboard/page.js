'use client';

import { useState, useEffect } from 'react';
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
// 1. Rosa Intenso (Principal/Branding): #E9576E
// 2. Turquesa (Acento/Botones): #64C2CE
// 3. Amarillo Pálido (Fondo de Página): #FFEC99 
// 4. Blanco/Crema (Contenedores/Cards): #F8F7F5

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

const iconMap = {
    "Gestión Propietarios": UserGroupSilhouette,
    "Ficha Médica": HeartCrossSilhouette,
    "Crear Pacientes": PawSilhouette,
    "Vacunas": DropSilhouette,
    "Desparasitantes": PillSilhouette,
};


// Componente individual de la tarjeta/opción circular (Sin cambios)
const DashboardCard = ({ title, icon, color, description, link }) => {
    
    const IconComponent = iconMap[title];

    const colorClasses = {
        "rose-intense": { // Rosa Intenso: #E9576E
            mainBg: "bg-[#E9576E]",
            hoverShadow: "hover:shadow-2xl hover:shadow-[#E9576E]/60",
            ring: "focus:ring-[#E9576E]",
            iconColor: "text-white",
            titleColor: "text-[#E9576E]",
        },
        "turquoise-vibrant": { // Turquesa: #64C2CE
            mainBg: "bg-[#64C2CE]",
            hoverShadow: "hover:shadow-2xl hover:shadow-[#64C2CE]/60",
            ring: "focus:ring-[#64C2CE]",
            iconColor: "text-white",
            titleColor: "text-[#64C2CE]",
        },
    };

    const currentColors = colorClasses[color] || colorClasses["rose-intense"]; 

    return (
        <div className="flex flex-col items-center text-center p-2 mt-8">
            <Link href={link}
                className={`
                    group w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-72 lg:h-72 xl:w-80 xl:h-80
                    ${currentColors.mainBg} rounded-full flex items-center justify-center p-4 
                    transition-all duration-300 ease-in-out 
                    transform hover:scale-[1.05] hover:rotate-1
                    shadow-xl
                    hover:shadow-3xl 
                    ${currentColors.hoverShadow} 
                    focus:outline-none focus:ring-4 ${currentColors.ring} mb-4 z-10
                `}
            >
                <div className={`transition duration-300 ${currentColors.iconColor} icon-float 
                                group-hover:scale-[1.2]`}> 
                    {IconComponent ? <IconComponent className="w-1/2 h-1/2 transform transition-transform duration-500 group-hover:scale-[1.18] group-hover:rotate-2" /> : <div className="text-5xl text-white">{icon}</div>}
                </div>
            </Link>
            
            <h3 className={`text-xl sm:text-2xl font-extrabold text-gray-800 mt-5 mb-2 
                           transition duration-300 group-hover:${currentColors.titleColor} group-hover:scale-[1.05]`}>
                {title}
            </h3>
            <p className="text-gray-600 text-sm max-w-[200px]">{description}</p>
        </div>
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
            link: "/dashboard/propietarios"
        },
        {
            title: "Ficha Médica",
            icon: "", 
            color: "turquoise-vibrant", 
            description: "Accede y actualiza el historial clínico completo de cada paciente.",
            link: "/dashboard/fichamedica"
        },
        {
            title: "Crear Pacientes",
            icon: "", 
            color: "rose-intense", 
            description: "Registra nuevas mascotas y asócialas a sus respectivos dueños.",
            link: "/dashboard/crearpacientes"
        },
        {
            title: "Vacunas",
            icon: "", 
            color: "turquoise-vibrant", 
            description: "Programa, registra y da seguimiento a los esquemas de vacunación.",
            link: "/dashboard/vacunas"
        },
        {
            title: "Desparasitantes",
            icon: "", 
            color: "rose-intense", 
            description: "Control de fechas de desparasitación interna y externa.",
            link: "/dashboard/desparacitantes"
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
        <svg className="w-8 h-8 mr-3 text-[#E9576E] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
        </svg>
    );
    
    return (
        // Contenedor principal (fondo provisto por el layout)
        <div className="min-h-screen h-full w-full p-2 sm:p-4 lg:p-6 font-sans">
                        
            {/* Encabezado flotante y estético (Fondo Blanco/Crema) */}
            <header className="mb-6 p-4 sm:p-6 rounded-3xl bg-[#F8F7F5] shadow-2xl flex flex-col lg:flex-row justify-between items-center sticky top-4 z-20 border-b-8 border-[#E9576E]">
                
                {/* Títulos y Bienvenida */}
                <div className="text-center lg:text-left mb-4 lg:mb-0 flex-shrink-0">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[#E9576E] flex items-center justify-center lg:justify-start">
                        <BrandingIcon />
                        Patitas Felices
                    </h1>
                    <p className="text-lg sm:text-xl font-medium text-[#64C2CE] ml-11 mt-1">
                        Dashboard de Administración
                    </p>
                </div>

                {/* Información del Usuario y Botón Logout */}
                <div className="flex items-center space-x-3 sm:space-x-5 flex-wrap justify-center lg:justify-end">
                    {/* Chip de Usuario (USA LA INFORMACIÓN CARGADA) */}
                    <div className="text-left p-3 rounded-xl bg-white border border-[#64C2CE]/50 shadow-md">
                        <p className="text-xs font-bold text-gray-700 uppercase">Bienvenido/a:</p>
                        <p className="text-sm font-bold text-[#E9576E]">{`${userInfo.nombre} ${userInfo.apellido}`}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">Cédula: {userInfo.cedula}</p>
                    </div>

                    {/* Botón de Cerrar Sesión */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-5 py-2.5 text-base font-semibold rounded-full text-white mt-4 lg:mt-0 
                                   bg-[#64C2CE] hover:bg-[#E9576E] 
                                   focus:outline-none focus:ring-4 focus:ring-[#E9576E]/50 
                                   transition duration-200 ease-in-out transform hover:scale-[1.02] shadow-lg"
                    >
                        {/* Ícono de salida en blanco */}
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Cuadrícula de Opciones Circulares (Mayor separación y tamaño) */}
            <div className="pt-0 px-4 sm:px-6 lg:px-8"> 
                <div className="max-w-6xl mx-auto">
                    <div className="dashboard-cards grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-32 gap-x-28 md:gap-x-36 lg:gap-x-40 justify-items-center auto-rows-auto">
                        {cardsData.map((card) => (
                            <DashboardCard key={card.title} {...card} />
                        ))}
                    </div>
                </div>
            </div> 

            {/* Pie de página simple */}
            <footer className="mt-16 text-center text-sm text-gray-500">
                <p className="p-2 border-t border-gray-300/50">
                    © {new Date().getFullYear()} Patitas Felices - Desarrollado para la gestión veterinaria.
                </p>
            </footer>
        </div>
    );
}
