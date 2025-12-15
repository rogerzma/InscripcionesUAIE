import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "./AdministrarMaterias.css";

const AdministrarMateriasCoordinador = () => {
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Filtro de búsqueda
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalMaterias, setMostrarModalMaterias] = useState(false);
  const [materiaAEliminar, setMateriaAEliminar] = useState(null);
  const [horasMaximas, setHorasMaximas] = useState("");
  const token = localStorage.getItem("token");
  const [editMode, setEditMode] = useState(false); // Estado para controlar el modo de edición
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();

  const id_carrera = localStorage.getItem("id_carrera");
  const navigate = useNavigate();

  // Lista de carreras semiescolarizadas
  const carrerasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];

  const esSemiescolarizada = carrerasSemiescolarizadas.includes(id_carrera);

  // Cargar materias desde el backend
  const fetchMaterias = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${API_URL}/api/materias/carrera/${id_carrera}`
      );
      setMaterias(response.data);
    } catch (error) {
      console.error("Error al obtener datos de materias:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar docentes desde el backend
  const fetchDocentes = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/api/docentes`);
      setDocentes(response.data);
    } catch (error) {
      console.error("Error al obtener datos de docentes:", error);
    }
  };

  // Obtener nombre del docente asignado
  const getDocenteNombre = (materia) => {
    return materia && materia.docenteNombre ? materia.docenteNombre : "Sin asignar";
  };

  // Confirmar y eliminar materia
  const handleDelete = async () => {
    if (!materiaAEliminar) return;
    try {
      await apiClient.delete(`${API_URL}/api/materias/${materiaAEliminar}`);
      toast.success("Materia eliminada con éxito");
      fetchMaterias(); // Recargar la lista de materias
    } catch (error) {
      console.error("Error al eliminar la materia:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error al eliminar la materia";
      toast.error(errorMessage);
    } finally {
      setMostrarModal(false);
    }
  };

  // Función para formatear el nombre de la materia
  const formatUrl = (nombre) => {
    return nombre
      .normalize("NFD") // Normaliza el texto para separar los acentos
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .toLowerCase() // Convierte a minúsculas
      .replace(/[^a-z0-9\s]/g, "") // Elimina caracteres especiales
      .trim() // Elimina espacios al inicio y al final
      .replace(/\s+/g, "-"); // Reemplaza espacios por guiones
  };

  const enlacesPlanCarrera = {
    ISftw: "https://www.uaz.edu.mx/oferta-educativa/educacion-superior/ingenieria-de-software/",
    ICmp: "https://computacion.uaz.edu.mx/",
    IEInd: "https://electronica.uaz.edu.mx/",
    IDsr: "https://tucampus.edu.mx/planes-academicos/desarrollo-sistemas",
    IRMca: "https://robmec.uaz.edu.mx/",
    IElec: "https://tucampus.edu.mx/planes-academicos/electrica",
    // Agrega los semiescolarizados si es necesario:
    ISftwS: "https://tucampus.edu.mx/planes-academicos/ingenieria-software-semiescolarizado"
  };
  const handleListaAlumnos = (materia) => {
    const materiaUrl = formatUrl(materia.nombre); // Formatea el nombre de la materia
    guardarEstadoVista(); // Guardar el estado actual antes de navegar
    navigate(`/coordinador/materias/${materiaUrl}/lista-alumnos`, {
      state: {
        nombre: getDocenteNombre(materia),
        matricula: docentes.matricula,
        materiaId: materia._id,
        materiaNombre: materia.nombre,
      },
    });
  };

  const handleDownloadCSV = async () => {
    const id_carrera = localStorage.getItem("id_carrera");
    const ids = materiasFiltradas.map((m) => m._id);

    if (!id_carrera || ids.length === 0) {
      toast.error("No hay materias filtradas o falta el id_carrera.");
      return;
    }

    try {
      const response = await apiClient.post(
        `${API_URL}/api/materias/exportar-csv/carrera-filtrados/${id_carrera}`,
        { ids },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `materias_filtradas_${id_carrera}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar CSV de materias filtradas:", error);
      toast.error("No se pudo descargar el archivo.");
    }
  };

  const handleDownloadDB = () => {
    setMostrarModalMaterias(true);
  };


  const fetchHorasCoordinador = async () => {
    try {
      const id_carrera = localStorage.getItem("id_carrera");
      const response = await apiClient.get(`${API_URL}/api/coordinadores/horas/${id_carrera}`);
      setHorasMaximas(response.data.horas); // Suponiendo que el backend regresa { horas: 40 }
    } catch (error) {
      console.error("Error al obtener las horas del coordinador:", error);
    }
  };
  
  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const actualizarHorasCoordinador = async () => {
    try {
      const matricula = localStorage.getItem("matricula");
      if (!matricula) {
        console.error("Error: Matricula no encontrada en localStorage.");
        toast.error("Error: Matricula no encontrada.");
        return;
      }
      
      await apiClient.put(`${API_URL}/api/coordinadores/horas/${matricula}`, {
        horas: horasMaximas,
      });
      toast.success(`Horas actualizadas a: ${horasMaximas}`);
      setEditMode(false); // Volver al modo estático
    } catch (error) {
      console.error("Error al actualizar las horas:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error al actualizar las horas";
      toast.error(errorMessage);
    }
  };
  
  // Filtrar materias por búsqueda
  const materiasFiltradas = materias.filter((materia) =>
    [
      materia.salon,
      materia.nombre,
      materia.grupo,
      getDocenteNombre(materia),
    ].some((campo) => campo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Guardar el estado de la vista en sessionStorage
  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaMateriasCoord", JSON.stringify({
      searchTerm,
      scrollY: window.scrollY,
      materias
    }));
  };

  useEffect(() => {

    // Cargar el estado guardado desde sessionStorage
    const estadoGuardado = sessionStorage.getItem("vistaMateriasCoord");
    // Verificar si se viene de la validación de materias
    const cameFromValidation = location.state?.reload === true;

    // Si hay un estado guardado y no se viene de la validación, usarlo
    if (estadoGuardado && !cameFromValidation) {
      const { searchTerm: savedSearchTerm, scrollY, materias: savedMaterias } = JSON.parse(estadoGuardado);

      setSearchTerm(savedSearchTerm || "");
      setMaterias(savedMaterias || []);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 0);

      sessionStorage.removeItem("vistaMateriasCoord");
      setLoading(false);
      return;
    }

    // Guardar el estado actual en sessionStorage al salir de la página
    fetchMaterias();
    fetchDocentes();
    fetchHorasCoordinador();
    
  }, []);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  if (loading) {
    return <div className="loading">Cargando información de materias...</div>;
  }

  

  return (
    <div className="admin-materias">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="materia-container">
        <h3>Administrar materias</h3>
        <h4>A continuación, se muestran las siguientes opciones:</h4>
        <p className="info">Lista de materias activas:</p>

        {/* Contenedor para el filtro y las horas */}
        <div className="filter-hours-container">
          {/* Input de búsqueda */}
          <input
            type="text"
            placeholder="Buscar por nombre, grupo, salón o docente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          {/* Input para el número máximo de horas permitidas */}
          <div className="max-hours-container">
            <label htmlFor="max-hours">Máx. horas permitidas:</label>
            {editMode ? (
              <>
                <input
                  type="number"
                  id="max-hours"
                  value={horasMaximas}
                  onChange={(e) => setHorasMaximas(e.target.value)}
                  className="max-hours-input"
                />
                <button
                  className="confirm-button"
                  onClick={actualizarHorasCoordinador}
                >
                  Confirmar
                </button>
              </>
            ) : (
              <>
                <span>{horasMaximas}</span>
                <button
                  className="edit-button"
                  onClick={toggleEditMode}
                >
                  Editar
                </button>
              </>
            )}
          </div>
        </div>

        {materiasFiltradas.length > 0 ? (
          <div className="scrollable-table">
            <table className="materia-table">
              <thead>
                <tr>
                  <th>Grupo</th>
                  <th>Salón</th>
                  <th>Cupo</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Lab</th>
                  {esSemiescolarizada ? (
                    <>
                      <th>Paridad</th>
                      <th>Viernes</th>
                      <th>Sábado</th>
                    </>
                  ) : (
                    <>
                  <th>Lunes</th>
                  <th>Martes</th>
                  <th>Miércoles</th>
                  <th>Jueves</th>
                  <th>Viernes</th>
                  </>
                  )}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiasFiltradas.map((materia) => (
                  <tr key={materia._id}>
                    <td>{materia.grupo}</td>
                    <td>{materia.salon}</td>
                    <td>{materia.cupo}</td>
                    <td>
                      <a
                        href={enlacesPlanCarrera[materia.id_carrera]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                      >
                        {materia.nombre}
                      </a>
                    </td>
                    <td>{getDocenteNombre(materia)}</td>
                    <td>{materia.laboratorio ? "Sí" : "No"}</td>
                    {esSemiescolarizada ? (
                      <>
                      <td>{materia.semi || "-"}</td>
                      <td>{materia.horarios.viernes || "-"}</td>
                      <td>{materia.horarios.sabado || "-"}</td>
                      </>
                    ) : (
                      <>
                        <td>{materia.horarios.lunes || "-"}</td>
                        <td>{materia.horarios.martes || "-"}</td>
                        <td>{materia.horarios.miercoles || "-"}</td>
                        <td>{materia.horarios.jueves || "-"}</td>
                        <td>{materia.horarios.viernes || "-"}</td>
                      </>
                    )}
                    <td>
                    <button className="icon-button" onClick={() => handleListaAlumnos(materia)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                      <button
                        className="icon-button" onClick={() => {
                          guardarEstadoVista();
                          navigate("/coordinador/modificar-materia", { state: { materia } })}
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => {
                          setMateriaAEliminar(materia._id);
                          setMostrarModal(true);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                          <path d="M10 11v6"></path>
                          <path d="M14 11v6"></path>
                          <path d="M15 6V4a1 1 0 0 0-1-1H10a1 1 0 0 0-1 1v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-alumnos-message">No se encontraron resultados.</p>
        )}

        {mostrarModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>AVISO</h3>
              <p>¿Está seguro que desea eliminar esta materia?</p>
              <p>Esta acción no se puede revertir.</p>
              <button onClick={handleDelete}>Eliminar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {mostrarModalMaterias && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Descargar base de datos</h3>
                  <p>Haga clic para descargar la base de datos:</p>
                  <ul>
                  </ul>
                  <p>
                  </p>
                  <button onClick={handleDownloadCSV}>Descargar CSV</button>
                  <button onClick={() => setMostrarModalMaterias(false)}>Cerrar</button>
                </div>
              </div>
            )}

        <div className="add-delete-buttons">
          <button onClick={() => {
            guardarEstadoVista();
            navigate("/coordinador/crear-materia")}
          }>Agregar nueva materia</button>
          <button onClick={handleDownloadDB}>Descargar CSV de materias</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarMateriasCoordinador;
