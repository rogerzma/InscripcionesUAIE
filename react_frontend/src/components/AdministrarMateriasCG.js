
import React, { useEffect, useState, useCallback } from "react";
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

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset página cuando cambia el tipo de carrera
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoCarrera]);

  // Función para obtener materias paginadas
  const fetchMateriasPaginadas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_URL}/api/materias/paginadas`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          tipoCarrera: tipoCarrera
        }
      });

      const { materias: materiasData, pagination: paginationData } = response.data;
      setMaterias(materiasData);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error al obtener datos de materias:", error);
      toast.error("Error al cargar las materias");
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentPage, itemsPerPage, debouncedSearch, tipoCarrera]);

  useEffect(() => {
    fetchMateriasPaginadas();
    fetchDocentes();
  }, [fetchMateriasPaginadas]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
      fetchMateriasPaginadas();
    }
  }, [location.state, fetchMateriasPaginadas]);

  // Restaurar estado al volver
  useEffect(() => {
    const estadoGuardado = sessionStorage.getItem("vistaMateriasCoordGen");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, tipoCarrera: savedTipo, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTipoCarrera(savedTipo || "todas");
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaMateriasCoordGen");
    }
  }, []);

  // Guardar el estado de la vista en sessionStorage
  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaMateriasCoordGen", JSON.stringify({
      searchTerm,
      currentPage,
      itemsPerPage,
      tipoCarrera,
      scrollY: window.scrollY
    }));
  };

  // Funciones de paginación
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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
      fetchMateriasPaginadas(); // Recargar la lista de materias
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
          <button
            onClick={() => setTipoCarrera("escolarizada")}
            style={{ backgroundColor: tipoCarrera === 'escolarizada' ? '#1976d2' : undefined, color: tipoCarrera === 'escolarizada' ? 'white' : undefined }}
          >
            Escolarizadas
          </button>
          <button
            onClick={() => setTipoCarrera("semiescolarizada")}
            style={{ backgroundColor: tipoCarrera === 'semiescolarizada' ? '#1976d2' : undefined, color: tipoCarrera === 'semiescolarizada' ? 'white' : undefined }}
          >
            Semiescolarizadas
          </button>
          <button
            onClick={() => setTipoCarrera("todas")}
            style={{ backgroundColor: tipoCarrera === 'todas' ? '#1976d2' : undefined, color: tipoCarrera === 'todas' ? 'white' : undefined }}
          >
            Todas
          </button>
        </div>

        {/* Controles de paginación superiores */}
        <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="itemsPerPage">Mostrar:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span>por página</span>
          </div>
          <div style={{ color: '#666' }}>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} materias
          </div>
        </div>

        {materias.length > 0 ? (
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
                  {((tipoCarrera === "todas" && materias.some(m => carrerasSemiescolarizadas.includes(m.id_carrera))) || tipoCarrera === "semiescolarizada") && <th>Sábado</th>}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
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
                    {((tipoCarrera === "todas" && materias.some(m => carrerasSemiescolarizadas.includes(m.id_carrera))) || tipoCarrera === "semiescolarizada") && (
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

        {/* Controles de paginación inferiores */}
        {pagination.totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginTop: '20px', flexWrap: 'wrap' }}>
            <button onClick={() => handlePageChange(1)} disabled={!pagination.hasPrevPage} style={{ padding: '8px 12px', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevPage ? 1 : 0.5 }}>
              {'<<'}
            </button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={!pagination.hasPrevPage} style={{ padding: '8px 12px', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevPage ? 1 : 0.5 }}>
              {'<'}
            </button>
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: pageNum === currentPage ? '#1976d2' : '#fff',
                  color: pageNum === currentPage ? '#fff' : '#333',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {pageNum}
              </button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={!pagination.hasNextPage} style={{ padding: '8px 12px', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', opacity: pagination.hasNextPage ? 1 : 0.5 }}>
              {'>'}
            </button>
            <button onClick={() => handlePageChange(pagination.totalPages)} disabled={!pagination.hasNextPage} style={{ padding: '8px 12px', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', opacity: pagination.hasNextPage ? 1 : 0.5 }}>
              {'>>'}
            </button>
          </div>
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
