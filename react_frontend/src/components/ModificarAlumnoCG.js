import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "react-toastify/dist/ReactToastify.css";
import "./CrearAlumno.css";

function ModificarAlumnoCG() {
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const location = useLocation();
  const alumno = location.state?.alumno;
  const token = localStorage.getItem("token");
  const { matriculaCord } = location.state || {};
  const [tutores, setTutores] = useState([]); // Lista de tutores
  const matriculaTutor = matriculaCord;
  const [file, setFile] = useState(null); // Estado para el archivo
  
  const [form, setForm] = useState({
    nombre: "",
    id_carrera: "",
    matricula: "",
    correo: "",
    telefono: "",
    tutor: "" // Nuevo campo para el tutor
  });

  const carrerasPermitidas = {
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


  
  // Llenar los campos del formulario con los datos del alumno
  useEffect(() => {
    if (alumno) {
      setForm({
        nombre: alumno.nombre || "",
        id_carrera: alumno.id_carrera || "",
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
        const response = await apiClient.get(`${API_URL}/api/cordgen/tutores`);
        
        // Asegurar que la respuesta tenga la propiedad tutors y sea un array antes de actualizar el estado
        if (Array.isArray(response.data.tutors)) {
          setTutores(response.data.tutors); // Acceder a la propiedad tutors
        } else {
          console.error("La respuesta no contiene un array en la propiedad 'tutors':", response.data);
          setTutores([]); // Evita que sea undefined
        }
      } catch (error) {
        console.error("Error al obtener tutores:", error);
        setTutores([]); // Evita que sea undefined en caso de error
      }
    };
  
    fetchTutores();
  }, []);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  };

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
          `${API_URL}/api/alumnos/subir-csv`,
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
        `${API_URL}/api/cordgen/alumnos/${alumno._id}`,
        {
          nombre: form.nombre,
          id_carrera: form.id_carrera,
          matricula: form.matricula,
          correo: form.correo,
          telefono: form.telefono,
          tutor: form.tutor // Enviar el tutor seleccionado
        }
      );
      setTimeout(() => {
        navigate("/coord-gen/alumnos", { state: { reload: true } });
      }, 200);  // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      console.error("Error al actualizar el alumno:", error);
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar el alumno";
      toast.error(errorMessage);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/alumnos/exportar-csv`,
        {
          responseType: "blob", // Asegúrate de recibir el archivo como blob
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "alumnos.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo CSV:", error);
      alert("No se pudo descargar el archivo");
    }
  };

  const handleSubmitDB = async (e) => {
    setMostrarModal(true);
    return;
  }

  return (
    <div className="alumno-layout">
      <ToastContainer />
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
              <div className="input-wrapper short-field2">
                            <label htmlFor="id_carrera">Carrera</label>
                            <select
                                id="id_carrera"
                                value={form.id_carrera}
                                onChange={(e) => setForm({ ...form, id_carrera: e.target.value })}
                            >
                                <option value="" disabled hidden>Seleccione una carrera</option>
                                {Object.entries(carrerasPermitidas).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                        </div>
            </div>
            <div className="alumno-buttons">
              <button type="submit" className="button">Actualizar</button>
            </div>
          </form>
          <div className="alumno-buttons">
              <button className="button" onClick={handleSubmitDB}>Subir base de datos de alumnos</button>
            </div>
        </div>
      </div>
      {mostrarModal && (
            <div className="modal">
                <div className="modal-content">
                    <h3>Subir base de datos</h3>
                    <p>Seleccione el archivo a subir:</p>
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

export default ModificarAlumnoCG;