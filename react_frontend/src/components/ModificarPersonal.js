import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CrearPersonal.css";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios

function ModificarPersonal() {
  const location = useLocation();
  const persona = location.state ? location.state.personal : null;

  const [form, setForm] = useState({
    nombre: persona ? persona.nombre : "",
    matricula: persona ? persona.matricula : "",
    correo: persona ? persona.correo : "",
    telefono: persona ? persona.telefono : "",
    roles: persona ? persona.roles : [],
    password: persona ? persona.password : ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verificar si hay campos vacíos
    if (!form.nombre || !form.matricula || !form.correo || !form.telefono || !form.password) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      const response = await apiClient.put(`${API_URL}/api/personal/${persona._id}`, form);
      setTimeout(() => {
        navigate("/coordinador/personal", { state: { reload: true } });
      }, 200); // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      // Usar directamente el mensaje del servidor que ahora es específico
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar el usuario";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navegar a la página anterior
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
          <button className="back-button" onClick={handleBack}>Regresar</button>
        </div>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
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
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="matricula">ID del usuario</label>
                <input
                  type="text"
                  id="matricula"
                  placeholder="Ingresar el ID de usuario"
                  value={form.matricula}
                  onChange={handleChange}
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
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Ingrese su contraseña"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="persona1-buttons">
              <button type="submit" className="button">Actualizar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModificarPersonal;
