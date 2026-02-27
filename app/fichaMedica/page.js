"use client";

import { useEffect, useState } from 'react';
import HistorialModal from '../components/HistorialModal';

export default function FichaMedica() {
  const [pacientes, setPacientes] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [fichas, setFichas] = useState([]);
  const [loadingFichas, setLoadingFichas] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [motivo, setMotivo] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedFicha, setEditedFicha] = useState(null);
  const [saving, setSaving] = useState(false);
  const isSuccessMessage = message && message.toLowerCase().includes('correctamente');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function closeForm() {
    setShowForm(false);
    setMessage('');
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/pacientes/list');
        const json = await res.json();
        if (json?.success) setPacientes(json.data || []);
      } catch (err) {
        console.warn('Error loading pacientes:', err);
      } finally {
        setLoadingPatients(false);
      }
    }
    load();
    fetchFichas();
  }, []);

  async function fetchFichas() {
    setLoadingFichas(true);
    try {
      const r = await fetch('/api/historial_medico');
      const j = await r.json();
      if (j?.success) setFichas(j.data || []);
    } catch (err) {
      console.warn('Error loading fichas:', err);
    } finally {
      setLoadingFichas(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    if (!selectedPatientId) return setMessage('Seleccione un paciente');
    if (!motivo || motivo.trim() === '') return setMessage('Ingrese el motivo de la consulta');

    const patientId = Number(selectedPatientId);
    if (isNaN(patientId) || patientId <= 0) {
      return setMessage('ID del paciente inválido');
    }

    setSubmitting(true);
    try {
      const payload = {
        motivo_consulta: motivo,
        pacientes_id_mascota: patientId,
      };

      // Solo incluir diagnóstico y tratamiento si tienen contenido
      if (diagnostico && diagnostico.trim()) {
        payload.diagnostico = diagnostico;
      }
      if (tratamiento && tratamiento.trim()) {
        payload.tratamiento = tratamiento;
      }

      const res = await fetch('/api/historial_medico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      console.log('Response from POST:', { status: res.status, data: j });
      
      if (j?.success) {
        // limpiar campos y cerrar modal
        setMotivo(''); setDiagnostico(''); setTratamiento(''); setSelectedPatientId('');
        setShowForm(false);
        setMessage('Ficha médica guardada correctamente');
        // recargar fichas
        fetchFichas();
      } else {
        const errorMsg = j?.error || j?.message || 'Error al guardar';
        console.error('Error saving:', errorMsg);
        setMessage(errorMsg);
      }
    } catch (err) {
      console.error('Exception:', err);
      setMessage('Error al guardar la ficha: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveChanges() {
    if (!selectedFicha || !editedFicha) return;
    
    setSaving(true);
    try {
      const payload = {
        id: selectedFicha.id,
        motivo_consulta: editedFicha.motivo_consulta,
        diagnostico: editedFicha.diagnostico,
        tratamiento: editedFicha.tratamiento
      };

      const res = await fetch('/api/historial_medico', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const j = await res.json();
      if (j?.success) {
        setSelectedFicha(editedFicha);
        setEditMode(false);
        setMessage('Ficha médica actualizada correctamente');
        fetchFichas();
      } else {
        setMessage('Error al guardar: ' + (j?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error saving ficha:', err);
      setMessage('Error al guardar la ficha');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFicha() {
    if (!selectedFicha) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/historial_medico', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedFicha.id })
      });

      const j = await res.json();
      if (j?.success) {
        setShowHistorialModal(false);
        setShowDeleteConfirm(false);
        setSelectedFicha(null);
        setMessage('Ficha médica eliminada correctamente');
        fetchFichas();
      } else {
        setMessage('Error al eliminar: ' + (j?.message || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error deleting ficha:', err);
      setMessage('Error al eliminar la ficha');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 lg:p-16">
      <div className="max-w-4xl mx-auto bg-[#F8F7F5] rounded-3xl p-12 shadow-2xl border-b-8 border-[#C9A8D4]">
        <header className="mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center">
            <svg className="w-8 h-8 mr-3 text-[#C9A8D4] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
            </svg>
            <div>
              <h1 className="text-3xl font-extrabold text-[#FF6B6B]">Ficha Médica</h1>
              <p className="text-sm text-[#9BCDB0]">Accede y registra historial clínico por paciente</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-0">
            <a href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-full bg-[#C9A8D4] text-white font-semibold hover:bg-gradient-to-r hover:from-[#C9A8D4] hover:to-[#FF6B6B] transform hover:scale-105 hover:shadow-lg transition-transform duration-200 ease-in-out">Volver al Dashboard</a>
          </div>
        </header>

        {/* Grid de mini-cuadrados */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Botón para añadir nueva ficha */}
          <div role="button" aria-label="Agregar ficha" className="h-32 bg-gradient-to-br from-[#FF6B6B]/15 to-[#FFD4D4] rounded-lg border-2 border-dashed border-[#FF6B6B] flex items-center justify-center cursor-pointer hover:from-[#FF6B6B]/25 hover:to-[#FFC4C4] transition" onClick={() => { setMessage(''); setShowForm(true); }}>
            <div className="text-5xl text-[#FF6B6B] font-extrabold">+</div>
          </div>

          {/* Mostrar fichas guardadas (nombre del paciente) */}
          {loadingFichas ? (
            <div className="col-span-4 text-sm text-gray-500">Cargando fichas...</div>
          ) : (
            fichas.map((f, idx) => (
              <div key={idx} className="h-32 bg-gradient-to-br from-[#9BCDB0]/20 to-[#E8F5F0] rounded-xl border-2 border-[#9BCDB0] p-3 flex flex-col items-center justify-center text-center shadow-md hover:from-[#9BCDB0]/30 hover:to-[#D4EEEA] transition cursor-pointer" onClick={() => { setSelectedFicha(f); setShowHistorialModal(true); }}>
                <div className="text-xs text-[#9BCDB0]">Ficha</div>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#FF6B6B] text-white font-semibold text-sm">
                  {f.nombre_mascota || 'Sin nombre'}
                </div>
                <div className="mt-2 text-xs text-gray-500 max-w-[160px] truncate">{f.motivo_consulta || ''}</div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border-t-4 border-[#C9A8D4]">
            <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800" onClick={closeForm} aria-label="Cerrar">✕</button>
            <h2 className="text-2xl font-extrabold text-[#FF6B6B] mb-2">Nueva Ficha Médica</h2>
            <p className="text-sm text-[#9BCDB0] mb-4">Registra el motivo y tratamiento. El paciente será asociado por su nombre internamente por id.</p>
            {message && (
              <div className={`mb-4 rounded-lg border px-4 py-2 text-sm ${isSuccessMessage ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                {loadingPatients ? (
                  <div className="text-sm text-gray-500">Cargando pacientes...</div>
                ) : (
                  <div className="mt-1 relative">
                    <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="block w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]">
                      <option value="">-- Seleccione un paciente --</option>
                      {pacientes.map(p => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">▾</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo de la consulta</label>
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={7} className="mt-1 block w-full p-4 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]" placeholder="Describe con detalle el motivo de la consulta..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                  <input value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
                  <input value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]" />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-full border">Cancelar</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center px-6 py-2 rounded-full bg-[#9BCDB0] text-white font-semibold hover:bg-[#7ab89f] focus:outline-none focus:ring-4 focus:ring-[#FF6B6B]/30">
                  {submitting ? 'Guardando...' : 'Guardar Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles de ficha */}
      {showHistorialModal && selectedFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowHistorialModal(false); setEditMode(false); setShowDeleteConfirm(false); }} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border-t-4 border-[#C9A8D4]">
            <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800 text-2xl" onClick={() => { setShowHistorialModal(false); setEditMode(false); setShowDeleteConfirm(false); }} aria-label="Cerrar">✕</button>
            
            <h2 className="text-2xl font-extrabold text-[#FF6B6B] mb-2">{selectedFicha.nombre_mascota}</h2>
            <p className="text-sm text-[#9BCDB0] mb-4">Detalles de la ficha médica</p>
            
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo de la consulta</label>
                  <textarea
                    value={editedFicha?.motivo_consulta || ''}
                    onChange={(e) => setEditedFicha({...editedFicha, motivo_consulta: e.target.value})}
                    rows="4"
                    className="mt-1 block w-full p-4 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                    <input
                      value={editedFicha?.diagnostico || ''}
                      onChange={(e) => setEditedFicha({...editedFicha, diagnostico: e.target.value})}
                      className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
                    <input
                      value={editedFicha?.tratamiento || ''}
                      onChange={(e) => setEditedFicha({...editedFicha, tratamiento: e.target.value})}
                      className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#9BCDB0]/20 focus:border-[#9BCDB0]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Motivo de la consulta</label>
                  <textarea
                    disabled
                    value={selectedFicha.motivo_consulta || 'Sin información'}
                    rows="4"
                    className="mt-1 block w-full p-4 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-100 cursor-not-allowed opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                    <input
                      disabled
                      value={selectedFicha.diagnostico || 'Sin diagnóstico'}
                      className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
                    <input
                      disabled
                      value={selectedFicha.tratamiento || 'Sin tratamiento'}
                      className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 bg-gray-100 cursor-not-allowed opacity-70 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {showDeleteConfirm && (
              <div className="mt-4 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="font-semibold mb-2">¿Está seguro de que desea eliminar esta ficha médica?</div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-full border border-red-200 bg-white text-red-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteFicha}
                    disabled={saving}
                    className="px-4 py-2 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {saving ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving}
                className="px-6 py-2 rounded-full border border-red-200 text-red-600 font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition disabled:opacity-50"
              >
                Eliminar
              </button>
              <div className="flex items-center justify-end space-x-3">
                {editMode ? (
                  <>
                    <button 
                      onClick={() => { setEditMode(false); setEditedFicha(null); }} 
                      className="px-6 py-2 rounded-full bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="px-6 py-2 rounded-full bg-[#8E7CC3] text-white font-semibold hover:bg-[#7C67B3] transition disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => { setEditMode(true); setEditedFicha({...selectedFicha}); }}
                      className="px-6 py-2 rounded-full bg-[#9BCDB0] text-white font-semibold hover:bg-[#7ab89f] hover:shadow-md transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => { setShowHistorialModal(false); setShowDeleteConfirm(false); }} 
                      className="px-6 py-2 rounded-full bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de HistorialModal (mantener para compatibilidad) */}
      {showHistorialModal && !selectedFicha && (
        <HistorialModal
          pacienteId={null}
          pacienteNombre=""
          onClose={() => setShowHistorialModal(false)}
          onSaved={() => { fetchFichas(); setShowHistorialModal(false); }}
        />
      )}
    </div>
  );
}
