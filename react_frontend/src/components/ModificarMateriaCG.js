import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CrearMateria.css";

function ModificarMateriaCG() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const materiaSeleccionada = location.state?.materia || {}; // Recibir los datos de la materia seleccionada

  const [mostrarModal, setMostrarModal] = useState(false);
  const [file, setFile] = useState(null); // Almacenar el archivo CSV
  const [docentes, setDocentes] = useState([]);
  const docenteNombre = localStorage.getItem("docenteNombre");
  const [formData, setFormData] = useState({
    id_materia: materiaSeleccionada.id_materia || "",
    id_carrera: materiaSeleccionada.id_carrera || "",
    nombre: materiaSeleccionada.nombre || "",
    horarios: {
      lunes: materiaSeleccionada.horarios?.lunes || "",
      martes: materiaSeleccionada.horarios?.martes || "",
      miercoles: materiaSeleccionada.horarios?.miercoles || "",
      jueves: materiaSeleccionada.horarios?.jueves || "",
      viernes: materiaSeleccionada.horarios?.viernes || "",
      sabado: materiaSeleccionada.horarios?.sabado || "",
    },
    salon: materiaSeleccionada.salon || "",
    grupo: materiaSeleccionada.grupo || "",
    cupo: materiaSeleccionada.cupo || "",
    laboratorio: materiaSeleccionada.laboratorio || false,
    docente: materiaSeleccionada.docente || "",
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

  const carrerasPermitidasSemiescolarizadas = [
    "ISftwS",
    "IDsrS",
    "IEIndS",
    "ICmpS",
    "IRMcaS",
    "IElecS",
  ];

  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

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
      alert("Por favor selecciona un archivo CSV");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    try {
      await apiClient.post(
        `${API_URL}/api/materias/subir-csv`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Base de datos de materias actualizada con éxito desde el archivo CSV");
      setMostrarModal(false);
    } catch (error) {
      console.error("Error al subir el archivo CSV:", error);
      alert("Hubo un error al actualizar la base de datos");
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
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "laboratorio") {
      setFormData((prevState) => ({
        ...prevState,
        laboratorio: value === "true" ? true : false, // Manejo robusto del booleano
      }));
    } else if (["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"].includes(id)) {
      // Si el cambio es en los horarios, actualiza solo esa clave dentro de horarios
      setFormData((prevState) => ({
        ...prevState,
        horarios: {
          ...prevState.horarios,
          [id]: value, // Actualiza el día correspondiente
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

  const handleBack = () => {
    navigate(-1); // Navegar a la página anterior
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalData = {
        ...formData,
        horarios: Object.fromEntries(
          Object.entries(formData.horarios).map(([key, value]) => [key, value === "" ? null : value])
        ),
        docente: formData.docente || null,
      };

      const response = await apiClient.put(
        `${API_URL}/api/materias/${materiaSeleccionada._id}`,
        finalData
      );
      toast.success("Materia actualizada con éxito");
      setTimeout(() => {
        navigate("/coord-gen/materias", { state: { reload: true } });
      }, 200);  // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      // Mostrar mensaje específico del backend si existe
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar la materia";
      toast.error(errorMessage);
      console.error("Error al actualizar la materia:", error);
    }
  };

  const isSemiescolarizada = carrerasPermitidasSemiescolarizadas.includes(formData.id_carrera);

  return (
    <div className="materia-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="materia-container">
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
        <h1>Modificar materia</h1>
        <div className="materia-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper">
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
              <div className="input-wrapper">
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
              <div className="input-wrapper">
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
              <div className="input-wrapper">
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
              <div className="input-wrapper">
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
              <div className="input-wrapper">
                <label htmlFor="docente">Docente</label>
                <select id="docente" value={formData.docente} onChange={handleChange}>
                  <option value="">Sin docente</option>
                  {docentes.map((docente) => (
                    <option key={docente._id} value={docente._id}>
                      {docente.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              {!isSemiescolarizada && (
                <>
                  {["lunes", "martes", "miercoles", "jueves", "viernes"].map((dia) => (
                    <div className="input-wrapper" key={dia}>
                      <label htmlFor={dia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</label>
                      <select id={dia} value={formData.horarios[dia] || ""} onChange={handleChange}>
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
                  ))}
                </>
              )}
              {isSemiescolarizada && (
                <>
                  <div className="input-wrapper">
                    <label htmlFor="viernes">Viernes</label>
                    <select id="viernes" value={formData.horarios.viernes || ""} onChange={handleChange}>
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
                  <div className="input-wrapper">
                    <label htmlFor="sabado">Sábado</label>
                    <select id="sabado" value={formData.horarios.sabado || ""} onChange={handleChange}>
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
                </>
              )}
              <div className="input-wrapper">
                <label htmlFor="id_carrera">Carrera</label>
                <select id="id_carrera" value={formData.id_carrera} onChange={handleChange} required>
                  <option value="" disabled hidden>Seleccione una carrera</option>
                  {Object.entries(carrerasPermitidas).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
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
            <div className="materia-buttons">
              <button type="submit" className="button">Guardar cambios</button>
              <button className="button" onClick={() => setMostrarModal(true)}>Subir base de datos de materias</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModificarMateriaCG;