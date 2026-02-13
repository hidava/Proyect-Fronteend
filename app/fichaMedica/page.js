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
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [modalPacienteId, setModalPacienteId] = useState(null);
  const [modalPacienteNombre, setModalPacienteNombre] = useState('');

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

  async function handleUploadFile() {
    if (!file) return null;
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await res.json();
      if (j?.success) return j;
      console.warn('Upload failed', j);
    } catch (err) {
      console.warn('Upload error', err);
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    if (!selectedPatientId) return setMessage('Seleccione un paciente');
    if (!motivo || motivo.trim() === '') return setMessage('Ingrese el motivo de la consulta');

    setSubmitting(true);
    try {
      let uploaded = null;
      if (file) uploaded = await handleUploadFile();

      const payload = {
        motivo_consulta: motivo,
        diagnostico: diagnostico || null,
        tratamiento: tratamiento || null,
        pacientes_id_mascota: Number(selectedPatientId),
      };

      if (uploaded) {
        payload.imagen_url = uploaded.url;
        payload.imagen_name = uploaded.name;
      }

      const res = await fetch('/api/historial_medico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await res.json();
      if (j?.success) {
        // limpiar campos y cerrar modal
        setMotivo(''); setDiagnostico(''); setTratamiento(''); setFile(null); setSelectedPatientId('');
        setShowForm(false);
        setMessage('Ficha médica guardada correctamente');
        // recargar fichas
        fetchFichas();
      } else {
        setMessage(j?.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error al guardar la ficha');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 lg:p-16 bg-[#FFEC99] paws-bg">
      <div className="max-w-4xl mx-auto bg-[#F8F7F5] rounded-3xl p-8 shadow-2xl border-b-8 border-[#E9576E]">
        <header className="mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center">
            <svg className="w-8 h-8 mr-3 text-[#E9576E] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
            </svg>
            <div>
              <h1 className="text-3xl font-extrabold text-[#E9576E]">Ficha Médica</h1>
              <p className="text-sm text-[#64C2CE]">Accede y registra historial clínico por paciente</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-0">
            <a href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-full bg-[#64C2CE] text-white font-semibold hover:bg-gradient-to-r hover:from-[#64C2CE] hover:to-[#E9576E] transform hover:scale-105 hover:shadow-lg transition-transform duration-200 ease-in-out">Volver al Dashboard</a>
          </div>
        </header>

        {/* Grid de mini-cuadrados */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Botón para añadir nueva ficha */}
          <div role="button" aria-label="Agregar ficha" className="h-32 bg-white rounded-lg border-2 border-dashed border-[#E9576E]/30 flex items-center justify-center cursor-pointer hover:bg-[#fff7f8] transition" onClick={() => setShowForm(true)}>
            <div className="text-5xl text-[#E9576E] font-extrabold">+</div>
          </div>

          {/* Mostrar fichas guardadas (nombre del paciente) */}
          {loadingFichas ? (
            <div className="col-span-4 text-sm text-gray-500">Cargando fichas...</div>
          ) : (
            fichas.map((f) => (
              <div key={f.id} className="h-32 bg-white rounded-xl border p-3 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="text-xs text-[#64C2CE]">Ficha</div>
                <button onClick={() => { setModalPacienteId(f.pacientes_id_mascota); setModalPacienteNombre(f.paciente_nombre); setShowHistorialModal(true); }} className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-[#E9576E] text-white font-semibold text-sm hover:opacity-90">
                  {f.paciente_nombre || 'Sin nombre'}
                </button>
                <div className="mt-2 text-xs text-gray-500 max-w-[160px] truncate">{f.motivo_consulta || ''}</div>
              </div>
            ))
          )}
        </div>

        <div className="text-sm text-gray-600 mb-4">{message}</div>
      </div>

      {/* Modal del formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border-t-4 border-[#E9576E]">
            <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800" onClick={() => setShowForm(false)} aria-label="Cerrar">✕</button>
            <h2 className="text-2xl font-extrabold text-[#E9576E] mb-2">Nueva Ficha Médica</h2>
            <p className="text-sm text-[#64C2CE] mb-4">Registra el motivo y tratamiento. El paciente será asociado por su nombre internamente por id.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                {loadingPatients ? (
                  <div className="text-sm text-gray-500">Cargando pacientes...</div>
                ) : (
                  <div className="mt-1 relative">
                    <select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="block w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-base focus:outline-none focus:ring-4 focus:ring-[#64C2CE]/20 focus:border-[#64C2CE]">
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
                <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={7} className="mt-1 block w-full p-4 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#64C2CE]/20 focus:border-[#64C2CE]" placeholder="Describe con detalle el motivo de la consulta..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnóstico</label>
                  <input value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#64C2CE]/20 focus:border-[#64C2CE]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tratamiento</label>
                  <input value={tratamiento} onChange={(e) => setTratamiento(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#64C2CE]/20 focus:border-[#64C2CE]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen (opcional)</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-full border">Cancelar</button>
                <button type="submit" disabled={submitting} className="inline-flex items-center px-6 py-2 rounded-full bg-[#64C2CE] text-white font-semibold hover:bg-[#57aab1] focus:outline-none focus:ring-4 focus:ring-[#E9576E]/30">
                  {submitting ? 'Guardando...' : 'Guardar Ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de vista completa y edición */}
      {showHistorialModal && modalPacienteId && (
        <HistorialModal
          pacienteId={modalPacienteId}
          pacienteNombre={modalPacienteNombre}
          onClose={() => setShowHistorialModal(false)}
          onSaved={() => { fetchFichas(); setShowHistorialModal(false); }}
        />
      )}
    </div>
  );
}
