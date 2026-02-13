'use client';

// Página que reusa el componente de registro existente en `app/crearPacientes/page.js`
// De esta forma la ruta `/dashboard/crearpacientes` mostrará el mismo formulario sin duplicar
// lógica de negocio.
import RegistroPaciente from '../../crearPacientes/page';

export default function CrearPacientesDashboard() {
    return (
        <div>
            <RegistroPaciente />
        </div>
    );
}
