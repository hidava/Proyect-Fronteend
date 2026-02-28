'use client';

import { useEffect, useState } from 'react';

export default function DesparacitantesPage() {
  const [desparacitaciones, setDesparacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [patientSearch, setPatientSearch] = useState('');
  const [desparasitacionSearch, setDesparasitacionSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    producto: '',
    fecha_aplicada: '',
    proxima_dosis: '',
    pacientes_id_mascota: ''
  });

  useEffect(() => {
    fetchDesparacitaciones();
    fetchPacientes();
  }, []);

  const fetchDesparacitaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/desparacitantes');
      const json = await res.json();
      if (json?.success) {
        setDesparacitaciones(json.data || []);
      } else {
        setError(json?.error || 'Error al cargar desparacitaciones');
      }
    } catch (err) {
      setError('Error al cargar desparacitaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    setLoadingPacientes(true);
    try {
      const res = await fetch('/api/pacientes/list');
      const json = await res.json();
      const list = json?.data || json?.pacientes || json?.results || json;

      if (Array.isArray(list)) {
        setPacientes(list);
      } else {
        setPacientes([]);
      }
    } catch (err) {
      setPacientes([]);
    } finally {
      setLoadingPacientes(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSaving(true);

    try {
      const pacientesId = Number(formData.pacientes_id_mascota);
      if (!Number.isFinite(pacientesId)) {
        setError('Selecciona un paciente valido');
        setSaving(false);
        return;
      }

      const url = editingId ? `/api/desparacitantes?id=${editingId}` : '/api/desparacitantes';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pacientes_id_mascota: pacientesId
        })
      });
      const json = await res.json();

      if (json?.success) {
        setSuccessMessage(editingId ? 'Desparacitación actualizada correctamente' : 'Desparacitación registrada correctamente');
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
        setFormData({ producto: '', fecha_aplicada: '', proxima_dosis: '', pacientes_id_mascota: '' });
        setShowForm(false);
        setEditingId(null);
        fetchDesparacitaciones();
      } else {
        setError(json?.error || `Error al ${editingId ? 'actualizar' : 'registrar'} desparacitación`);
      }
    } catch (err) {
      setError(`Error al ${editingId ? 'actualizar' : 'registrar'} desparacitación`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/desparacitantes?id=${deletingId}`, {
        method: 'DELETE'
      });
      const json = await res.json();

      if (json?.success) {
        setSuccessMessage('Desparacitación eliminada correctamente');
        setTimeout(() => {
          setSuccessMessage('');
        }, 2000);
        fetchDesparacitaciones();
      } else {
        setError(json?.error || 'Error al eliminar desparacitación');
      }
    } catch (err) {
      setError('Error al eliminar desparacitación');
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const handleEdit = (desparacitacion) => {
    // Formatear fechas para el input type="date" (YYYY-MM-DD)
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };

    setFormData({
      producto: desparacitacion.producto,
      fecha_aplicada: formatDate(desparacitacion.fecha_aplicada),
      proxima_dosis: formatDate(desparacitacion.proxima_dosis),
      pacientes_id_mascota: desparacitacion.pacientes_id_mascota
    });
    setEditingId(desparacitacion.id_desparacitacion);
    setShowForm(true);
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const BrandingIcon = () => (
    <svg className="w-8 h-8 mr-3 text-[#FF6B6B] shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m-8-8h16"/>
    </svg>
  );

  const filteredPacientes = pacientes.filter((paciente) => {
    const idMascota = paciente?.id_mascota ?? paciente?.id;
    const nombre = paciente?.nombre || '';
    const cedula = paciente?.propietarios_cedula || paciente?.cedula || '';
    const query = patientSearch.trim().toLowerCase();

    if (!query) return true;

    return (
      String(idMascota || '').toLowerCase().includes(query) ||
      nombre.toLowerCase().includes(query) ||
      String(cedula).toLowerCase().includes(query)
    );
  });

  const normalizeText = (text) =>
    String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const filteredDesparacitaciones = desparacitaciones.filter((desp) => {
    const query = normalizeText(desparasitacionSearch).trim();
    if (!query) return true;

    const producto = normalizeText(desp?.producto || '');
    const paciente = normalizeText(desp?.paciente_nombre || '');
    const idMascota = normalizeText(desp?.pacientes_id_mascota || '');

    return (
      producto.includes(query) ||
      paciente.includes(query) ||
      idMascota.includes(query)
    );
  });

  return (
    <div className="min-h-screen w-full p-6 sm:p-10 lg:p-16 font-sans bg-[#FFF9E6] paws-bg">
      <main className="max-w-6xl w-full mx-auto">
        <div className="relative bg-[#F8F7F5]/85 backdrop-blur-sm shadow-2xl rounded-3xl px-4 py-2 sm:px-6 sm:py-3 border border-[#C9A8D4]/40 overflow-hidden -mt-[44px]">
          <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[#C9A8D4]/25 blur-2xl" />
          <div className="absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-[#9BCDB0]/30 blur-2xl" />

          <div className="relative">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <BrandingIcon />
                  <div className="ml-2 text-left">
                    <h1 className="text-3xl font-extrabold text-[#FF6B6B]">Desparasitantes</h1>
                    <p className="text-sm text-[#9BCDB0] mt-1">Registro y seguimiento de desparasitación</p>
                    <p className="mt-1 text-sm text-gray-600">Consulta las desparasitaciones registradas y agrega nuevas.</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(prev => !prev);
                      setEditingId(null);
                      setFormData({ producto: '', fecha_aplicada: '', proxima_dosis: '', pacientes_id_mascota: '' });
                    }}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-[#9BCDB0] text-white font-semibold hover:bg-gradient-to-r hover:from-[#9BCDB0] hover:to-[#FF6B6B] transform hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out"
                  >
                    +Nuevo Desparasitaciones
                  </button>
                  <a href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-full bg-[#C9A8D4] text-white font-semibold hover:bg-gradient-to-r hover:from-[#C9A8D4] hover:to-[#FF6B6B] transform hover:scale-110 hover:shadow-lg transition-transform duration-200 ease-in-out">
                    Volver al Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="text-center text-sm text-green-600 font-medium p-3 bg-green-100 border border-green-300 rounded-md mt-6">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="text-center text-sm text-red-600 font-medium p-3 bg-red-100 border border-red-300 rounded-md mt-6">
              {error}
            </div>
          )}

          {showForm && (
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <h3 className="lg:col-span-3 text-lg font-semibold text-[#FF6B6B] border-b pb-2">
                  {editingId ? 'Editar Desparasitación' : 'Datos de la Desparasitación'}
                </h3>

                <div>
                  <label htmlFor="producto" className="block text-sm font-medium text-gray-700">Producto desparasitante</label>
                  <input
                    id="producto"
                    name="producto"
                    type="text"
                    required
                    value={formData.producto}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                    placeholder="Ej: Drontal, Panacur"
                  />
                </div>

                <div>
                  <label htmlFor="fecha_aplicada" className="block text-sm font-medium text-gray-700">Fecha de aplicación</label>
                  <input
                    id="fecha_aplicada"
                    name="fecha_aplicada"
                    type="date"
                    required
                    value={formData.fecha_aplicada}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="proxima_dosis" className="block text-sm font-medium text-gray-700">Próxima dosis (opcional)</label>
                  <input
                    id="proxima_dosis"
                    name="proxima_dosis"
                    type="date"
                    value={formData.proxima_dosis}
                    onChange={handleChange}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label htmlFor="pacientes_id_mascota" className="block text-sm font-medium text-gray-700">ID de la mascota</label>
                  <div className="mt-1">
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      placeholder="Buscar por nombre, cedula o ID"
                      className="mb-2 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm"
                    />
                  </div>
                  <select
                    id="pacientes_id_mascota"
                    name="pacientes_id_mascota"
                    required
                    value={formData.pacientes_id_mascota}
                    onChange={handleChange}
                    disabled={loadingPacientes}
                    className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0] sm:text-sm disabled:opacity-60"
                  >
                    <option value="">{loadingPacientes ? 'Cargando pacientes...' : 'Selecciona un paciente'}</option>
                    {filteredPacientes.map((paciente) => {
                      const idMascota = paciente?.id_mascota ?? paciente?.id;
                      const nombre = paciente?.nombre || 'Sin nombre';
                      const cedula = paciente?.propietarios_cedula || paciente?.cedula || '';
                      const label = cedula ? `${nombre} - ${cedula} (ID ${idMascota})` : `${nombre} (ID ${idMascota})`;

                      return (
                        <option key={idMascota} value={idMascota}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                  {!loadingPacientes && pacientes.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No hay pacientes disponibles.</p>
                  )}
                  {!loadingPacientes && pacientes.length > 0 && filteredPacientes.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No hay resultados para la busqueda.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-3 rounded-full bg-[#9BCDB0] text-white font-semibold hover:bg-gradient-to-r hover:from-[#9BCDB0] hover:to-[#FF6B6B] transform hover:scale-105 hover:shadow-lg transition-transform duration-200 ease-in-out disabled:opacity-60"
                >
                  {saving ? 'Guardando...' : (editingId ? 'Actualizar desparasitación' : 'Guardar registro de desparasitación')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b pb-2">
              <h3 className="text-lg font-semibold text-[#FF6B6B]">Desparasitaciones registradas</h3>
              <div className="w-full sm:w-72 sm:ml-auto">
                <input
                  type="text"
                  value={desparasitacionSearch}
                  onChange={(e) => setDesparasitacionSearch(e.target.value)}
                  placeholder="Buscar producto, paciente o ID..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#9BCDB0] focus:border-[#9BCDB0]"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-sm text-gray-600 mt-4">Cargando desparasitaciones...</div>
            ) : desparacitaciones.length === 0 ? (
              <div className="text-center text-sm text-gray-600 mt-4">No hay desparasitaciones registradas.</div>
            ) : filteredDesparacitaciones.length === 0 ? (
              <div className="text-center text-sm text-gray-600 mt-4">No hay resultados para la búsqueda.</div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <div className="grid grid-cols-1 gap-4 sm:hidden">
                  {filteredDesparacitaciones.map((desp) => (
                    <div key={desp.id_desparacitacion} className="bg-[#FFF2E5] rounded-xl shadow-md border border-[#FF6B6B] p-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#FF6B6B]">{desp.producto}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(desp)}
                            className="text-[#9BCDB0] hover:text-green-700 font-bold text-lg transition-colors"
                            title="Editar desparasitación"
                          >✎</button>
                          <button
                            onClick={() => handleDelete(desp.id_desparacitacion)}
                            className="text-[#FF6B6B] hover:text-red-700 font-bold text-lg transition-colors"
                            title="Eliminar desparasitación"
                          >✕</button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700"><span className="font-semibold">Fecha aplicada:</span> {desp.fecha_aplicada || '-'}</div>
                      <div className="text-sm text-gray-700"><span className="font-semibold">Próxima dosis:</span> {desp.proxima_dosis || '-'}</div>
                      <div className="text-sm text-gray-700"><span className="font-semibold">Paciente:</span> {desp.paciente_nombre || 'Sin nombre'}</div>
                      <div className="text-sm text-gray-700"><span className="font-semibold">ID Mascota:</span> {desp.pacientes_id_mascota}</div>
                    </div>
                  ))}
                </div>
                <div className="hidden sm:block">
                  <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-[#FFF2E5]">
                      <tr>
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">Producto</th>
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">Fecha aplicada</th>
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">Próxima dosis</th>
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">Paciente</th>
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">ID Mascota</th>
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDesparacitaciones.map((desp) => (
                        <tr key={desp.id_desparacitacion} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-700">{desp.producto}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{desp.fecha_aplicada || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{desp.proxima_dosis || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{desp.paciente_nombre || 'Sin nombre'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{desp.pacientes_id_mascota}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleEdit(desp)}
                                className="text-[#9BCDB0] hover:text-green-700 font-bold text-lg transition-colors"
                                title="Editar desparasitación"
                              >✎</button>
                              <button
                                onClick={() => handleDelete(desp.id_desparacitacion)}
                                className="text-[#FF6B6B] hover:text-red-700 font-bold text-lg transition-colors"
                                title="Eliminar desparasitación"
                              >✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de confirmación de eliminación */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#F8F7F5] shadow-2xl rounded-3xl border-b-8 border-[#C9A8D4] p-8 max-w-md w-full overflow-hidden">
            {/* Floating decorative paws */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
              <svg className="floating-paw paw-1 text-[#C9A8D4]" viewBox="0 0 64 64" width="64" height="64" xmlns="http://www.w3.org/2000/svg">
                <g fill="currentColor" opacity="0.08">
                  <path d="M20 8c-4 0-6.5 4-6.5 7s2.5 6 6.5 6 6.5-3 6.5-6-2.5-7-6.5-7zm10 18c-6 0-14 5-14 14 0 9 6 14 14 14s14-5 14-14c0-9-8-14-14-14zM46 8c-4 0-6.5 4-6.5 7S42 21 46 21s6.5-3 6.5-6-2.5-7-6.5-7z"/>
                </g>
              </svg>
              <svg className="floating-paw paw-2 text-[#C9A8D4]" viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                <g fill="currentColor" opacity="0.08">
                  <path d="M20 8c-4 0-6.5 4-6.5 7s2.5 6 6.5 6 6.5-3 6.5-6-2.5-7-6.5-7z"/>
                </g>
              </svg>
              <svg className="floating-paw paw-3 text-[#C9A8D4]" viewBox="0 0 64 64" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
                <g fill="currentColor" opacity="0.08">
                  <path d="M12 24c-3 0-5 2-5 4s2 4 5 4 5-2 5-4-2-4-5-4z"/>
                </g>
              </svg>
            </div>
            
            <div className="relative">
              <h3 className="text-xl font-bold text-[#FF6B6B] mb-4">¿Eliminar desparasitación?</h3>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar esta desparasitación? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg bg-[#FF6B6B] text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
