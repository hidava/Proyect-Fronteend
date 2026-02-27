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
  const [actionMessage, setActionMessage] = useState('');
  const [editingCita, setEditingCita] = useState(null);
  const [editData, setEditData] = useState({ fecha_cita: '', hora_cita: '', descripcion: '', estado: 'pendiente' });
  const [savingEdit, setSavingEdit] = useState(false);

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
      const resPropietario = await fetch(`/api/propietarios/${cedula}`);
      const dataPropietario = await resPropietario.json();

      if (!dataPropietario.success || !dataPropietario.data) {
        setErrorPropietario('No existen propietarios asociados a esa cédula');
        return;
      }

      const propietario = dataPropietario.data;
      setPropietarioInfo(propietario);

      // Cargar mascotas del propietario
      const resMascotas = await fetch(`/api/pacientes/owner/${cedula}`);
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

  const getEstadoStyles = (estado) => {
    if (estado === 'pendiente') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (estado === 'confirmada') return 'bg-green-100 text-green-700 border-green-200';
    if (estado === 'cancelada') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getEstadoLabel = (estado) => {
    if (estado === 'completada') return 'realizada';
    return estado;
  };

  const abrirEdicion = (cita) => {
    setEditingCita(cita.id_cita);
    setEditData({
      fecha_cita: cita.fecha_cita ? new Date(cita.fecha_cita).toISOString().split('T')[0] : '',
      hora_cita: cita.hora_cita ? cita.hora_cita.substring(0, 5) : '',
      descripcion: cita.descripcion || '',
      estado: cita.estado === 'completada' ? 'realizada' : cita.estado
    });
  };

  const cancelarEdicion = () => {
    setEditingCita(null);
    setEditData({ fecha_cita: '', hora_cita: '', descripcion: '', estado: 'pendiente' });
  };

  const handleGuardarEdicion = async (idCita) => {
    try {
      setSavingEdit(true);
      setActionMessage('');

      const res = await fetch(`/api/citas/${idCita}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_cita: editData.fecha_cita,
          hora_cita: editData.hora_cita,
          descripcion: editData.descripcion,
          estado: editData.estado
        })
      });

      const data = await res.json();

      if (data.success) {
        setActionMessage('Cita actualizada correctamente');
        setTimeout(() => setActionMessage(''), 2000);
        cancelarEdicion();
        cargarCitas();
        if (fechaSeleccionada) {
          cargarHorarios(fechaSeleccionada);
        }
      } else {
        alert(`Error: ${data.message || 'No se pudo actualizar la cita'}`);
      }
    } catch (error) {
      console.error('Error editando cita:', error);
      alert('Error al editar la cita');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleEliminarCita = async (idCita) => {
    if (!confirm('¿Desea eliminar esta cita?')) return;

    try {
      const res = await fetch(`/api/citas/${idCita}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setActionMessage('Cita eliminada correctamente');
        setTimeout(() => setActionMessage(''), 2000);
        cargarCitas();
        if (fechaSeleccionada) {
          cargarHorarios(fechaSeleccionada);
        }
      } else {
        alert(`Error: ${data.message || 'No se pudo eliminar la cita'}`);
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
      alert('Error al eliminar la cita');
    }
  };

  return (
    <div className="min-h-screen w-full p-4 sm:p-6 lg:p-16 font-sans bg-[#FFF9E6] paws-bg">
      <div className="max-w-7xl w-full mx-auto">
        <div className="relative bg-white shadow-2xl rounded-3xl px-4 sm:px-6 py-6 sm:py-8 border-b-8 border-[#C9A8D4] overflow-hidden">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#C9A8D4]/15 blur-2xl" />
          <div className="absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-[#9BCDB0]/20 blur-2xl" />

          <div className="relative">
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 text-[#FF6B6B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#FF6B6B]">Gestión de Citas</h1>
                  <p className="text-xs sm:text-sm text-[#9BCDB0] mt-1">Agenda y gestiona las citas veterinarias de tus mascotas</p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A8D4] to-[#8E7CC3] text-white text-sm font-semibold hover:from-[#B897C3] hover:to-[#7C67B3] hover:shadow-xl transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al Dashboard
                </button>
              </div>
            </div>

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="mb-4 rounded-2xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3.5 text-sm font-medium text-green-700 shadow-sm">
                ✓ {successMessage}
              </div>
            )}

            {actionMessage && (
              <div className="mb-4 rounded-2xl border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-3.5 text-sm font-medium text-green-700 shadow-sm">
                ✓ {actionMessage}
              </div>
            )}

            {/* Botón Nueva Cita */}
            {!showForm && (
              <div className="mb-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9BCDB0] to-[#7ab89f] text-white font-semibold hover:from-[#7ab89f] hover:to-[#68a88d] hover:shadow-xl transition-all duration-200 transform hover:scale-105"
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
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-[#FF6B6B] via-[#8E7CC3] to-[#C9A8D4] rounded-full mr-3 shadow-md"></div>
                <span className="bg-gradient-to-r from-[#FF6B6B] to-[#8E7CC3] bg-clip-text text-transparent">Citas Registradas</span>
              </h2>

              {loadingCitas && (
                <div className="text-center text-gray-500 py-8">Cargando citas...</div>
              )}

              {errorCitas && (
                <div className="mb-4 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50 px-5 py-3.5 text-sm font-medium text-red-700 shadow-sm">
                  {errorCitas}
                </div>
              )}

              {!loadingCitas && citas.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium mb-4">No hay citas registradas aún</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-[#9BCDB0] text-white rounded-lg hover:bg-[#7ab89f] transition-colors"
                  >
                    Agendar Primera Cita
                  </button>
                </div>
              )}

              {!loadingCitas && citas.length > 0 && (
                <div className="space-y-3">
                  {citas.map((cita) => (
                    <div key={cita.id_cita} className="group relative">
                      <div className="relative bg-gradient-to-r from-white/80 via-[#FFF4E0]/30 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md hover:shadow-xl hover:border-gray-300/80 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF6B6B] via-[#9BCDB0] to-[#8E7CC3] group-hover:w-1.5 transition-all duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>

                        <div className="hidden md:flex relative items-center px-5 py-3 gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8E7CC3] to-[#C9A8D4] flex items-center justify-center shadow-md">
                              <span className="text-lg">📅</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide mb-0.5">Mascota</div>
                            <div className="text-base font-extrabold text-gray-800 truncate group-hover:text-[#FF6B6B] transition-colors duration-300">{cita.paciente_nombre || 'Sin mascota'}</div>
                          </div>

                          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide mb-0.5">Propietario</div>
                            <div className="text-base font-extrabold text-gray-800 truncate">{cita.propietario_nombre} {cita.propietario_apellido || ''}</div>
                          </div>

                          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide mb-0.5">Fecha / Hora</div>
                            <div className="text-base font-extrabold text-gray-800">
                              {new Date(cita.fecha_cita).toLocaleDateString('es-ES')} · {cita.hora_cita.substring(0, 5)}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase ${getEstadoStyles(cita.estado)}`}>
                              {getEstadoLabel(cita.estado)}
                            </span>
                          </div>
                        </div>

                        <div className="md:hidden relative px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-lg font-extrabold text-gray-800 truncate">{cita.paciente_nombre || 'Sin mascota'}</div>
                              <div className="text-sm text-gray-600 truncate">{cita.propietario_nombre} {cita.propietario_apellido || ''}</div>
                              <div className="text-sm text-gray-600 mt-1">{new Date(cita.fecha_cita).toLocaleDateString('es-ES')} · {cita.hora_cita.substring(0, 5)}</div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase ${getEstadoStyles(cita.estado)}`}>
                              {getEstadoLabel(cita.estado)}
                            </span>
                          </div>
                        </div>

                        <div className="px-5 pb-3 text-sm text-gray-600">
                          <span className="font-semibold">Motivo: </span>
                          {cita.descripcion || 'Sin especificar'}
                        </div>

                        {editingCita === cita.id_cita && (
                          <div className="mx-5 mb-4 p-4 bg-white/90 rounded-xl border-2 border-[#C9A8D4] space-y-3">
                            <h4 className="font-bold text-[#8E7CC3]">Editar cita</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Fecha</label>
                                <input
                                  type="date"
                                  min={fechaMinima}
                                  value={editData.fecha_cita}
                                  onChange={(e) => setEditData((prev) => ({ ...prev, fecha_cita: e.target.value }))}
                                  className="w-full px-3 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Hora</label>
                                <input
                                  type="time"
                                  value={editData.hora_cita}
                                  onChange={(e) => setEditData((prev) => ({ ...prev, hora_cita: e.target.value }))}
                                  className="w-full px-3 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Estado</label>
                              <select
                                value={editData.estado}
                                onChange={(e) => setEditData((prev) => ({ ...prev, estado: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none bg-white"
                              >
                                <option value="pendiente">Pendiente</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="realizada">Realizada</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                              <textarea
                                rows="3"
                                value={editData.descripcion}
                                onChange={(e) => setEditData((prev) => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full px-3 py-2 border-2 border-[#C9A8D4] rounded-lg focus:outline-none resize-none"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={cancelarEdicion}
                                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleGuardarEdicion(cita.id_cita)}
                                disabled={savingEdit}
                                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#8E7CC3] to-[#C9A8D4] text-white font-semibold hover:shadow-lg disabled:opacity-50"
                              >
                                {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="px-5 pb-4 flex justify-end gap-2">
                          <button
                            onClick={() => abrirEdicion(cita)}
                            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#9BCDB0] to-[#7ab89f] text-white text-sm font-semibold hover:shadow-lg"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminarCita(cita.id_cita)}
                            className="px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:shadow-lg"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
