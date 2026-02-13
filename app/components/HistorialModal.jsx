"use client";

import { useEffect, useState } from 'react';

export default function HistorialModal({ pacienteId, pacienteNombre, onClose, onSaved }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  // editMode por fila: { [rowKey]: true }
  const [editRows, setEditRows] = useState({});
  const [editedData, setEditedData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [editMode, setEditMode] = useState(false); // mantener compatibilidad para acciones globales
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!pacienteId) return;
    fetchEntries();
  }, [pacienteId]);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await fetch(`/api/historial_medico?vista&paciente_id=${pacienteId}`);
      const j = await res.json();
      if (j?.success) {
        const data = j.data || [];
        // Añadir una clave interna a cada fila si no tiene `historial_id`/`id` para usar como key
        const normalized = data.map((r, i) => ({ ...r, __rowKey: r.historial_id ?? r.id ?? `${r.nombre_mascota ?? 'row'}-${i}` }));
        setEntries(normalized);
        setSelected(normalized[0] || null);
      }
    } catch (err) {
      console.warn('Error fetching vista_historial_completo', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setSelected(prev => ({ ...prev, [field]: value }));
  }

  function toggleEditRow(rowKey, rowData) {
    setEditRows(prev => {
      const next = { ...prev };
      if (next[rowKey]) {
        delete next[rowKey];
        // remove edited data and errors
        setEditedData(ed => { const c = { ...ed }; delete c[rowKey]; return c; });
        setValidationErrors(v => { const c = { ...v }; delete c[rowKey]; return c; });
      } else {
        next[rowKey] = true;
        setEditedData(ed => ({ ...ed, [rowKey]: { ...rowData } }));
        setValidationErrors(v => ({ ...v, [rowKey]: {} }));
      }
      return next;
    });
    setSelected({ ...rowData });
  }

  function validateField(key, value) {
    if (key === 'cedula') {
      if (!value || !/^\d+$/.test(String(value).trim())) return 'La cédula debe ser solo números';
      return '';
    }
    if (['nombre_propietario', 'apellido_propietario', 'nombre_mascota'].includes(key)) {
      if (!value || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(String(value).trim())) return 'Use solo letras y espacios';
      return '';
    }
    if (key === 'telefono') {
      if (!value || !/^[0-9+\-\s()]{6,}$/.test(String(value).trim())) return 'Teléfono inválido';
      return '';
    }
    if (['edad', 'peso', 'altura'].includes(key)) {
      if (value === null || value === undefined || String(value).trim() === '') return 'Campo numérico requerido';
      if (!/^\d+(?:[\.,]\d+)?$/.test(String(value).trim())) return 'Debe ser un número válido';
      return '';
    }
    // texto libre
    if (['motivo_consulta', 'diagnostico', 'tratamiento'].includes(key)) {
      if (!value || String(value).trim().length === 0) return 'No puede estar vacío';
      return '';
    }
    return '';
  }

  function handleFieldChange(rowKey, field, value) {
    setEditedData(prev => ({ ...prev, [rowKey]: { ...(prev[rowKey] || {}), [field]: value } }));
    // validar
    const err = validateField(field, value);
    setValidationErrors(prev => ({ ...prev, [rowKey]: { ...(prev[rowKey] || {}), [field]: err } }));
  }

  function hasErrorsForRow(rowKey) {
    const errs = validationErrors[rowKey] || {};
    return Object.values(errs).some(v => v && v.length > 0);
  }

  async function handleSave() {
    const recordId = selected?.historial_id || selected?.id;
    if (!selected || !recordId) return alert('No se puede actualizar: ID no disponible');
    setSaving(true);
    try {
      const payload = {
        id: recordId,
        motivo_consulta: selected.motivo_consulta,
        diagnostico: selected.diagnostico,
        tratamiento: selected.tratamiento,
      };

      const res = await fetch('/api/historial_medico', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j?.success) {
        setEditMode(false);
        // refrescar datos
        await fetchEntries();
        if (typeof onSaved === 'function') onSaved();
      } else {
        alert(j?.error || 'Error al actualizar');
      }
    } catch (err) {
      console.error(err);
      alert('Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRow(rowKey) {
    const data = editedData[rowKey];
    if (!data) return alert('No hay cambios para guardar');
    // validar todos los campos relevantes
    const keysToCheck = ['cedula','nombre_propietario','apellido_propietario','telefono','direccion','nombre_mascota','especie','raza','edad','peso','altura','motivo_consulta','diagnostico','tratamiento'];
    const errs = {};
    for (const k of keysToCheck) {
      if (k in data) {
        const e = validateField(k, data[k]);
        if (e) errs[k] = e;
      }
    }
    if (Object.keys(errs).length) {
      setValidationErrors(prev => ({ ...prev, [rowKey]: { ...(prev[rowKey]||{}), ...errs } }));
      return alert('Corrige los errores antes de guardar');
    }

    // asegurar que obtenemos el id desde los datos editados o desde la lista original
    let recordId = data.historial_id || data.id;
    if (!recordId) {
      const original = entries.find(x => (x.__rowKey || x.historial_id || x.id || '').toString() === rowKey.toString());
      recordId = original?.historial_id || original?.id;
    }
    if (!recordId) return alert('ID no disponible para guardar');
    recordId = Number(recordId);
    setSaving(true);
    try {
      // construir payload solo con campos de historial_medico
      const payload = { id: recordId };
      if ('motivo_consulta' in data) payload.motivo_consulta = data.motivo_consulta;
      if ('diagnostico' in data) payload.diagnostico = data.diagnostico;
      if ('tratamiento' in data) payload.tratamiento = data.tratamiento;
      if ('pacientes_id_mascota' in data) payload.pacientes_id_mascota = data.pacientes_id_mascota;
      else {
        // fallback: usar el valor original si existe en entries
        const original = entries.find(x => (x.__rowKey || x.historial_id || x.id || '').toString() === rowKey.toString());
        if (original?.pacientes_id_mascota) payload.pacientes_id_mascota = original.pacientes_id_mascota;
      }
      const res = await fetch('/api/historial_medico', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (j?.success) {
        // cerrar modo edición para esa fila
        setEditRows(prev => { const c = { ...prev }; delete c[rowKey]; return c; });
        setEditedData(ed => { const c = { ...ed }; delete c[rowKey]; return c; });
        setValidationErrors(v => { const c = { ...v }; delete c[rowKey]; return c; });
        await fetchEntries();
        if (typeof onSaved === 'function') onSaved();
      } else {
        alert(j?.error || 'Error al guardar');
      }
    } catch (err) {
      console.error(err);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const labelMap = {
    cedula: 'Cédula',
    nombre_propietario: 'Nombre propietario',
    apellido_propietario: 'Apellido propietario',
    telefono: 'Teléfono',
    direccion: 'Dirección',
    nombre_mascota: 'Nombre mascota',
    especie: 'Especie',
    raza: 'Raza',
    edad: 'Edad',
    peso: 'Peso (kg)',
    altura: 'Altura (cm)',
    motivo_consulta: 'Motivo de la consulta',
    diagnostico: 'Diagnóstico',
    tratamiento: 'Tratamiento',
    pacientes_id_mascota: 'ID mascota',
  };

  function prettyLabel(key) {
    if (labelMap[key]) return labelMap[key];
    return key.replace(/_/g, ' ').replace(/(^|\s)\S/g, s => s.toUpperCase());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#F8F7F5] rounded-3xl p-6 w-full max-w-3xl shadow-2xl border-b-8 border-[#E9576E]">
        <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-800" onClick={onClose} aria-label="Cerrar">✕</button>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#E9576E]">Ficha Médica - {pacienteNombre || ''}</h3>
            <p className="text-sm text-[#64C2CE]">Vista combinada desde la base de datos</p>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Cargando historial...</div>
        ) : (
          <div className="space-y-4">
            {entries.length === 0 && <div className="text-sm text-gray-500">No hay registros para este paciente.</div>}

            {entries.map((e, i) => {
              const rowKey = e.__rowKey || e.historial_id || e.id || `${i}`;
              const isSelected = selected && (selected.__rowKey || selected.historial_id || selected.id) === rowKey;
              const rowEditing = !!editRows[rowKey];
              const edited = editedData[rowKey] || {};
              return (
                <div key={rowKey} className="border rounded-2xl p-4 cursor-default bg-gradient-to-r from-white to-[#FFF7F9] shadow-md" style={{ borderColor: '#F3B0BC' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-[#E9576E] font-bold">Ficha</div>
                      <div className="text-xs text-gray-500">{e.nombre_mascota ? e.nombre_mascota : ''}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-500 mr-2">{e.historial_id ? `#${e.historial_id}` : ''}</div>
                      {/* Header actions: pencil to enter edit; when editing show Save/Cancel */}
                      {!rowEditing ? (
                        <button onClick={() => toggleEditRow(rowKey, e)} title="Editar ficha" className="p-2 rounded-full hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E9576E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-6 6H9v-3z" />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button onClick={() => toggleEditRow(rowKey, e)} className="px-3 py-1 rounded-full border text-sm">Cancelar</button>
                          <button onClick={() => handleSaveRow(rowKey)} disabled={saving || hasErrorsForRow(rowKey)} className={`px-3 py-1 rounded-full text-sm text-white ${hasErrorsForRow(rowKey) ? 'bg-gray-400' : 'bg-[#2B8F9B]'}`}>
                            {saving ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 space-y-2">
                      {/* Mostrar campos relevantes con etiquetas bonitas, en orden preferente */}
                      {(
                        // Mostrar únicamente campos de la tabla `historial_medico` cuando estén presentes
                        [ 'historial_id', 'id', 'motivo_consulta', 'diagnostico', 'tratamiento', 'created_at', 'fecha', 'paciente_id', 'imagenes' ]
                      ).map((key) => {
                        if (!(key in selected)) return null;
                        const val = selected[key];
                        // campos editables cuando editMode está activo
                        if (rowEditing && ['motivo_consulta', 'diagnostico', 'tratamiento'].includes(key)) {
                          const currentVal = edited[key] ?? val ?? '';
                          const errMsg = (validationErrors[rowKey] || {})[key] || '';
                          return (
                            <div key={key} className="grid grid-cols-2 gap-3 py-1 items-start">
                              <div className="text-xs text-gray-500">{prettyLabel(key)}</div>
                              <div>
                                {key === 'motivo_consulta' ? (
                                  <>
                                    <textarea value={currentVal} onChange={(ev) => handleFieldChange(rowKey, key, ev.target.value)} className="w-full border rounded-md p-2" />
                                    {errMsg && <div className="text-xs text-red-600 mt-1">{errMsg}</div>}
                                  </>
                                ) : (
                                  <>
                                    <input value={currentVal} onChange={(ev) => handleFieldChange(rowKey, key, ev.target.value)} className="w-full border rounded-md p-2" />
                                    {errMsg && <div className="text-xs text-red-600 mt-1">{errMsg}</div>}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={key} className="grid grid-cols-2 gap-3 py-1">
                            <div className="text-xs text-gray-500">{prettyLabel(key)}</div>
                            <div className="text-sm text-gray-700">{val === null || typeof val === 'undefined' || val === '' ? '-' : String(val)}</div>
                          </div>
                        );
                      })}

                      {/* Mostrar cualquier otro campo adicional al final */}
                      {/* No mostrar otros campos: sólo datos de historial_medico */}
                    </div>
                  )}
                  {/* Los controles Guardar/Cancelar ahora están en el encabezado mientras se edita (evitar duplicados) */}
                </div>
              );
            })}

            {/* controles por fila: aparecerán dentro de la tarjeta mientras se edita */}
          </div>
        )}
      </div>
    </div>
  );
}
