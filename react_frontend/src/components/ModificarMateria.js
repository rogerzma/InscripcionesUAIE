import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CrearMateria.css";

function ModificarMateria() {
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [file, setFile] = useState(null); // Almacenar el archivo CSV
  const docenteNombre = localStorage.getItem("docenteNombre");
  const id_carrera = localStorage.getItem("id_carrera");
  const [formData, setFormData] = useState({
    id_materia: '',
    id_carrera:  "",
    nombre: '',
    horarios: {
      lunes: '',
      martes: '',
      miercoles: '',
      jueves: '',
      viernes: '',
      sabado: ''
    },
    semi: '',
    salon: '',
    grupo: '',
    cupo: '',
    laboratorio: false, // Asignar valor por defecto
    docente: '' // Aquí puedes colocar el ObjectId del docente si es necesario
  });
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

  

  const carrerasPermitidasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];
  const location = useLocation();
  const materia = location.state?.materia || {};

  // Llenar los campos del formulario con los datos del alumno
  useEffect(() => {
    if (materia) {
      setFormData({
        id_materia: materia.id_materia || "",
        id_carrera: materia.id_carrera || "",
        nombre: materia.nombre || "",
        salon: materia.salon || "",
        grupo: materia.grupo || "",
        cupo: materia.cupo || "",
        docente: materia.docente || "",
        laboratorio: materia.laboratorio || false, // Asignar valor por defecto
        semi: materia.semi || "",
        horarios: {
          lunes: materia.horarios?.lunes || "-",
          martes: materia.horarios?.martes || "-",
          miercoles: materia.horarios?.miercoles || "-",
          jueves: materia.horarios?.jueves || "-",
          viernes: materia.horarios?.viernes || "-",
          sabado: materia.horarios?.sabado || "-",
        },
      });
    }
  }, [materia]);

  // Dentro del componente CrearMateria
  const [docentes, setDocentes] = useState([]);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/docentes`);
        setDocentes(response.data); // Guardamos la lista de docentes con el nombre incluido
      } catch (error) {
        console.error("Error al obtener los docentes:", error);
      }
    };

    fetchDocentes();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guarda el archivo CSV seleccionado
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
        `${API_URL}/api/materias/subir-csv-por-carrera?id_carrera=${id_carrera}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(response.data.message || "Base de datos actualizada con éxito desde el archivo CSV");
      setMostrarModal(false);
    } catch (error) {
      console.error("❌ Error al subir el archivo CSV:", error);

      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Ocurrió un error al subir el archivo CSV";

      toast.error(`❌ ${mensaje}`);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await apiClient.get(
        `${API_URL}/api/materias/exportar-csv`, 
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "materias.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo CSV:", error);
      alert("No se pudo descargar el archivo");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  }

  const getDocenteNombre = (materia) => {
    return materia && materia.docenteNombre ? materia.docenteNombre : "Sin asignar";
  };

  const handleBack = () => {
    navigate(-1); // Navegar a la página anterior
  }

  const handleChange = (e) => {
    const { id, value } = e.target;

  
    if (id.startsWith("horarios-")) {
      const dia = id.split("-")[1]; // Extrae el día del ID (ejemplo: horarios-lunes → lunes)
      setFormData((prevFormData) => ({
        ...prevFormData,
        horarios: {
          ...prevFormData.horarios,
          [dia]: value === "" ? "-" : value, // Si el valor es vacío, asigna "-"
        },
      }));
    } else {
      // Si es otro campo, actualiza normalmente
      setFormData((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const materiaActualizada = {
        id_materia: formData.id_materia,
        id_carrera: formData.id_carrera,
        nombre: formData.nombre,
        horarios: formData.horarios,
        salon: formData.salon,
        semi: formData.semi,
        grupo: formData.grupo,
        cupo: formData.cupo,
        laboratorio: formData.laboratorio,
        docente: formData.docente || null
      };

      await apiClient.put(`${API_URL}/api/materias/${materia._id}`, materiaActualizada);
      toast.success("Materia actualizada con éxito");
      setTimeout(() => {
        navigate("/coordinador/materias", { state: { reload: true } });
      }, 200);  // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      // Mostrar mensaje específico si viene del backend
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar la materia";
      toast.error(errorMessage);
    }
  };

  
    
  const isSemiescolarizada = carrerasPermitidasSemiescolarizadas.includes(formData.id_carrera);

  return (
    <div className="materia-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="materia-container">
        <div className="top-left">
          <button className="back-button" onClick={handleBack}>Regresar</button>
        </div>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
        <h1>Modificar materia</h1>
        <div className="materia-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="id_materia">ID de materia</label>
                <input
                  type="text"
                  id="id_materia"
                  placeholder="ID de la materia"
                  value={formData.id_materia}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre de la materia"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="salon">Salón</label>
                <input
                  type="text"
                  id="salon"
                  placeholder="Ingresar el salón"
                  value={formData.salon}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="cupo">Cupo</label>
                <input
                  type="text"
                  id="cupo"
                  placeholder="Cupo de materia"
                  value={formData.cupo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper">
                <label htmlFor="laboratorio">Laboratorio</label>
                <select id="laboratorio" value={formData.laboratorio.toString()} onChange={handleChange} required>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
              <div className="input-wrapper short-field">
                <label htmlFor="grupo">Grupo</label>
                <input
                  type="text"
                  id="grupo"
                  placeholder="Grupo"
                  value={formData.grupo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="docente">Docente</label>
                <select id="docente" value={formData.docente} onChange={handleChange}>
                  <option value="">Sin docente</option>
                  {docentes.map((docente) => (
                    <option key={docente._id} value={docente._id}>
                      {docente.nombre}  {/* Muestra el nombre del docente */}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
               {!isSemiescolarizada && (
            <>
                <div className="input-wrapper short-field">
                    <label htmlFor="lunes">Lunes</label>
                    <select id="horarios-lunes" value={formData.horarios.lunes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="martes">Martes</label>
                    <select id="horarios-martes" value={formData.horarios.martes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="miercoles">Miércoles</label>
                    <select id="horarios-miercoles" value={formData.horarios.miercoles} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="horarios-jueves">Jueves</label>
                    <select id="horarios-jueves" value={formData.horarios.jueves} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="viernes">Viernes</label>
                    <select id="horarios-viernes" value={formData.horarios.viernes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                        <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
                    </select>
                </div>
            </>
        )}

        {isSemiescolarizada && (
          <>
          <div className="input-wrapper short-field">
              <label htmlFor="viernes">Viernes</label>
              <select id="horarios-viernes" value={formData.horarios.viernes} onChange={handleChange}required>
                  <option value="" disabled hidden>Seleccione...</option>
                  <option value="">-</option>
                       <option value="7:00-14:00">7:00-14:00</option>
                       <option value="7:00-15:00">7:00-15:00</option>
                       <option value="14:00-20:00">14:00-20:00</option>
                       <option value="14:00-21:00">14:00-21:00</option>
                       <option value="15:00-20:00">15:00-20:00</option>
                       <option value="15:00-21:00">15:00-21:00</option>
              </select>
          </div>
            <div className="input-wrapper short-field">
                <label htmlFor="sabado">Sábado</label>
                <select id="horarios-sabado" value={formData.horarios.sabado} onChange={handleChange}required>
                    <option value="" disabled hidden>Seleccione...</option>
                    <option value="">-</option>
                       <option value="7:00-14:00">7:00-14:00</option>
                       <option value="7:00-15:00">7:00-15:00</option>
                       <option value="14:00-20:00">14:00-20:00</option>
                       <option value="14:00-21:00">14:00-21:00</option>
                       <option value="15:00-20:00">15:00-20:00</option>
                       <option value="15:00-21:00">15:00-21:00</option>
                </select>
            </div>

            <div className="input-wrapper short-field">
              <label htmlFor="semi">Par-Impar</label>
                <select id="semi" value={formData.semi} onChange={handleChange} required>
                  <option value="" disabled hidden>Seleccione paridad</option>
                  <option value="par">Par</option>
                  <option value="impar">Impar</option>
              </select>
            </div>
            </>
        )}

            </div>
            {mostrarModal && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Subir base de datos</h3>
                  <p>Seleccione el archivo a subir:</p>
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <button onClick={() => handleSubmitCSV}>Subir CSV</button>
                  <button onClick={() => handleDownloadCSV}>Descargar CSV</button>
                  <button onClick={() => setMostrarModal(false)}>Cerrar</button>
                </div>
              </div>
            )}
            <div className="materia-buttons">
              <button type="submit" className="button">Actualizar</button>
              <button
                type="button"  // Se agrega este atributo para evitar que dispare el submit
                className="button"
                onClick={() => setMostrarModal(true)}
              >
                Subir base de datos de materias
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModificarMateria;