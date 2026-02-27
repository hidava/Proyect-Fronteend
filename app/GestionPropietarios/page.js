"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GestionPropietarios() {
  const [propietarios, setPropietarios] = useState([]);
  const [loadingPropietarios, setLoadingPropietarios] = useState(true);
  const [selectedPropietario, setSelectedPropietario] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [loadingPacientes, setLoadingPacientes] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState(false);
  const [editedPropietario, setEditedPropietario] = useState(null);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const [editedPaciente, setEditedPaciente] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [mascotasCount, setMascotasCount] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserCedula, setCurrentUserCedula] = useState(null);
  const router = useRouter();
  const isSuccessMessage = message && message.toLowerCase().includes('correctamente');

  // Cargar propietarios y usuario actual al montar
  useEffect(() => {
    fetchPropietarios();
    // Obtener información del usuario actual de la cookie
    if (typeof document !== 'undefined') {
      const userInfoCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('userInfo='));
      
      if (userInfoCookie) {
        try {
          const userInfoStr = decodeURIComponent(userInfoCookie.split('=')[1]);
          const userInfo = JSON.parse(userInfoStr);
          setCurrentUserCedula(userInfo.cedula);
        } catch (error) {
          console.warn('Error al leer información del usuario:', error);
        }
      }
    }
  }, []);

  // Cargar pacientes cuando se selecciona propietario
  useEffect(() => {
    if (selectedPropietario) {
      fetchPacientes(selectedPropietario.cedula);
    }
  }, [selectedPropietario]);

  async function fetchPropietarios() {
    setLoadingPropietarios(true);
    try {
      const res = await fetch('/api/proprietarios');
      const json = await res.json();
      if (json?.success) {
        const propietariosData = json.data || [];
        setPropietarios(propietariosData);
        
        // Obtener conteo de mascotas para cada propietario
        const countPromises = propietariosData.map(async (prop) => {
          try {
            const pacRes = await fetch(`/api/pacientes/owner/${prop.cedula}`);
            const pacJson = await pacRes.json();
            const count = pacJson?.success ? (pacJson.data || []).length : 0;
            console.log(`Propietario ${prop.nombre} ${prop.apellido} tiene ${count} mascotas`);
            return { cedula: prop.cedula, count };
          } catch (error) {
            console.error(`Error obteniendo mascotas para ${prop.cedula}:`, error);
            return { cedula: prop.cedula, count: 0 };
          }
        });

        const results = await Promise.all(countPromises);
        const counts = {};
        results.forEach(({ cedula, count }) => {
          counts[cedula] = count;
        });
        console.log('Conteo de mascotas:', counts);
        setMascotasCount(counts);
      }
    } catch (err) {
      console.warn('Error loading propietarios:', err);
    } finally {
      setLoadingPropietarios(false);
    }
  }

  async function fetchPacientes(cedula) {
    setLoadingPacientes(true);
    try {
      const res = await fetch(`/api/pacientes/owner/${cedula}`);
      const json = await res.json();
      if (json?.success) {
        setPacientes(json.data || []);
      }
    } catch (err) {
      console.warn('Error loading pacientes:', err);
    } finally {
      setLoadingPacientes(false);
    }
  }

  function closeModal() {
    setSelectedPropietario(null);
    setEditingPropietario(false);
    setEditedPropietario(null);
    setEditingPaciente(null);
    setEditedPaciente(null);
    setMessage('');
    setShowDeleteConfirm(null);
  }

  async function handleSavePropietario() {
    if (!editedPropietario) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/proprietarios/${selectedPropietario.cedula}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedPropietario)
      });
      const json = await res.json();
      if (json?.success) {
        setMessage('Propietario actualizado correctamente');
        const updatedPropietario = json.data || editedPropietario;
        setEditingPropietario(false);
        setSelectedPropietario(updatedPropietario);
        setEditedPropietario(null);
        // Actualizar el estado local inmediatamente
        setPropietarios(prevPropietarios =>
          prevPropietarios.map(p =>
            p.cedula === selectedPropietario.cedula ? updatedPropietario : p
          )
        );
      } else {
        setMessage(json?.message || 'Error al guardar');
      }
    } catch (err) {
      setMessage('Error al guardar propietario');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePropietario() {
    if (!selectedPropietario) return;
    
    // Verificar si el usuario está eliminando su propia cuenta
    const isDeletingSelf = currentUserCedula && selectedPropietario.cedula === currentUserCedula;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/proprietarios/${selectedPropietario.cedula}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json?.success) {
        if (isDeletingSelf) {
          // El usuario eliminó su propia cuenta
          // Eliminar cookies del cliente
          document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'userInfo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          // Guardar mensaje en localStorage para mostrarlo en el login
          localStorage.setItem('deletionMessage', 'El usuario ingresado acaba de ser eliminado');
          
          // Redirigir al login
          router.push('/');
        } else {
          // Eliminación normal de otro propietario
          setMessage('Propietario eliminado correctamente');
          // Actualizar el estado local inmediatamente
          setPropietarios(prevPropietarios =>
            prevPropietarios.filter(p => p.cedula !== selectedPropietario.cedula)
          );
          setTimeout(() => closeModal(), 1000);
        }
      } else {
        setMessage(json?.message || 'Error al eliminar');
      }
    } catch (err) {
      setMessage('Error al eliminar propietario');
    } finally {
      setSaving(false);
      setShowDeleteConfirm(null);
    }
  }

  async function handleSavePaciente() {
    if (!editedPaciente) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/pacientes/${editedPaciente.id_mascota}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedPaciente)
      });
      const json = await res.json();
      if (json?.success) {
        setMessage('Paciente actualizado correctamente');
        // Actualizar el estado local inmediatamente para reflejar cambios
        setPacientes(prevPacientes =>
          prevPacientes.map(p =>
            p.id_mascota === editedPaciente.id_mascota ? editedPaciente : p
          )
        );
        setEditingPaciente(null);
        setEditedPaciente(null);
      } else {
        setMessage(json?.message || 'Error al guardar');
      }
    } catch (err) {
      setMessage('Error al guardar paciente');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePaciente(pacienteId) {
    setSaving(true);
    try {
      const res = await fetch(`/api/pacientes/${pacienteId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json?.success) {
        setMessage('Paciente eliminado correctamente');
        // Actualizar el estado local inmediatamente
        setPacientes(prevPacientes =>
          prevPacientes.filter(p => p.id_mascota !== pacienteId)
        );
        setShowDeleteConfirm(null);
      } else {
        setMessage(json?.message || 'Error al eliminar');
      }
    } catch (err) {
      setMessage('Error al eliminar paciente');
    } finally {
      setSaving(false);
    }
  }

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#FF6B6B]">Gestión de Propietarios y Mascotas</h1>
                  <p className="text-xs sm:text-sm text-[#9BCDB0] mt-1">Administra la información de los propietarios y sus mascotas</p>
                </div>
              </div>
              <div className="flex justify-center sm:justify-end">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#C9A8D4] to-[#8E7CC3] text-white text-sm font-semibold hover:from-[#B897C3] hover:to-[#7C67B3] hover:shadow-xl transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver al Dashboard
                </a>
              </div>
            </div>

            {/* Buscador */}
            <div className="mb-6 flex justify-end">
              <div className="relative w-full sm:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar propietario..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9BCDB0] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#FF6B6B] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Lista de propietarios estilo tabla */}
            <div className="space-y-3">
          {loadingPropietarios ? (
            <div className="text-center text-gray-500 py-8">Cargando propietarios...</div>
          ) : propietarios.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No hay propietarios registrados</div>
          ) : (
            <>
              {(() => {
                const filteredPropietarios = propietarios.filter(prop => {
                  if (!searchTerm) return true;
                  const search = searchTerm.toLowerCase();
                  return (
                    prop.nombre.toLowerCase().includes(search) ||
                    prop.apellido.toLowerCase().includes(search) ||
                    prop.cedula.toString().includes(search)
                  );
                });

                if (filteredPropietarios.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <p className="text-gray-500 font-medium">No se encontraron propietarios con &quot;{searchTerm}&quot;</p>
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-[#9BCDB0] text-white rounded-lg hover:bg-[#7ab89f] transition-colors"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  );
                }

                return filteredPropietarios.map((prop, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedPropietario(prop)}
                className="group relative cursor-pointer"
              >
                <div className="relative bg-gradient-to-r from-white/80 via-[#FFF4E0]/30 to-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-md hover:shadow-xl hover:border-gray-300/80 transition-all duration-300 hover:scale-[1.01] overflow-hidden">
                  
                  {/* Borde izquierdo decorativo */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FF6B6B] via-[#9BCDB0] to-[#8E7CC3] group-hover:w-1.5 transition-all duration-300"></div>
                  
                  {/* Efecto de brillo hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                  
                  {/* Desktop y tablet: Layout horizontal completo */}
                  <div className="hidden md:flex relative items-center px-5 py-3 gap-4">
                    
                    {/* Avatar decorativo */}
                    <div className="flex-shrink-0">
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E7A] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                        <span className="relative text-lg font-black text-white">{prop.nombre[0]}{prop.apellido[0]}</span>
                      </div>
                    </div>
                    
                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg className="w-3 h-3 text-[#9BCDB0]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide">Nombre</span>
                      </div>
                      <div className="text-base font-extrabold text-gray-800 truncate group-hover:text-[#FF6B6B] transition-colors duration-300">{prop.nombre}</div>
                    </div>
                    
                    {/* Separador */}
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                    
                    {/* Apellido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg className="w-3 h-3 text-[#9BCDB0]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                        <span className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide">Apellido</span>
                      </div>
                      <div className="text-base font-extrabold text-gray-800 truncate group-hover:text-[#FF6B6B] transition-colors duration-300">{prop.apellido}</div>
                    </div>
                    
                    {/* Separador */}
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
                    
                    {/* Cédula */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg className="w-3 h-3 text-[#9BCDB0]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide">Cédula</span>
                      </div>
                      <div className="text-base font-extrabold text-gray-800">{prop.cedula}</div>
                    </div>

                    {/* Separador */}
                    <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                    {/* Contador de mascotas */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg className="w-3 h-3 text-[#9BCDB0]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                        </svg>
                        <span className="text-xs font-bold text-[#9BCDB0] uppercase tracking-wide">Mascotas</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8E7CC3] to-[#C9A8D4] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                          <span className="text-lg font-black text-white">{mascotasCount[prop.cedula] ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Botón de ver más */}
                    <div className="flex-shrink-0 ml-1">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9BCDB0] to-[#7ab89f] flex items-center justify-center text-white group-hover:scale-110 transition-all duration-300 shadow-md group-hover:shadow-lg">
                        <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Layout vertical compacto */}
                  <div className="md:hidden relative flex items-center px-4 py-3 gap-3">
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E7A] flex items-center justify-center shadow-md">
                        <span className="text-lg font-black text-white">{prop.nombre[0]}{prop.apellido[0]}</span>
                      </div>
                    </div>
                    
                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-extrabold text-gray-800 truncate">{prop.nombre} {prop.apellido}</div>
                      <div className="text-sm text-gray-600 mt-0.5">Cédula: {prop.cedula}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3 text-[#8E7CC3]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                        </svg>
                        <span className="text-xs font-bold text-[#8E7CC3]">{mascotasCount[prop.cedula] ?? 0} mascotas</span>
                      </div>
                    </div>

                    {/* Botón ver más */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#9BCDB0] to-[#7ab89f] flex items-center justify-center text-white shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decoraciones de esquina */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-[#9BCDB0]/5 to-transparent rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-[#FF6B6B]/5 to-transparent rounded-tr-full"></div>
                </div>
              </div>
                ));
              })()}
            </>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalles propietario */}
      {selectedPropietario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-[#F8F7F5] rounded-3xl p-6 sm:p-8 w-full max-w-5xl shadow-2xl border-2 border-[#C9A8D4]/40 max-h-[90vh] overflow-y-auto">
            {/* Efectos de fondo decorativos */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#C9A8D4]/20 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-[#9BCDB0]/20 blur-3xl" />
            
            <div className="relative">
              <button
                className="absolute right-0 top-0 text-gray-400 hover:text-[#FF6B6B] text-3xl font-light transition-colors duration-200"
                onClick={closeModal}
                aria-label="Cerrar"
              >
                ✕
              </button>

              <div className="flex items-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8E7CC3] to-[#C9A8D4] text-white text-2xl font-bold shadow-lg mr-4">
                  {selectedPropietario.nombre[0]}{selectedPropietario.apellido[0]}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#FF6B6B]">
                    {selectedPropietario.nombre} {selectedPropietario.apellido}
                  </h2>
                  <p className="text-sm text-[#9BCDB0] font-medium">Cédula: {selectedPropietario.cedula}</p>
                </div>
              </div>

            {message && (
              <div
                className={`mb-6 rounded-2xl border-2 px-5 py-3.5 text-sm font-medium shadow-sm ${
                  isSuccessMessage ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700' : 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            {/* Sección de propietario */}
            <div className="mb-8 pb-8 border-b-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-[#FF6B6B] via-[#8E7CC3] to-[#C9A8D4] rounded-full mr-3 shadow-md"></div>
                  <span className="bg-gradient-to-r from-[#FF6B6B] to-[#8E7CC3] bg-clip-text text-transparent">Datos del Propietario</span>
                </h3>
              </div>
              {editingPropietario ? (
                <div className="space-y-4 bg-white/60 p-6 rounded-2xl shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                      <input
                        value={editedPropietario?.nombre || ''}
                        onChange={(e) => setEditedPropietario({...editedPropietario, nombre: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8E7CC3]/20 focus:border-[#8E7CC3] transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido</label>
                      <input
                        value={editedPropietario?.apellido || ''}
                        onChange={(e) => setEditedPropietario({...editedPropietario, apellido: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8E7CC3]/20 focus:border-[#8E7CC3] transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                      <input
                        value={editedPropietario?.telefono || ''}
                        onChange={(e) => setEditedPropietario({...editedPropietario, telefono: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8E7CC3]/20 focus:border-[#8E7CC3] transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                      <input
                        value={editedPropietario?.direccion || ''}
                        onChange={(e) => setEditedPropietario({...editedPropietario, direccion: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#8E7CC3]/20 focus:border-[#8E7CC3] transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative bg-gradient-to-br from-white via-[#FFF9E6]/30 to-white p-6 rounded-2xl border-l-4 border-[#8E7CC3] shadow-lg overflow-hidden group">
                  {/* Efectos decorativos de fondo */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#8E7CC3]/10 to-transparent rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#9BCDB0]/10 to-transparent rounded-full blur-xl" />
                  
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="group/item">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-4 h-4 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</div>
                      </div>
                      <div className="text-gray-900 font-bold text-base pl-6">{selectedPropietario.nombre}</div>
                    </div>
                    <div className="group/item">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-4 h-4 text-[#8E7CC3]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                        </svg>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Apellido</div>
                      </div>
                      <div className="text-gray-900 font-bold text-base pl-6">{selectedPropietario.apellido}</div>
                    </div>
                    <div className="group/item">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-4 h-4 text-[#9BCDB0]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Teléfono</div>
                      </div>
                      <div className="text-gray-900 font-bold text-base pl-6">{selectedPropietario.telefono || 'No registrado'}</div>
                    </div>
                    <div className="group/item">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-4 h-4 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dirección</div>
                      </div>
                      <div className="text-gray-900 font-bold text-base pl-6">{selectedPropietario.direccion || 'No registrada'}</div>
                    </div>
                  </div>
                </div>
              )}

              {showDeleteConfirm === 'propietario' && (
                <div className="mt-6 rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50 px-5 py-4 shadow-md">
                  <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="font-bold text-red-800 text-base">¿Está seguro de que desea eliminar este propietario?</div>
                  </div>
                  <p className="text-xs text-red-700 mb-4">Esta acción no se puede deshacer.</p>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-5 py-2 rounded-full border-2 border-red-200 bg-white text-red-700 font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200 transform hover:scale-105"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePropietario}
                      disabled={saving}
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                      {saving ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setShowDeleteConfirm('propietario')}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 hover:border-red-400 hover:text-red-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  Eliminar
                </button>
                <div className="flex items-center justify-end space-x-3">
                  {editingPropietario ? (
                    <>
                      <button
                        onClick={() => {
                          setEditingPropietario(false);
                          setEditedPropietario(null);
                          setMessage('');
                        }}
                        className="px-6 py-2.5 rounded-full bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSavePropietario}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#8E7CC3] to-[#C9A8D4] text-white font-semibold hover:from-[#7C67B3] hover:to-[#B897C3] hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                      >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPropietario(true);
                        setEditedPropietario({...selectedPropietario});
                      }}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9BCDB0] to-[#7ab89f] text-white font-semibold hover:from-[#7ab89f] hover:to-[#68a88d] hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sección de pacientes */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-[#9BCDB0] via-[#7ab89f] to-[#68a88d] rounded-full mr-3 shadow-md"></div>
                <span className="bg-gradient-to-r from-[#9BCDB0] to-[#7ab89f] bg-clip-text text-transparent">Mascotas del Propietario</span>
              </h3>
              {loadingPacientes ? (
                <div className="text-center text-gray-500 py-8">Cargando mascotas...</div>
              ) : pacientes.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 font-medium">No hay mascotas registradas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {pacientes.map((pac, idx) => (
                    <div key={idx} className="group relative bg-gradient-to-br from-white via-[#FFF9E6]/20 to-white rounded-2xl border-l-4 border-[#8E7CC3] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                      {/* Efectos decorativos */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#9BCDB0]/20 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-[#8E7CC3]/10 to-transparent rounded-full blur-xl group-hover:scale-125 transition-transform duration-700" />
                      
                      {/* Banda superior animada */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9BCDB0] via-[#8E7CC3] to-[#FF6B6B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      
                      {/* Esquina decorativa */}
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[25px] border-r-[25px] border-t-transparent border-r-[#8E7CC3] opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                      
                      <div className="relative z-10 p-5">
                      {editingPaciente === pac.id_mascota ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Nombre</label>
                            <input
                              disabled
                              value={editedPaciente?.nombre || ''}
                              onChange={(e) => setEditedPaciente({...editedPaciente, nombre: e.target.value})}
                              className="block w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed opacity-70 text-sm font-medium"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Especie</label>
                              <input
                                value={editedPaciente?.especie || ''}
                                onChange={(e) => setEditedPaciente({...editedPaciente, especie: e.target.value})}
                                className="block w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E7CC3]/30 focus:border-[#8E7CC3] text-sm transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Raza</label>
                              <input
                                value={editedPaciente?.raza || ''}
                                onChange={(e) => setEditedPaciente({...editedPaciente, raza: e.target.value})}
                                className="block w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E7CC3]/30 focus:border-[#8E7CC3] text-sm transition-all duration-200"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Edad</label>
                              <input
                                value={editedPaciente?.edad || ''}
                                onChange={(e) => setEditedPaciente({...editedPaciente, edad: e.target.value})}
                                className="block w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E7CC3]/30 focus:border-[#8E7CC3] text-sm transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Peso</label>
                              <input
                                value={editedPaciente?.peso || ''}
                                onChange={(e) => setEditedPaciente({...editedPaciente, peso: e.target.value})}
                                className="block w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E7CC3]/30 focus:border-[#8E7CC3] text-sm transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">Altura</label>
                              <input
                                value={editedPaciente?.altura || ''}
                                onChange={(e) => setEditedPaciente({...editedPaciente, altura: e.target.value})}
                                className="block w-full px-2 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8E7CC3]/30 focus:border-[#8E7CC3] text-sm transition-all duration-200"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setEditingPaciente(null);
                                setEditedPaciente(null);
                              }}
                              className="flex-1 px-3 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 hover:shadow-md transition-all duration-200 text-sm transform hover:scale-105"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={handleSavePaciente}
                              disabled={saving}
                              className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#8E7CC3] to-[#C9A8D4] text-white font-semibold hover:from-[#7C67B3] hover:to-[#B897C3] hover:shadow-lg transition-all duration-200 disabled:opacity-50 text-sm transform hover:scale-105"
                            >
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {/* Header con avatar y nombre */}
                          <div className="flex items-center mb-4">
                            <div className="relative flex-shrink-0">
                              {/* Glow effect en avatar */}
                              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B] to-[#ff8a7a] rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500 scale-110" />
                              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ff8a7a] flex items-center justify-center text-white font-extrabold text-xl shadow-lg transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                                <span className="relative z-10">{pac.nombre[0]}</span>
                                {/* Ring pulsante */}
                                <div className="absolute inset-0 rounded-full border-2 border-white/40 scale-110 animate-pulse" />
                              </div>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h4 className="font-extrabold text-gray-900 text-lg mb-0.5 group-hover:text-[#9BCDB0] transition-colors duration-300 truncate">{pac.nombre}</h4>
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-gradient-to-r from-[#9BCDB0]/20 to-[#7ab89f]/20 rounded-full text-[10px] font-bold text-[#7ab89f] uppercase tracking-wider">{pac.especie}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs text-gray-600 font-medium">{pac.raza}</span>
                              </div>
                            </div>
                          </div>

                          {/* Stats con diseño moderno */}
                          <div className="relative bg-gradient-to-br from-white/50 to-gray-50/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-gray-200/50 shadow-inner group-hover:border-[#9BCDB0]/30 transition-all duration-300">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1.5">
                                  <svg className="w-3.5 h-3.5 text-[#FF6B6B]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                  </svg>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Edad</div>
                                </div>
                                <div className="text-lg font-extrabold text-gray-900">{pac.edad || '-'}</div>
                              </div>
                              <div className="text-center border-x border-gray-200">
                                <div className="flex items-center justify-center gap-1 mb-1.5">
                                  <svg className="w-3.5 h-3.5 text-[#8E7CC3]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd"/>
                                  </svg>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Peso</div>
                                </div>
                                <div className="text-lg font-extrabold text-gray-900">{pac.peso || '-'}</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1.5">
                                  <svg className="w-3.5 h-3.5 text-[#9BCDB0]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                                  </svg>
                                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Altura</div>
                                </div>
                                <div className="text-lg font-extrabold text-gray-900">{pac.altura || '-'}</div>
                              </div>
                            </div>
                          </div>

                          {/* Confirmación de eliminación inline */}
                          {showDeleteConfirm === pac.id_mascota && (
                            <div className="mb-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl animate-pulse">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-xs font-bold text-red-800">¿Eliminar esta mascota?</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-gray-50 transition-all duration-200"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleDeletePaciente(pac.id_mascota)}
                                  disabled={saving}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold hover:from-red-600 hover:to-red-700 hover:shadow-md transition-all duration-200 disabled:opacity-50"
                                >
                                  {saving ? 'Eliminando...' : 'Confirmar'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Botones de acción */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPaciente(pac.id_mascota);
                                setEditedPaciente({...pac});
                              }}
                              className="group/btn flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9BCDB0] to-[#7ab89f] text-white text-sm font-bold hover:from-[#7ab89f] hover:to-[#68a88d] hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(pac.id_mascota)}
                              className="group/btn px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 hover:border-red-400 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón cerrar al final */}
            <div className="flex justify-end mt-8 pt-6 border-t-2 border-gray-200">
              <button
                onClick={closeModal}
                className="px-8 py-2.5 rounded-full bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 hover:shadow-md transition-all duration-200 transform hover:scale-105"
              >
                Cerrar
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
