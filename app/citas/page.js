'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CitasPage() {
  const router = useRouter();

  // Estado para lista de citas
  const [citas, setCitas] = useState([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [errorCitas, setErrorCitas] = useState('');

  // Estado para formulario multi-paso
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [savingCita, setSavingCita] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Paso 1: Selección de propietario y mascota
  const [cedula, setCedula] = useState('');
  const [propietarioInfo, setPropietarioInfo] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState('');
  const [errorPropietario, setErrorPropietario] = useState('');
  const [loadingPropietario, setLoadingPropietario] = useState(false);

  // Paso 2: Información de sede (solo lectura)
  const sede = 'Patitas Felices Alajuela';
  const horaCierre = '06:00 PM';

  // Paso 3: Calendario y horarios
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Paso 4: Descripción
  const [descripcion, setDescripcion] = useState('');

  // Referencia para scroll automático
  const formRef = React.useRef(null);

  // Cargar citas existentes
  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoadingCitas(true);
      setErrorCitas('');
      const res = await fetch('/api/citas/list');
      const data = await res.json();

      if (data.success) {
        setCitas(data.data || []);
      } else {
        setErrorCitas(data.message || 'No se pudieron cargar las citas');
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
      setErrorCitas('Error al cargar las citas');
    } finally {
      setLoadingCitas(false);
    }
  };

  // Buscar propietario por cédula y sus mascotas
  const buscarPropietario = async (e) => {
    e.preventDefault();

    if (!cedula.trim()) {
      setErrorPropietario('Ingrese una cédula');
      return;
    }

    try {
      setLoadingPropietario(true);
      setErrorPropietario('');
      setPropietarioInfo(null);
      setMascotas([]);
      setMascotaSeleccionada('');

      // Buscar propietario
      const resPropietario = await fetch(`/api/proprietarios?cedula=${cedula}`);
      const dataPropietario = await resPropietario.json();

      if (!dataPropietario.success || !dataPropietario.data || dataPropietario.data.length === 0) {
        setErrorPropietario('No existen propietarios asociados a esa cédula');
        return;
      }

      const propietario = dataPropietario.data[0];
      setPropietarioInfo(propietario);

      // Cargar mascotas del propietario
      const resMascotas = await fetch(`/api/pacientes?propietario=${cedula}`);
      const dataMascotas = await resMascotas.json();

      if (dataMascotas.success && dataMascotas.data) {
        setMascotas(dataMascotas.data);
        if (dataMascotas.data.length === 0) {
          setErrorPropietario('Este propietario no tiene mascotas registradas');
        }
      }
    } catch (error) {
      console.error('Error buscando propietario:', error);
      setErrorPropietario('Error al buscar propietario');
    } finally {
      setLoadingPropietario(false);
    }
  };

  // Cargar horarios disponibles para una fecha
  const cargarHorarios = async (fecha) => {
    if (!fecha) return;

    try {
      setLoadingHorarios(true);
      setHoraSeleccionada('');
      const res = await fetch(`/api/citas/horarios/${fecha}`);
      const data = await res.json();

      if (data.success) {
        setHorariosDisponibles(data.data || []);
      } else {
        setHorariosDisponibles([]);
      }
    } catch (error) {
      console.error('Error cargando horarios:', error);
      setHorariosDisponibles([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleFechaChange = (e) => {
    const fecha = e.target.value;
    setFechaSeleccionada(fecha);
    cargarHorarios(fecha);
  };

  // Avanzar al siguiente paso
  const handleSiguiente = () => {
    if (step === 1) {
      if (!propietarioInfo) {
        setErrorPropietario('Seleccione un propietario válido');
        return;
      }
      if (!mascotaSeleccionada) {
        setErrorPropietario('Seleccione una mascota');
        return;
      }
    }

    if (step === 2) {
      // Paso 2 no requiere validación, solo muestra info
    }

    if (step === 3) {
      if (!fechaSeleccionada) {
        alert('Seleccione una fecha');
        return;
      }
      if (!horaSeleccionada) {
        alert('Seleccione una hora');
        return;
      }
    }

    setStep(step + 1);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Retroceder
  const handleAtras = () => {
    if (step > 1) {
      setStep(step - 1);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Guardar cita
  const handleGuardarCita = async () => {
    if (!descripcion.trim()) {
      alert('Ingrese una descripción de la cita');
      return;
    }

    try {
      setSavingCita(true);

      const res = await fetch('/api/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propietarios_cedula: parseInt(propietarioInfo.cedula),
          pacientes_id_mascota: parseInt(mascotaSeleccionada),
          fecha_cita: fechaSeleccionada,
          hora_cita: horaSeleccionada,
          descripcion: descripcion,
          sede: sede
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage('¡Cita guardada exitosamente!');
        setTimeout(() => setSuccessMessage(''), 2000);

        // Limpiar formulario y recargar citas
        setCedula('');
        setPropietarioInfo(null);
        setMascotas([]);
        setMascotaSeleccionada('');
        setFechaSeleccionada('');
        setHoraSeleccionada('');
        setDescripcion('');
        setStep(1);
        setShowForm(false);
        cargarCitas();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error guardando cita:', error);
      alert('Error al guardar la cita');
    } finally {
      setSavingCita(false);
    }
  };

  // Obtener fecha mínima (hoy)
  const hoy = new Date();
  const fechaMinima = hoy.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F7F5] to-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#C9A8D4] mb-2">📅 Gestión de Citas</h1>
        <p className="text-gray-600">Agenda y gestiona las citas veterinarias de tus mascotas</p>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="max-w-6xl mx-auto mb-4 p-4 bg-green-100 border-l-4 border-[#9BCDB0] text-[#9BCDB0] rounded">
          ✓ {successMessage}
        </div>
      )}

      {/* Botón Nueva Cita */}
      {!showForm && (
        <div className="max-w-6xl mx-auto mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#C9A8D4] to-[#A88FC9] text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            + Nueva Cita
          </button>
        </div>
      )}

      {/* Formulario Multi-Paso */}
      {showForm && (
        <div ref={formRef} className="max-w-2xl mx-auto mb-8 bg-[#F8F7F5] rounded-xl border-b-4 border-[#C9A8D4] shadow-lg p-6 sm:p-8">
          {/* Indicadores de paso */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((p) => (
              <div key={p} className={`flex flex-col items-center flex-1 ${p < 4 ? 'pb-4' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  p === step 
                    ? 'bg-[#C9A8D4] text-white scale-110' 
                    : p < step 
                    ? 'bg-[#9BCDB0] text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {p}
                </div>
                <span className="text-xs mt-2 text-gray-600 font-medium">
                  {p === 1 ? 'Propietario' : p === 2 ? 'Sede' : p === 3 ? 'Fecha/Hora' : 'Descripción'}
                </span>
              </div>
            ))}
          </div>

          {/* PASO 1: Propietario y Mascota */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Seleccione Propietario y Mascota</h2>

              {/* Búsqueda de propietario */}
              <form onSubmit={buscarPropietario} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cédula del Propietario:
                  </label>
                  <input
                    type="number"
                    value={cedula}
                    onChange={(e) => {
                      setCedula(e.target.value);
                      setErrorPropietario('');
                    }}
                    placeholder="Ingrese la cédula"
                    className="w-full px-4 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none focus:border-[#A88FC9] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingPropietario}
                  className="w-full px-4 py-2 bg-[#9BCDB0] text-white font-bold rounded-lg hover:bg-[#88b89e] transition-colors disabled:opacity-50"
                >
                  {loadingPropietario ? 'Buscando...' : 'Buscar Propietario'}
                </button>
              </form>

              {errorPropietario && (
                <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                  ⚠️ {errorPropietario}
                </div>
              )}

              {propietarioInfo && (
                <div className="p-4 bg-white rounded-lg border-2 border-[#9BCDB0]">
                  <h3 className="font-bold text-[#C9A8D4] mb-2">Propietario Encontrado:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Nombre:</strong> {propietarioInfo.nombre} {propietarioInfo.apellido}</p>
                    <p><strong>Cédula:</strong> {propietarioInfo.cedula}</p>
                    <p><strong>Teléfono:</strong> {propietarioInfo.telefono}</p>
                  </div>
                </div>
              )}

              {mascotas.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Seleccione Mascota:
                  </label>
                  <select
                    value={mascotaSeleccionada}
                    onChange={(e) => setMascotaSeleccionada(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none focus:border-[#A88FC9] bg-white"
                  >
                    <option value="">-- Seleccione una mascota --</option>
                    {mascotas.map((mascota) => (
                      <option key={mascota.id_mascota} value={mascota.id_mascota}>
                        {mascota.nombre} ({mascota.especie} - {mascota.raza})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Información de Sede */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ubicación de la Cita</h2>

              <div className="p-6 bg-white rounded-lg border-2 border-[#9BCDB0] space-y-4">
                <div className="text-center">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-[#C9A8D4] to-[#A88FC9] text-white rounded-lg font-bold text-lg">
                    🏥 {sede}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-center text-gray-700">
                    <strong>Hora de Cierre:</strong> <span className="text-[#C9A8D4] text-lg font-bold">{horaCierre}</span>
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                  <p className="text-sm text-gray-700">
                    ℹ️ Las citas disponibles están dentro del horario de atención de la sede.
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600 italic p-3 bg-yellow-50 rounded">
                ✓ Mascota seleccionada: {mascotas.find(m => m.id_mascota === parseInt(mascotaSeleccionada))?.nombre}
              </div>
            </div>
          )}

          {/* PASO 3: Calendario y Horarios */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Seleccione un día para su cita</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha:
                </label>
                <input
                  type="date"
                  value={fechaSeleccionada}
                  onChange={handleFechaChange}
                  min={fechaMinima}
                  className="w-full px-4 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none focus:border-[#A88FC9]"
                />
              </div>

              {fechaSeleccionada && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Horarios Disponibles:
                  </label>

                  {loadingHorarios && (
                    <p className="text-center text-gray-500">Cargando horarios...</p>
                  )}

                  {!loadingHorarios && horariosDisponibles.length === 0 && (
                    <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                      ⚠️ No hay horarios disponibles para esta fecha
                    </div>
                  )}

                  {!loadingHorarios && horariosDisponibles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {horariosDisponibles.map((horario) => (
                        <button
                          key={horario.hora}
                          onClick={() => setHoraSeleccionada(horario.hora)}
                          className={`p-3 rounded-lg font-semibold transition-all ${
                            horaSeleccionada === horario.hora
                              ? 'bg-[#C9A8D4] text-white scale-105'
                              : 'bg-white border-2 border-[#C9A8D4] text-[#C9A8D4] hover:bg-[#F8F7F5]'
                          }`}
                        >
                          {horario.hora.substring(0, 5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PASO 4: Descripción */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Motivo de la Cita</h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción/Motivo:
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describa el motivo de la cita (ej: Revisión general, Vacunación, Limpieza dental, etc.)"
                  rows="5"
                  className="w-full px-4 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none focus:border-[#A88FC9] resize-none"
                />
              </div>

              {/* Resumen de la cita */}
              <div className="p-4 bg-white rounded-lg border-2 border-[#9BCDB0] space-y-2 text-sm">
                <h3 className="font-bold text-[#C9A8D4] mb-3">Resumen de su Cita:</h3>
                <p><strong>Propietario:</strong> {propietarioInfo.nombre} {propietarioInfo.apellido}</p>
                <p><strong>Mascota:</strong> {mascotas.find(m => m.id_mascota === parseInt(mascotaSeleccionada))?.nombre}</p>
                <p><strong>Fecha:</strong> {new Date(fechaSeleccionada).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Hora:</strong> {horaSeleccionada.substring(0, 5)}</p>
                <p><strong>Sede:</strong> {sede}</p>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-300">
            <div>
              {step > 1 && (
                <button
                  onClick={handleAtras}
                  className="px-6 py-2 bg-gray-400 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors"
                >
                  ← Atrás
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setStep(1);
                  setErrorPropietario('');
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>

              {step < 4 ? (
                <button
                  onClick={handleSiguiente}
                  className="px-6 py-2 bg-gradient-to-r from-[#C9A8D4] to-[#A88FC9] text-white font-bold rounded-lg hover:shadow-lg transition-all hover:scale-105"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleGuardarCita}
                  disabled={savingCita}
                  className="px-6 py-2 bg-[#9BCDB0] text-white font-bold rounded-lg hover:bg-[#88b89e] transition-colors disabled:opacity-50"
                >
                  {savingCita ? '⏳ Guardando...' : '✓ Confirmar Cita'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de citas existentes */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Citas Registradas</h2>

        {loadingCitas && (
          <div className="text-center py-8 text-gray-500">
            ⏳ Cargando citas...
          </div>
        )}

        {errorCitas && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {errorCitas}
          </div>
        )}

        {!loadingCitas && citas.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">No hay citas registradas aún</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-[#C9A8D4] text-white rounded-lg hover:bg-[#A88FC9]"
            >
              Agendar Primera Cita
            </button>
          </div>
        )}

        {!loadingCitas && citas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {citas.map((cita) => (
              <div
                key={cita.id_cita}
                className="p-4 bg-white rounded-lg border-l-4 border-[#C9A8D4] shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-[#C9A8D4]">{cita.paciente_nombre}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    cita.estado === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-700'
                      : cita.estado === 'confirmada'
                      ? 'bg-green-100 text-green-700'
                      : cita.estado === 'cancelada'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {cita.estado}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Propietario:</strong> {cita.propietario_nombre}</p>
                  <p><strong>Fecha:</strong> {new Date(cita.fecha_cita).toLocaleDateString('es-ES')}</p>
                  <p><strong>Hora:</strong> {cita.hora_cita.substring(0, 5)}</p>
                  <p><strong>Motivo:</strong> {cita.descripcion || 'Sin especificar'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
