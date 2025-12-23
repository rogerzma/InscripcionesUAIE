import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import apiClient from '../utils/axiosConfig';
import 'react-toastify/dist/ReactToastify.css';
import "./AlumnoList.css";


const AlumnoListCG = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [tutoresNombres, setTutoresNombres] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [comprobantes, setComprobantes] = useState([]);
  const [comprobantePorCarrera, setComprobantePorCarrera] = useState({});
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [AlumnoAEliminar, setAlumnoAEliminar] = useState(null);
  const matriculaCord = localStorage.getItem("matricula");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  // Filtro visual para tipo de alumno
  const [tipoAlumno, setTipoAlumno] = useState("todos"); // "todos", "escolarizado", "semiescolarizado"

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset a página 1 cuando cambia la búsqueda
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset página cuando cambia el tipo de alumno
  useEffect(() => {
    setCurrentPage(1);
  }, [tipoAlumno]);

  const fetchAlumnosPaginados = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_URL}/api/alumnos/paginados`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch,
          tipoAlumno: tipoAlumno
        }
      });

      const { alumnos: alumnosData, pagination: paginationData } = response.data;

      // Obtener los nombres de los tutores
      const tutoresNombresTemp = {};
      await Promise.all(alumnosData.map(async (alumno) => {
        if (alumno.tutor) {
          try {
            const tutorResponse = await apiClient.get(`${API_URL}/api/coordinadores/alumnos/${alumno.tutor}`);
            tutoresNombresTemp[alumno._id] = tutorResponse.data.nombre;
          } catch (error) {
            tutoresNombresTemp[alumno._id] = "Error al obtener tutor";
          }
        }
      }));

      // Obtener estatus para cada alumno
      const fetchEstatus = async (alumno) => {
        try {
          const estatusResponse = await fetch(`${API_URL}/api/tutores/estatus/${alumno.matricula}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          if (!estatusResponse.ok) throw new Error("Error al obtener el estatus del horario");
          const estatusData = await estatusResponse.json();
          return { ...alumno, estatus: estatusData.estatus };
        } catch (error) {
          return { ...alumno, estatus: "Desconocido" };
        }
      };

      const alumnosConEstatus = await Promise.all(alumnosData.map(fetchEstatus));
      setAlumnos(alumnosConEstatus);
      setTutoresNombres(tutoresNombresTemp);
      setPagination(paginationData);

      // Obtener carreras únicas
      const carrerasUnicas = [...new Set(alumnosData.map(a => a.id_carrera))];
      const comprobanteCarreraTemp = {};

      // Consultar el estado de comprobante por cada carrera
      await Promise.all(carrerasUnicas.map(async (carrera) => {
        try {
          const res = await apiClient.get(`${API_URL}/api/coordinadores/comprobante-habilitado/${carrera}`);
          comprobanteCarreraTemp[carrera] = res.data.comprobantePagoHabilitado;
        } catch (error) {
          comprobanteCarreraTemp[carrera] = true; // Por defecto true si falla
        }
      }));
      setComprobantePorCarrera(comprobanteCarreraTemp);

    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      toast.error("Error al cargar los alumnos");
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentPage, itemsPerPage, debouncedSearch, tipoAlumno, token]);

  const fetchComprobantes = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/api/alumnos/comprobantes/lista`);
      setComprobantes(response.data);
    } catch (error) {
      setComprobantes([]);
    }
  };

  useEffect(() => {
    fetchAlumnosPaginados();
    fetchComprobantes();
  }, [fetchAlumnosPaginados]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
      fetchAlumnosPaginados();
    }
  }, [location.state, fetchAlumnosPaginados]);

  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaAlumnoCoordGen", JSON.stringify({
      searchTerm,
      currentPage,
      itemsPerPage,
      tipoAlumno,
      scrollY: window.scrollY,
    }));
  };

  // Restaurar estado al volver
  useEffect(() => {
    const estadoGuardado = sessionStorage.getItem("vistaAlumnoCoordGen");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, tipoAlumno: savedTipo, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTipoAlumno(savedTipo || "todos");
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaAlumnoCoordGen");
    }
  }, []);

  const handleNavigate1 = () => {
    guardarEstadoVista();
    navigate("/coord-gen/alumnos/crear-alumno", { state: { matriculaCord: matriculaCord } });
  };

  const handleNavigate2 = () => {
    guardarEstadoVista();
    navigate("/coord-gen/alumnos/admin-tutor", { state: { matriculaCord: matriculaCord } });
  };

  const handleNavigate3 = (alumno) => {
    guardarEstadoVista();
    navigate(`/coord-gen/alumnos/revisar-horario/${alumno.matricula}`, { state: { nombre: alumno.nombre, matricula: alumno.matricula, matriculaTutor: matriculaCord} });
  };

  const handleModify = (alumno) => {
    guardarEstadoVista();
    navigate("/coord-gen/alumnos/modificar-alumno", { state: { alumno, matriculaCord: matriculaCord } });
  };

  // Función para validar el comprobante de pago
  const handleValidate = (alumno) => {
    guardarEstadoVista();
    navigate(`/coord-gen/alumnos/validar-pago/${alumno.matricula}`, {
      state: {
        nombre: alumno.nombre,
        matricula: alumno.matricula,
        id_carrera: alumno.id_carrera,
        matriculaTutor: matriculaCord
      }
    });
  };


  const setModal = (id) => {
    setAlumnoAEliminar(id);
    setMostrarModal(true);
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`${API_URL}/api/alumnos/${AlumnoAEliminar}`);
      toast.success("Alumno eliminado con éxito");
      setMostrarModal(false);
      // Recargar la página actual
      fetchAlumnosPaginados();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Hubo un error al eliminar el alumno";
      toast.error(errorMessage);
    }
  };

  const getEstatusIcon = (estatus) => {
    switch (estatus) {
      case "Falta de revisar":
        return <span className="status-icon yellow"></span>;
      case "En espera":
        return <span className="status-icon gray"></span>;
      case "Revisado":
        return <span className="status-icon green"></span>;
      default:
        return <span className="status-icon yellow"></span>;
    }
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
    setCurrentPage(1); // Reset a página 1
  };

  // Generar números de página para mostrar
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

  if (loading) {
    return <div className="loading">Cargando información de alumnos...</div>;
  }

  return (
    <div className="alumno-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="alumno-container">
        <h3>Administrar alumnos</h3>
        <p>Lista de alumnos asociados al programa académico</p>

        {/* Contenedor de la barra de búsqueda */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por matrícula, nombre, correo o carrera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
            style={{ width: "800px" }}
          />
        </div>

        {/* Botones de filtro por tipo de alumno */}
        <div className="filtros-alumnos" style={{ marginBottom: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => setTipoAlumno("escolarizado")}
            style={{ backgroundColor: tipoAlumno === 'escolarizado' ? '#1976d2' : undefined, color: tipoAlumno === 'escolarizado' ? 'white' : undefined }}
          >
            Escolarizados
          </button>
          <button
            onClick={() => setTipoAlumno("semiescolarizado")}
            style={{ backgroundColor: tipoAlumno === 'semiescolarizado' ? '#1976d2' : undefined, color: tipoAlumno === 'semiescolarizado' ? 'white' : undefined }}
          >
            Semiescolarizados
          </button>
          <button
            onClick={() => setTipoAlumno("todos")}
            style={{ backgroundColor: tipoAlumno === 'todos' ? '#1976d2' : undefined, color: tipoAlumno === 'todos' ? 'white' : undefined }}
          >
            Todos
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
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={40}>40</option>
              <option value={50}>50</option>
              <option value={60}>60</option>
              <option value={70}>70</option>
              <option value={80}>80</option>
              <option value={90}>90</option>
              <option value={100}>100</option>
            </select>
            <span>por página</span>
          </div>
          <div style={{ color: '#666' }}>
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} alumnos
          </div>
        </div>

        {alumnos.length > 0 ? (
          <div className="alumno-scrollable-table">
            <table className="alumnos-table">
              <thead>
                <tr>
                  <th>Programa</th>
                  <th>Matricula</th>
                  <th>Nombre alumno</th>
                  <th>Tutor</th>
                  <th>Correo</th>
                  <th>Telefono</th>
                  <th>Horario</th>
                  <th>Estatus</th>
                  <th>Pago</th>
                  <th>Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno._id}>
                    <td>{alumno.id_carrera}</td>
                    <td>{alumno.matricula}</td>
                    <td>{alumno.nombre}</td>
                    <td>{tutoresNombres[alumno._id] ? tutoresNombres[alumno._id] : "Sin asignar"}</td>
                    <td>{alumno.correo}</td>
                    <td>{alumno.telefono}</td>
                    <td className="actions">
                      <button
                        className="icon-button"
                        onClick={() => handleNavigate3(alumno)}
                        disabled={alumno.estatus === "En espera"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </td>
                  <td
                      className="estatus"
                      onClick={() => setSearchTerm(alumno.estatus)}
                      style={{ cursor: "pointer", color: getEstatusIcon(alumno.estatus) }}
                    >{getEstatusIcon(alumno.estatus)}</td>
                    <td>
                    {!comprobantePorCarrera[alumno.id_carrera] ? (
                      <span style={{ color: "#888" }}>Deshabilitado</span>
                    ) : (
                      comprobantes.includes(`Pago_${alumno.matricula}.pdf`) ? (
                        alumno.estatusComprobante === "Rechazado" ? (
                          <button
                            className="icon-button"
                            onClick={() => handleValidate(alumno)}
                            title="Comprobante rechazado"
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </button>
                        ) : alumno.estatusComprobante === "Pendiente" ? (
                          <button
                            className="icon-button"
                            onClick={() => handleValidate(alumno)}
                            title="Comprobante pendiente de revisión"
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFD600" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </button>
                        ) : alumno.estatusComprobante === "Revisado" || alumno.estatusComprobante === "Aceptado" ? (
                          <button
                            className="icon-button"
                            onClick={() => handleValidate(alumno)}
                            title="Comprobante aceptado"
                            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="green" viewBox="0 0 24 24">
                              <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                            </svg>
                          </button>
                        ) : (
                          <svg width="20" height="20" fill="#BDBDBD" viewBox="0 0 24 24" title="Sin estatus">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        )
                      ) : (
                        <span title="Sin comprobante">
                          <svg width="20" height="20" fill="#BDBDBD" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </span>
                      )
                    )}
                  </td>
                    <td>
                      <div className="action-buttons">
                        <button className="icon-button" onClick={() => handleModify(alumno)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </button>
                        <button className="icon-button" onClick={() => setModal(alumno._id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="red" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <button
              onClick={() => handlePageChange(1)}
              disabled={!pagination.hasPrevPage}
              style={{ padding: '8px 12px', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevPage ? 1 : 0.5 }}
            >
              {'<<'}
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              style={{ padding: '8px 12px', cursor: pagination.hasPrevPage ? 'pointer' : 'not-allowed', opacity: pagination.hasPrevPage ? 1 : 0.5 }}
            >
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

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              style={{ padding: '8px 12px', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', opacity: pagination.hasNextPage ? 1 : 0.5 }}
            >
              {'>'}
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={!pagination.hasNextPage}
              style={{ padding: '8px 12px', cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed', opacity: pagination.hasNextPage ? 1 : 0.5 }}
            >
              {'>>'}
            </button>
          </div>
        )}

        {mostrarModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>AVISO</h3>
              <p>¿Está seguro que desea continuar?</p>
              <p>
                Una vez eliminado, no podrá revertirse el proceso
              </p>
              <button onClick={handleDelete}>Continuar</button>
              <button onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        <div className="add-delete-buttons">
          <button onClick={handleNavigate1}>Agregar alumnos</button>
          <button onClick={handleNavigate2}>Administrar tutorados</button>
        </div>
      </div>
    </div>
  );
};

export default AlumnoListCG;
