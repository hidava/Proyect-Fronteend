import { cookies } from 'next/headers'; 
import { redirect } from 'next/navigation';

// Colores: Azul Petróleo (#204051), Verde Menta (#9BCDB0), Amarillo-Verde (#D4E09B)
// 🛑 IMPORTANTE: Un layout que usa cookies() o headers() debe ser ASYNC
export default async function DashboardLayout({ children }) {
    
    // 1. OBTENER LAS COOKIES DEL SERVIDOR
    // Lectura directa de la cookie, dentro de la función async, para evitar el warning.
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value; 
    
    // 2. LÓGICA DE REDIRECCIÓN (PROTECCIÓN)
    if (!token) {
        // Redirecciona al login si no hay token
        redirect('/'); 
    }

    // 3. SI HAY TOKEN, RENDERIZAR EL CONTENIDO
    return (
        // El layout solo provee la estructura base y el encabezado
        <section className="bg-[#FFF9E6] paws-bg min-h-screen">
            <header className="bg-[#C9A8D4] shadow-xl">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-white">
                        Veterinaria Patitas Felices
                    </h1>
                </div>
            </header>
            
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </section>
    );
}
