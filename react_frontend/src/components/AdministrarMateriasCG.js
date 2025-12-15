
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "./AdministrarMaterias.css";

const AdministrarMateriasCG = () => {
  // Estado para el filtro de tipo de materia
  const [tipoCarrera, setTipoCarrera] = useState("todas"); // "todas", "escolarizada", "semiescolarizada"

  // Carreras semiescolarizadas
  const carrerasSemiescolarizadas = [
    "ISftwS", "IDsrS", "IEIndS", "ICmpS", "IRMcaS", "IElecS"
  ];

  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Filtro de búsqueda
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materiaAEliminar, setMateriaAEliminar] = useState(null);
  const location = useLocation();

  // Asegúrate de tener configurada la URL base en tu .env
  const API_URL = process.env.REACT_APP_API_URL;

  const id_carrera = localStorage.getItem("id_carrera");
  const navigate = useNavigate();

  useEffect(() => {
      // Cargar el estado guardado desde sessionStorage
      const estadoGuardado = sessionStorage.getItem("vistaMateriasCoordGen");
      // Verificar si se viene de la validación de materias
      const cameFromValidation = location.state?.reload === true;
  
      // Si hay un estado guardado y no se viene de la validación, usarlo
      if (estadoGuardado && !cameFromValidation) {
        const { searchTerm: savedSearchTerm, scrollY, materias: savedMaterias } = JSON.parse(estadoGuardado);
  
        setSearchTerm(savedSearchTerm || "");
        setMaterias(savedMaterias || []);
        setTimeout(() => window.scrollTo(0, scrollY || 0), 0);
  
        sessionStorage.removeItem("vistaMateriasCoordGen");
        setLoading(false);
        return;
      }
  
      // Guardar el estado actual en sessionStorage al salir de la página
      fetchMaterias();
      fetchDocentes();
      
    }, []);

  useEffect(() => {
      if (location.state?.reload) {
        window.history.replaceState({}, document.title);
      }
    }, []);

  // Guardar el estado de la vista en sessionStorage
    const guardarEstadoVista = () => {
      sessionStorage.setItem("vistaMateriasCoordGen", JSON.stringify({
        searchTerm,
        scrollY: window.scrollY,
        materias
      }));
    };

  // Cargar materias desde el backend
  const fetchMaterias = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `${API_URL}/api/materias`
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
    ISftwS: "https://www.uaz.edu.mx/oferta-educativa/educacion-superior/ingenieria-de-software/"
  };
  

  const handleListaAlumnos = (materia) => {
    guardarEstadoVista();
    const materiaUrl = formatUrl(materia.nombre); // Formatea el nombre de la materia
    navigate(`/coord-gen/materias/${materiaUrl}/lista-alumnos`, {
      state: {
        nombre: getDocenteNombre(materia),
        matricula: docentes.matricula,
        materiaId: materia._id,
        materiaNombre: materia.nombre,
      },
    });
  };

  if (loading) {
    return <div className="loading">Cargando información de materias...</div>;
  }

  // Diccionario de carreras permitidas
  const carrerasPermitidas = {
    ISftw: "Ing. en Software",
    IDsr: "Ing. en Desarrollo",
    IEInd: "Ing. Electrónica Industrial",
    ICmp: "Ing. Computación",
    IRMca: "Ing. Robótica y Mecatrónica",
    IElec: "Ing. Electricista",
    ISftwS: "Ing. en SoftwareSemiescolarizado",
    IDsrS: "Ing. en DesarrolloSemiescolarizado",
    IEIndS: "Ing. Electrónica IndustrialSemiescolarizado",
    ICmpS: "Ing. ComputaciónSemiescolarizado",
    IRMcaS: "Ing. Robótica y MecatrónicaSemiescolarizado",
    IElecS: "Ing. ElectricistaSemiescolarizado",
  };

  // Palabras clave para carreras
  const carreraClaves = Object.values(carrerasPermitidas).map(nombre => {
    return nombre
      .replace(/^Ing\. en\s*/i, "")
      .replace(/^Ing\.\s*/i, "")
      .replace(/\s*\(Semiescolarizado\)/i, "")
      .trim()
      .toLowerCase();
  });

  // Filtrar materias por búsqueda, carrera y tipo
  const materiasFiltradas = materias.filter((materia) => {
    const search = searchTerm.toLowerCase();

    // Filtro por tipo de materia
    if (tipoCarrera === "escolarizada" && carrerasSemiescolarizadas.includes(materia.id_carrera)) {
      return false;
    }
    if (tipoCarrera === "semiescolarizada" && !carrerasSemiescolarizadas.includes(materia.id_carrera)) {
      return false;
    }

    // Obtener nombre de carrera sin "Ing. en" y sin " (Semiescolarizado)"
    let nombreCarreraCompleto = carrerasPermitidas[materia.id_carrera] || "";
    let nombreCarreraClave = nombreCarreraCompleto
      .replace(/^Ing\. en\s*/i, "")
      .replace(/^Ing\.\s*/i, "")
      .replace(/\s*\(Semiescolarizado\)/i, "")
      .trim()
      .toLowerCase();

    // Filtro por carrera clave
    if (carreraClaves.includes(search)) {
      return nombreCarreraClave === search;
    }

    // Filtros anteriores
    const salonCoincide = materia.salon?.toLowerCase().includes(search);
    const nombreCoincide = materia.nombre?.toLowerCase().includes(search);
    const grupoCoincide = materia.grupo?.toLowerCase().includes(search);
    const idCarreraCoincide = materia.id_carrera?.toLowerCase().includes(search);
    const carreraNombreCoincide = nombreCarreraClave.includes(search);
    const docenteCoincide = getDocenteNombre(materia).toLowerCase().includes(search);

    return (
      salonCoincide ||
      nombreCoincide ||
      grupoCoincide ||
      idCarreraCoincide ||
      carreraNombreCoincide ||
      docenteCoincide
    );
  });

  
  
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

        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por nombre, grupo, salón o docente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />


        {/* Botones de filtro por tipo de materia */}
        <div className="filtros-materias" style={{ marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={() => setTipoCarrera("escolarizada")}>Escolarizadas</button>
          <button onClick={() => setTipoCarrera("semiescolarizada")}>Semiescolarizadas</button>
          <button onClick={() => setTipoCarrera("todas")}>Todas</button>
        </div>


        {materiasFiltradas.length > 0 ? (
          <div className="scrollable-table">
            <table className="materia-table">
              <thead>
                <tr>
                  <th>Carrera</th>
                  <th>Grupo</th>
                  <th>Salón</th>
                  <th>Cupo</th>
                  <th>Materia</th>
                  <th>Docente</th>
                  <th>Lab</th>
                  {/* Mostrar días según el filtro */}
                  {tipoCarrera !== "semiescolarizada" && (
                    <>
                      <th>Lunes</th>
                      <th>Martes</th>
                      <th>Miércoles</th>
                      <th>Jueves</th>
                    </>
                  )}
                  <th>Viernes</th>
                  {/* Mostrar Sábado si hay alguna materia semiescolarizada en el filtro 'todas' o si el filtro es semiescolarizada */}
                  {((tipoCarrera === "todas" && materiasFiltradas.some(m => carrerasSemiescolarizadas.includes(m.id_carrera))) || tipoCarrera === "semiescolarizada") && <th>Sábado</th>}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiasFiltradas.map((materia) => (
                  <tr key={materia._id}>
                    <td>{materia.id_carrera}</td>
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
                    {/* Mostrar días según el filtro */}
                    {tipoCarrera !== "semiescolarizada" && (
                      <>
                        <td>{materia.horarios.lunes || "-"}</td>
                        <td>{materia.horarios.martes || "-"}</td>
                        <td>{materia.horarios.miercoles || "-"}</td>
                        <td>{materia.horarios.jueves || "-"}</td>
                      </>
                    )}
                    <td>{materia.horarios.viernes || "-"}</td>
                    {/* Mostrar Sábado si corresponde */}
                    {((tipoCarrera === "todas" && materiasFiltradas.some(m => carrerasSemiescolarizadas.includes(m.id_carrera))) || tipoCarrera === "semiescolarizada") && (
                      tipoCarrera === "semiescolarizada" || carrerasSemiescolarizadas.includes(materia.id_carrera)
                        ? <td>{materia.horarios.sabado || "-"}</td>
                        : <td></td>
                    )}
                    <td>
                      <div className="button-container">
                        <button className="icon-button" onClick={() => handleListaAlumnos(materia)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => {
                            guardarEstadoVista();
                            navigate("/coord-gen/materias/modificar-materia", { state: { materia } })
                          }}
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
                      </div>
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

        <div className="add-delete-buttons" style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button onClick={() => {
            guardarEstadoVista();
            navigate("/coord-gen/materias/crear-materia")
          }}>Agregar nueva materia</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarMateriasCG;
