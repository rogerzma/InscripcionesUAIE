import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from '../utils/axiosConfig';
import "./AdministrarMaterias.css";

const AdministrarMateriasAdmin = () => {
  const [materias, setMaterias] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [mostrarModalMaterias, setMostrarModalMaterias] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  const id_carrera = localStorage.getItem("id_carrera");
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
  }, [fetchMateriasPaginadas]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
      fetchMateriasPaginadas();
    }
  }, [location.state, fetchMateriasPaginadas]);

  // Restaurar estado al volver
  useEffect(() => {
    const estadoGuardado = sessionStorage.getItem("vistaMateriasAdmin");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaMateriasAdmin");
    }
  }, []);

  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaMateriasAdmin", JSON.stringify({
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
                  <th>Lunes</th>
                  <th>Martes</th>
                  <th>Miércoles</th>
                  <th>Jueves</th>
                  <th>Viernes</th>
                  <th>Sabado</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia._id}>
                    <td>{materia.grupo}</td>
                    <td>{materia.salon}</td>
                    <td>{materia.cupo}</td>
                    <td>{materia.nombre}</td>
                    <td>{getDocenteNombre(materia)}</td>
                    <td>{materia.laboratorio ? "Sí" : "No"}</td>
                    <td>{materia.horarios.lunes || "-"}</td>
                    <td>{materia.horarios.martes || "-"}</td>
                    <td>{materia.horarios.miercoles || "-"}</td>
                    <td>{materia.horarios.jueves || "-"}</td>
                    <td>{materia.horarios.viernes || "-"}</td>
                    <td>{materia.horarios.sabado || "-"}</td>
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
          <button onClick={handleDownloadCSV}>Descargar base de datos de materias</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarMateriasAdmin;
