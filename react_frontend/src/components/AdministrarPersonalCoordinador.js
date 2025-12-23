import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import './AdministrarPersonal.css';

const AdministrarPersonalCoordinador = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalPersonal, setMostrarModalPersonal] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();
  const id_carrera = localStorage.getItem("id_carrera");
  const matricula = localStorage.getItem("matricula");
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
    const estadoGuardado = sessionStorage.getItem("vistaPersonalCoord");
    if (estadoGuardado && !location.state?.reload) {
      const { searchTerm: savedSearch, currentPage: savedPage, itemsPerPage: savedLimit, scrollY } = JSON.parse(estadoGuardado);
      setSearchTerm(savedSearch || "");
      setCurrentPage(savedPage || 1);
      setItemsPerPage(savedLimit || 10);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 100);
      sessionStorage.removeItem("vistaPersonalCoord");
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

  const handleDelete = async () => {
    try {
      await apiClient.request({
        url: `${API_URL}/api/personal/coordinador`,
        method: 'DELETE',
        data: { usuarioAEliminar, idCarreraEsperada: id_carrera }
      });
      toast.success("Personal eliminado con éxito");
      fetchPersonalPaginado(); // Recargar la lista
    } catch (error) {
      toast.error("El docente o tutor tiene participacion en otra carrera");
    } finally {
      setMostrarModal(false);
    }
  };

  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaPersonalCoord", JSON.stringify({
      searchTerm,
      currentPage,
      itemsPerPage,
      scrollY: window.scrollY
    }));
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
                <th>Telefono</th>
                <th>Permisos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
            {personalConRoles.length > 0
              ? personalConRoles.map(personal => (
                    <tr key={personal.matricula}>
                      <td>{['C', 'A'].some(role => personal.roles.includes(role)) ? id_carrera : '-'}</td>
                      <td>{personal.nombre}</td>
                      <td>{personal.matricula}</td>
                      <td>{personal.correo}</td>
                      <td>{personal.telefono}</td>
                      <td>{getRoleText(personal.roles)}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="icon-button" onClick={() => {
                              guardarEstadoVista();
                              navigate("/coordinador/modificar-personal", { state: { personal } });
                            }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="blue" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                          </button>
                          <button className="icon-button" onClick={() => { setUsuarioAEliminar(personal._id); setMostrarModal(true); }}>
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
                  ))
              : (
                <tr>
                  <td colSpan="7">No hay personal disponible.</td>
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

        {mostrarModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>AVISO</h3>
              <p>¿Está seguro que desea eliminar este usuario?</p>
              <p>Esta acción no se puede revertir.</p>
              <button onClick={handleDelete}>Eliminar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {mostrarModalPersonal && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Descargar base de datos</h3>
                  <p>Haga clic para descargar la base de datos:</p>
                  <ul>
                  </ul>
                  <p>
                  </p>
                  <button onClick={handleDownloadCSV}>Descargar CSV</button>
                  <button onClick={() => setMostrarModalPersonal(false)}>Cerrar</button>
                </div>
              </div>
            )}

        <div className="add-delete-buttons">
          <button onClick={() => {
            guardarEstadoVista();
            navigate("/coordinador/crear-personal");
          }}>Agregar personal</button>
          <button onClick={handleDownloadDB}>Descargar CSV de personal</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarPersonalCoordinador;