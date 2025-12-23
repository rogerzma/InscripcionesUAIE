import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import './AdministrarPersonal.css';

const AdministrarPersonalAdmin = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModalPersonal, setMostrarModalPersonal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const id_carrera = localStorage.getItem("id_carrera");
  const matricula = localStorage.getItem("matricula");
  const API_URL = process.env.REACT_APP_API_URL;
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

  // Función para obtener personal paginado
  const fetchPersonalPaginado = useCallback(async () => {
    if (!matricula) {
      console.error("Matrícula no encontrada en localStorage");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get(`${API_URL}/api/personal/carrera-paginados/${matricula}`, {
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearch
        }
      });

      const { personal: personalData, pagination: paginationData } = response.data;
      setPersonal(personalData);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error al obtener datos del personal:", error.message);
      toast.error("Error al cargar el personal");
    } finally {
      setLoading(false);
    }
  }, [API_URL, matricula, currentPage, itemsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchPersonalPaginado();
  }, [fetchPersonalPaginado]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
      fetchPersonalPaginado();
    }
  }, [location.state, fetchPersonalPaginado]);

  // Restaurar estado al volver
  useEffect(() => {
    const estadoGuardado = sessionStorage.getItem("vistaPersonalAdmin");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaPersonalAdmin");
    }
  }, []);

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

  const getRoleText = (roles) => {
    if (!Array.isArray(roles)) {
      return 'Desconocido';
    }
  
    return roles.map(role => {
      switch (role) {
        case 'D':
          return 'Docente';
        case 'T':
          return 'Tutor';
        case 'C':
          return 'Coordinador';
        case 'A':
          return 'Administrador';
        default:
          return 'Desconocido';
      }
    }).join(', ');
  };

  const handleDownloadCSV = async () => {
    const id_carrera = localStorage.getItem("id_carrera");
    const matriculas = personal.map((p) => p.matricula);

    if (!id_carrera || matriculas.length === 0) {
      toast.error("No hay personal o falta el id_carrera.");
      return;
    }

    try {
      const response = await apiClient.post(
        `${API_URL}/api/personal/exportar-csv/carrera-filtrados/${id_carrera}`,
        { matriculas },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `personal_filtrado_${id_carrera}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar CSV filtrado de personal:", error);
      toast.error("No se pudo descargar el archivo.");
    }
  };

  const handleDownloadDB = () => {
    setMostrarModalPersonal(true);
  };

  if (loading) {
    return <div className="loading">Cargando información del personal...</div>;
  }

  const personalConRoles = personal.map(persona => ({
    ...persona,
    rolesTexto: getRoleText(persona.roles).toLowerCase()
  }));

  
  return (
    <div className="personal-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="personal-container">
        <h3>Administrar personal</h3>
        <p className="info">Lista de personas asociados al programa académico:</p>

        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por matrícula, nombre o permisos..."
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
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} de {pagination.total} registros
          </div>
        </div>

        {personalConRoles.length > 0 ? (
          <div className="personal-scrollable-1">
            <table className="personal-table">
              <thead>
                <tr>
                  <th>Programa</th>
                  <th>Nombre</th>
                  <th>Matricula</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Permisos</th>
                </tr>
              </thead>
              <tbody>
              {personalConRoles.length > 0 ? (
                personalConRoles.map(personal => (
                  <tr key={personal.matricula}>
                    <td>{['C', 'A'].some(role => personal.roles.includes(role)) ? id_carrera : '-'}</td>
                    <td>{personal.nombre}</td>
                    <td>{personal.matricula}</td>
                    <td>{personal.correo}</td>
                    <td>{personal.telefono}</td>
                    <td>{getRoleText(personal.roles)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No hay personal disponible.</td>
                </tr>
              )}
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

        {mostrarModalPersonal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Descargar base de datos</h3>
              <p>Haga clic para descargar la base de datos:</p>
              <button onClick={handleDownloadCSV}>Descargar CSV</button>
              <button onClick={() => setMostrarModalPersonal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        <div className="add-delete-buttons">
          <button onClick={handleDownloadDB}>Descargar base de datos de personal</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarPersonalAdmin;