import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CrearAlumno.css";

function CrearAlumno() {
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tutores, setTutores] = useState([]); // Lista de tutores
  const location = useLocation();
  const id_carrera = localStorage.getItem("id_carrera");
  const { matriculaCord } = location.state || {};
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null); // Estado para el archivo
  const API_URL = process.env.REACT_APP_API_URL;
  const [form, setForm] = useState({
    nombre: "",
    matricula: "",
    correo: "",
    telefono: "",
    tutor: "", // Nuevo campo para el tutor
    matriculaCord: matriculaCord
  });

  const validarMatricula = (matricula) => {
    // 1 letra mayúscula + 4 dígitos
    return /^[A-Z]\d{4}$/.test(matricula);
  };


  // Obtener la lista de tutores desde la API
  useEffect(() => {
    const fetchTutores = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/coordinadores/tutores/${(matriculaCord)}`);
        setTutores(response.data); // Suponiendo que la API regresa un array de objetos [{_id, nombre}]
      } catch (error) {
        console.error("Error al obtener tutores:", error);
      }
    };

    fetchTutores();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guarda el archivo CSV
  };

  const handleSubmitCSV = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warn("Por favor selecciona un archivo CSV");
      return;
    }
  
    const formData = new FormData();
    formData.append("csv", file);
  
    try {
      const response = await apiClient.post(
        `${API_URL}/api/alumnos/subir-csv/carrera/${id_carrera}`, // <-- Ahora incluye id_carrera
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      toast.success("Base de datos actualizada con éxito desde el archivo CSV");
  
      setMostrarModal(false); // Cierra el modal después de subir el archivo
    } catch (error) {
      console.error("Error al subir el archivo CSV:", error);
      const errorMsg = error.response?.data?.message || "Hubo un error al actualizar la base de datos";
      toast.error(errorMsg);
    }
  };
  

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Convertir matrícula a mayúsculas y limitar caracteres
    if (id === "matricula") {
      const upperValue = value.toUpperCase();
      // Solo permitir letras mayúsculas al inicio y números después, máximo 5 caracteres
      if (/^[A-Z]?\d{0,4}$/.test(upperValue) || upperValue === "") {
        setForm({ ...form, [id]: upperValue });
      }
    } else {
      setForm({ ...form, [id]: value });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  }

  const handleBack = () => { 
    navigate(-1); // Navegar a la página anterior 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!form.nombre || !form.nombre.trim()) {
      toast.error("Falta el campo: Nombre");
      return;
    }
    
    if (!form.matricula || !form.matricula.trim()) {
      toast.error("Falta el campo: Matrícula");
      return;
    }
    
    // Validar matrícula
    if (!validarMatricula(form.matricula)) {
      toast.error("La matrícula debe tener 1 letra mayúscula seguida de 4 dígitos (Ej: A1234)");
      console.log("Matrícula inválida:", form.matricula);
      return;
    }
    
    if (!form.correo || !form.correo.trim()) {
      toast.error("Falta el campo: Correo electrónico");
      return;
    }
    
    if (!form.telefono || !form.telefono.trim()) {
      toast.error("Falta el campo: Teléfono");
      return;
    }
    
    try {
      console.log("Enviando datos del alumno:", form);
      const response = await apiClient.post(`${API_URL}/api/alumnos`, form);
      console.log("Alumno creado exitosamente:", response.data);
      toast.success("Alumno agregado con éxito");
      setForm({ nombre: "", matricula: "", correo: "", telefono: "", tutor: "" }); // Reset form
      setTimeout(() => {
        navigate("/coordinador/alumnos", { state: { reload: true } });
      }, 200); // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      console.error("Error completo al agregar el alumno:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      console.error("Status del error:", error.response?.status);
      const errorMessage = error.response?.data?.message || "Hubo un error al agregar el alumno";
      toast.error(errorMessage);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/alumnos/exportar-csv/carrera/${id_carrera}`,
        {
          responseType: "blob", // Asegúrate de recibir el archivo como blob
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `alumnos_carrera_${id_carrera}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo CSV:", error);
      toast.error("No se pudo descargar el archivo");
    }
  };

  const handleSumbitDB = async (e) => {
    setMostrarModal(true);
    return;
  }

  return (
    <div className="alumno-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="alumno-container">
          <button className="back-button" onClick={handleBack}>Regresar</button> 
        <div className="top-right"> 
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button> 
        </div>
        <h1>Agregar alumno</h1>
        <div className="alumno-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del alumno"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="matricula">Matricula</label>
                <input
                  type="text"
                  id="matricula"
                  placeholder="Ej: A1234"
                  value={form.matricula}
                  onChange={handleChange}
                  maxLength={5}
                  required
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
                <label htmlFor="telefono">Telefono</label>
                <input
                  type="text"
                  id="telefono"
                  placeholder="000-000-0000"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper">
                <label htmlFor="tutor">Tutor (Opcional)</label>
                <select id="tutor" value={form.tutor} onChange={handleChange}>
                  <option value="">Selecciona un tutor (opcional)</option>
                  {tutores.map((tutor) => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="alumno-buttons">
              <button type="submit" className="button">Agregar</button>
            </div>
          </form>
          <div className="alumno-buttons">
              <button type="button" className="button" onClick={handleSumbitDB}>Subir base de datos de alumnos</button>
            </div>
        </div>
      </div>
            {mostrarModal && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Subir base de datos</h3>
                  <p>Seleccione el archivo a subir:</p>
                  <ul>
                  </ul>
                  <p>
                  </p>
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <button onClick={handleSubmitCSV}>Subir CSV</button>
                  <button onClick={handleDownloadCSV}>Descargar CSV</button>
                  <button onClick={() => setMostrarModal(false)}>Cerrar</button>
                </div>
              </div>
            )}
    </div>
  );
}

export default CrearAlumno;