import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "./CrearPersonal.css";

function ModificarPersonalCG() {
  const navigate = useNavigate();
  const location = useLocation();
  const personalSeleccionado = location.state?.personal || {}; // Recibir los datos del personal seleccionado

  const [mostrarCarrera, setMostrarCarrera] = useState(false); // Mostrar campo de carrera
  const [nuevaPassword, setNuevaPassword] = useState(""); // Nueva contraseña
  const [actualizandoPassword, setActualizandoPassword] = useState(false); // Estado de carga
  const [mostrarPassword, setMostrarPassword] = useState(false); // Mostrar/ocultar contraseña nueva

  const validarPassword = (password) => {
    // Mínimo 8 caracteres y al menos un carácter especial
    const tieneMinimo8 = password.length >= 8;
    const tieneCaracterEspecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/.test(password);
    return tieneMinimo8 && tieneCaracterEspecial;
  };

  const [form, setForm] = useState({
    nombre: personalSeleccionado.nombre || "",
    matricula: personalSeleccionado.matricula || "",
    correo: personalSeleccionado.correo || "",
    telefono: personalSeleccionado.telefono || "",
    roles: personalSeleccionado.roles || "",
    password: "", // No se muestra la contraseña actual por seguridad
    id_carrera: personalSeleccionado.id_carrera ? personalSeleccionado.id_carrera : "" // <-- fuerza vacío si null/undefined
  });

  const carrerasPermitidas = {
    Defect: "Seleccione una carrera",
    ISftw: "Ing. en Software",
    IDsr: "Ing. en Desarrollo",
    IEInd: "Ing. Electrónica Industrial",
    ICmp: "Ing. Computación",
    IRMca: "Ing. Robótica y Mecatrónica",
    IElec: "Ing. Electricista",
    ISftwS: "Ing. en Software (Semiescolarizado)",
    IDsrS: "Ing. en Desarrollo (Semiescolarizado)",
    IEIndS: "Ing. Electrónica Industrial(Semiescolarizado)",
    ICmpS: "Ing. Computación (Semiescolarizado)",
    IRMcaS: "Ing. Robótica y Mecatrónica (Semiescolarizado)",
    IElecS: "Ing. Electricista (Semiescolarizado)",
  };
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env
  const token = localStorage.getItem("token");

  // Configurar mostrarCarrera al cargar la página
  useEffect(() => {
    setMostrarCarrera(form.roles === "C" || form.roles === "A");
  }, [form.roles]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar que si el rol es Coordinador o Administrador, se haya seleccionado una carrera
    if ((form.roles === "C" || form.roles === "A") && !form.id_carrera) {
      toast.error("Debe seleccionar una carrera para el Coordinador o Administrador.");
      return;
    }

    try {
      const response = await apiClient.put(
        `${API_URL}/api/personal/${personalSeleccionado._id}`,
        form
      );
      toast.success("Usuario actualizado con éxito");
      setTimeout(() => {
        navigate("/coord-gen/personal", { state: { reload: true } });
      }, 200); // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      // Usar directamente el mensaje del servidor que ahora es específico
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar el usuario";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate("/coord-gen/personal"); // Navegar a la página anterior
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  };

  return (
    <div className="persona1-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="persona1-container">
        <div className="top-left">
          <button className="back-button" onClick={handleBack}>
            Regresar
          </button>
        </div>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <h1>Modificar personal</h1>
        <div className="persona1-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del personal"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="matricula">Matricula</label>
                <input
                  type="text"
                  id="matricula"
                  placeholder="Matrícula"
                  value={form.matricula}
                  onChange={handleChange}
                  disabled // No se permite modificar la matrícula
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  type="email"
                  id="correo"
                  placeholder="alguien@example.com"
                  value={form.correo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  placeholder="000-000-0000"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              {(mostrarCarrera || (form.roles === "C" && !form.id_carrera)) && (
                <div className="input-wrapper short-field2">
                  <label htmlFor="id_carrera">Carrera</label>
                  <select id="id_carrera" value={form.id_carrera || ""} onChange={handleChange} required>
                    <option value="" disabled>
                      Seleccione una carrera
                    </option>
                    {Object.entries(carrerasPermitidas).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* Apartado especial para cambiar carrera si matrícula inicia con C */}
            {form.matricula.startsWith('C') && (
              <div className="form-group" style={{ marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', background: '#f9f9f9' }}>
                <label style={{ fontWeight: 'bold', marginBottom: '10px' }}>Cambiar carrera del coordinador</label>
                <select
                  value={form.id_carrera || ""}
                  onChange={e => setForm(prev => ({ ...prev, id_carrera: e.target.value }))}
                  style={{ marginRight: '10px' }}
                >
                  <option value="" disabled>Seleccione nueva carrera</option>
                  {Object.entries(carrerasPermitidas).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await apiClient.put(`${API_URL}/api/personal/${personalSeleccionado._id}`,
                        { ...form, id_carrera: form.id_carrera });
                      setForm(prev => ({ ...prev, id_carrera: form.id_carrera }));
                      toast.success('Carrera actualizada correctamente');
                    } catch (error) {
                      const errorMessage = error.response?.data?.message || 'Error al actualizar la carrera';
                      toast.error(errorMessage);
                    }
                  }}
                  style={{ padding: '6px 16px' }}
                  disabled={!form.id_carrera}
                >Actualizar carrera</button>
              </div>
            )}
            {/* Apartado para actualizar contraseña */}
            <div className="form-group" style={{ marginTop: '20px', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', background: '#f9f9f9' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Actualizar contraseña</label>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ marginRight: '10px' }}>Contraseña actual:</label>
                <span style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>••••••••</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', maxWidth: '250px' }}>
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    style={{ padding: '9px', paddingRight: '40px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
                  />
                  <span
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '0',
                      bottom: '0',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    title={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {mostrarPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!nuevaPassword || !validarPassword(nuevaPassword)) {
                      toast.error('La contraseña debe tener mínimo 8 caracteres y al menos un carácter especial (!@#$%^&*...)');
                      return;
                    }
                    setActualizandoPassword(true);
                    try {
                      await apiClient.put(`${API_URL}/api/personal/${personalSeleccionado._id}`, {
                        password: nuevaPassword
                      });
                      toast.success('Contraseña actualizada correctamente');
                      setNuevaPassword('');
                    } catch (error) {
                      const errorMessage = error.response?.data?.message || 'Error al actualizar la contraseña';
                      toast.error(errorMessage);
                    } finally {
                      setActualizandoPassword(false);
                    }
                  }}
                  style={{ padding: '8px 16px' }}
                  disabled={actualizandoPassword || !nuevaPassword}
                >
                  {actualizandoPassword ? 'Guardando...' : 'Guardar contraseña'}
                </button>
              </div>
            </div>
            <div className="persona1-buttons">
              <button type="submit">Actualizar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModificarPersonalCG;