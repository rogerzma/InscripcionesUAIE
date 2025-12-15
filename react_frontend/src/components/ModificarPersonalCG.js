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