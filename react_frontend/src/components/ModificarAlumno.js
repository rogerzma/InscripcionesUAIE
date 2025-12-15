import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "react-toastify/dist/ReactToastify.css";
import "./CrearAlumno.css";

function ModificarAlumno() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarModal, setMostrarModal] = useState(false);
  const alumno = location.state?.alumno;
  const id_carrera = localStorage.getItem("id_carrera");
  const { matriculaCord } = location.state || {};
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null); // Estado para el archivo
  const [tutores, setTutores] = useState([]); // Lista de tutores
  const matriculaTutor = matriculaCord;
  const API_URL = process.env.REACT_APP_API_URL;
  const [form, setForm] = useState({
    nombre: "",
    matricula: "",
    correo: "",
    telefono: "",
    tutor: "" // Nuevo campo para el tutor
  });

  
  // Llenar los campos del formulario con los datos del alumno
  useEffect(() => {
    if (alumno) {
      setForm({
        nombre: alumno.nombre || "",
        matricula: alumno.matricula || "",
        correo: alumno.correo || "",
        telefono: alumno.telefono || "",
        tutor: alumno.tutor || "" // Preseleccionar el tutor si ya tiene uno
      });
    }
  }, [alumno]);

  // Obtener la lista de tutores desde la API
  useEffect(() => {
    const fetchTutores = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/coordinadores/tutores/${matriculaCord}`);
        setTutores(response.data); // Suponiendo que la API regresa un array de objetos [{_id, nombre}]
      } catch (error) {
        console.error("Error al obtener tutores:", error);
      }
    };

    fetchTutores();
  }, [matriculaTutor]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guarda el archivo CSV
  };


  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
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

  const handleSubmitCSV = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Por favor selecciona un archivo CSV");
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Hubo un error al actualizar la base de datos";
      toast.error(errorMessage);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put(
        `${API_URL}/api/alumnos/${alumno._id}`,
        {
          nombre: form.nombre,
          matricula: form.matricula,
          correo: form.correo,
          telefono: form.telefono,
          tutor: form.tutor // Enviar el tutor seleccionado
        }
      );
      toast.success("Alumno actualizado con éxito");
      setTimeout(() => {
        navigate("/coordinador/alumnos", { state: { reload: true } });
      }, 200);  // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      console.error("Error al actualizar el alumno:", error);
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar el alumno";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="alumno-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="alumno-container">
        <div className="top-left">
          <button className="back-button" onClick={handleBack}>Regresar</button>
        </div>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
        <h1>Modificar Alumno</h1>
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
                  placeholder="Ingresar la matricula"
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
            </div>
            {/* Nuevo campo para seleccionar el tutor */}
            <div className="form-group">
              <div className="input-wrapper">
                <label htmlFor="tutor">Tutor</label>
                <select id="tutor" value={form.tutor} onChange={handleChange}>
                  <option value="">Sin tutor</option>
                  {tutores.map((tutor) => (
                    <option key={tutor._id} value={tutor._id}>
                      {tutor.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="alumno-buttons">
              <button type="submit" className="button">Actualizar</button>
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

export default ModificarAlumno;