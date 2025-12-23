import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import apiClient from '../utils/axiosConfig';
import 'react-toastify/dist/ReactToastify.css';
import "./AlumnoList.css";

const AlumnoListAdmin = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [tutoresNombres, setTutoresNombres] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const id_carrera = localStorage.getItem("id_carrera");
  const token = localStorage.getItem("token");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const matriculaAdmin = localStorage.getItem("matricula");
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const location = useLocation();

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
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAlumnosPaginados = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`${API_URL}/api/alumnos/carrera-admin-paginados/${matriculaAdmin}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch
        }
      });

      const { alumnos: alumnosData, pagination: paginationData } = response.data;

      // Obtener los nombres de los tutores
      const tutoresNombresTemp = {};
      await Promise.all(alumnosData.map(async (alumno) => {
        if (alumno.tutor) {
          try {
            const tutorResponse = await apiClient.get(`${API_URL}/api/administradores/alumnos/${alumno.tutor}`);
            tutoresNombresTemp[alumno._id] = tutorResponse.data.nombre;
          } catch (error) {
            tutoresNombresTemp[alumno._id] = "Error al obtener tutor";
          }
        }
      }));

      // Obtener estatus para cada alumno
      const fetchEstatus = async (alumno) => {
        try {
          const estatusResponse = await fetch(`${API_URL}/api/tutores/estatus/${alumno.matricula}`, {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
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

    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      toast.error("Error al cargar los alumnos");
    } finally {
      setLoading(false);
    }
  }, [API_URL, matriculaAdmin, currentPage, itemsPerPage, debouncedSearch, token]);

  useEffect(() => {
    fetchAlumnosPaginados();
  }, [fetchAlumnosPaginados]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
      fetchAlumnosPaginados();
    }
  }, [location.state, fetchAlumnosPaginados]);

  // Restaurar estado al volver
  useEffect(() => {
    const estadoGuardado = sessionStorage.getItem("vistaAlumnoAdmin");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaAlumnoAdmin");
    }
  }, []);

  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaAlumnoAdmin", JSON.stringify({
      searchTerm,
      currentPage,
      itemsPerPage,
      scrollY: window.scrollY,
    }));
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await apiClient.get(`${API_URL}/api/alumnos/carrera-admin/${matriculaAdmin}`);
      const ids = response.data.map(a => a._id);
      const downloadResponse = await apiClient.post(
        `${API_URL}/api/alumnos/exportar-csv/carrera-filtrados/${id_carrera}`,
        { ids },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `alumnos_${id_carrera}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Error al descargar CSV");
    }
  };

  const handleNavigate = (alumno) => {
    guardarEstadoVista();
    navigate(`/administrador/revisar-horario/${alumno.matricula}`, { state: { nombre: alumno.nombre, matricula: alumno.matricula, matriculaTutor: matriculaAdmin } });
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

  const handleDownloadDB = () => {
    setMostrarModal(true);
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

        <input
          type="text"
          placeholder="Buscar por matrícula, nombre o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

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
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} alumnos
          </div>
        </div>

        {alumnos.length > 0 ? (
          <div className="alumno-scrollable-table">
            <table className="alumnos-table">
              <thead>
                <tr>
                  <th>Matricula</th>
                  <th>Nombre del alumno</th>
                  <th>Tutor asignado</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Horario</th>
                  <th>Estatus de horario</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno._id}>
                    <td>{alumno.matricula}</td>
                    <td>{alumno.nombre}</td>
                    <td>{tutoresNombres[alumno._id] ? tutoresNombres[alumno._id] : "Sin asignar"}</td>
                    <td>{alumno.correo}</td>
                    <td>{alumno.telefono}</td>
                    <td className="actions">
                      <button
                        className="icon-button"
                        onClick={() => handleNavigate(alumno)}
                        disabled={alumno.estatus === "En espera"}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </td>
                    <td>{getEstatusIcon(alumno.estatus)}</td>
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

        <div className="add-delete-buttons">
          <button onClick={handleDownloadDB}>Descargar lista de alumnos</button>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Descargar base de datos</h3>
            <p>Haga clic para descargar:</p>
            <button onClick={handleDownloadCSV}>Descargar CSV</button>
            <button onClick={() => setMostrarModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumnoListAdmin;
