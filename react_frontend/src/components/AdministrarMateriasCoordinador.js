import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from '../utils/axiosConfig';
import "./AdministrarMaterias.css";

const AdministrarMateriasCoordinador = () => {
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalMaterias, setMostrarModalMaterias] = useState(false);
  const [materiaAEliminar, setMateriaAEliminar] = useState(null);
  const [horasMaximas, setHorasMaximas] = useState("");
  const token = localStorage.getItem("token");
  const [editMode, setEditMode] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL;
  const location = useLocation();

  const id_carrera = localStorage.getItem("id_carrera");
  const navigate = useNavigate();

  // Lista de carreras semiescolarizadas
  const carrerasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];
  const esSemiescolarizada = carrerasSemiescolarizadas.includes(id_carrera);

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

  // Función para obtener materias paginadas
  const fetchMateriasPaginadas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_URL}/api/materias/carrera-paginadas/${id_carrera}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch
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
  }, [API_URL, id_carrera, currentPage, itemsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchMateriasPaginadas();
    fetchDocentes();
    fetchHorasCoordinador();
  }, [fetchMateriasPaginadas]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
      fetchMateriasPaginadas();
    }
  }, [location.state, fetchMateriasPaginadas]);

  // Restaurar estado al volver
  useEffect(() => {
    const estadoGuardado = sessionStorage.getItem("vistaMateriasCoord");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaMateriasCoord");
    }
  }, []);

  // Guardar el estado de la vista en sessionStorage
  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaMateriasCoord", JSON.stringify({
      searchTerm,
      currentPage,
      itemsPerPage,
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
      fetchMateriasPaginadas();
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
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const enlacesPlanCarrera = {
    ISftw: "https://www.uaz.edu.mx/oferta-educativa/educacion-superior/ingenieria-de-software/",
    ICmp: "https://computacion.uaz.edu.mx/",
    IEInd: "https://electronica.uaz.edu.mx/",
    IDsr: "https://tucampus.edu.mx/planes-academicos/desarrollo-sistemas",
    IRMca: "https://robmec.uaz.edu.mx/",
    IElec: "https://tucampus.edu.mx/planes-academicos/electrica",
    ISftwS: "https://tucampus.edu.mx/planes-academicos/ingenieria-software-semiescolarizado"
  };

  const handleListaAlumnos = (materia) => {
    const materiaUrl = formatUrl(materia.nombre);
    guardarEstadoVista();
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
    const ids = materias.map((m) => m._id);

    if (!id_carrera || ids.length === 0) {
      toast.error("No hay materias o falta el id_carrera.");
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
      link.setAttribute("download", `materias_${id_carrera}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar CSV de materias:", error);
      toast.error("No se pudo descargar el archivo.");
    }
  };

  const handleDownloadDB = () => {
    setMostrarModalMaterias(true);
  };

  const fetchHorasCoordinador = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/api/coordinadores/horas/${id_carrera}`);
      setHorasMaximas(response.data.horas);
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
      setEditMode(false);
    } catch (error) {
      console.error("Error al actualizar las horas:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error al actualizar las horas";
      toast.error(errorMessage);
    }
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
                {materias.map((materia) => (
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
                          navigate("/coordinador/modificar-materia", { state: { materia } })
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

        {mostrarModalMaterias && (
          <div className="modal">
            <div className="modal-content">
              <h3>Descargar base de datos</h3>
              <p>Haga clic para descargar la base de datos:</p>
              <button onClick={handleDownloadCSV}>Descargar CSV</button>
              <button onClick={() => setMostrarModalMaterias(false)}>Cerrar</button>
            </div>
          </div>
        )}

        <div className="add-delete-buttons">
          <button onClick={() => {
            guardarEstadoVista();
            navigate("/coordinador/crear-materia")
          }}>Agregar nueva materia</button>
          <button onClick={handleDownloadDB}>Descargar CSV de materias</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarMateriasCoordinador;
