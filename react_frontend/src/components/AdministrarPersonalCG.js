import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import './AdministrarPersonal.css';

const AdministrarPersonalCG = () => {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); 
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const [mostrarModal, setMostrarModal] = useState(false);
  const token = localStorage.getItem("token"); // Token de autenticación
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL;
  
  const navigate = useNavigate();
  const id_carrera = localStorage.getItem("id_carrera");

  useEffect(() => {

    // Verificar si hay un estado guardado en sessionStorage
    const estadoGuardado = sessionStorage.getItem("vistaPersonalCoordGen");
    // Si hay un estado guardado, usarlo para inicializar el componente
    const cameFromValidation = location.state?.reload === true;

    if (estadoGuardado && !cameFromValidation) {
      const { searchTerm: savedSearchTerm, scrollY, personal: savedPersonal } = JSON.parse(estadoGuardado);

      setSearchTerm(savedSearchTerm || "");
      setPersonal(savedPersonal || []);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 0);

      sessionStorage.removeItem("vistaPersonalCoordGen");
      setLoading(false);
      return;
    }

    const fetchPersonal = async () => {
      const matricula = localStorage.getItem("matricula");
      if (!matricula) {
        console.error("Matrícula no encontrada en localStorage");
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient.get(`${API_URL}/api/personal`);
        const personalConCarrera = await Promise.all(response.data.map(async (persona) => {
          try {
        const carreraResponse = await apiClient.get(`${API_URL}/api/cordgen/carrera/${persona.matricula}`);
        return { ...persona, id_carrera: carreraResponse.data.id_carrera };
          } catch (error) {
        console.error(`Error al obtener id_carrera para ${matricula}:`, error.message);
        return persona;
          }
        }));
        setPersonal(personalConCarrera);
      } catch (error) {
        console.error("Error al obtener datos del personal:", error.message);
      } finally {
        setLoading(false);
      }
        };
    fetchPersonal();
  }, []);

  // Carga el estado guardado en SessionStorage
  useEffect(() => {
      if (location.state?.reload) {
        window.history.replaceState({}, document.title);
      }
    }, []);

  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaPersonalCoordGen", JSON.stringify({
      searchTerm,
      scrollY: window.scrollY,
      personal
    }));
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(`${API_URL}/api/personal/${usuarioAEliminar}`);
      setPersonal(prevState => prevState.filter(persona => persona._id !== usuarioAEliminar));
      toast.success("Personal eliminado con éxito");
    } catch (error) {
      console.error("Error al eliminar personal:", error.message);
      const errorMessage = error.response?.data?.message || "Hubo un error al eliminar el personal";
      toast.error(errorMessage);
    } finally {
      setMostrarModal(false);
    }
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

  // Descargar archivo Excel de personal
  const handleDownloadExcel = async () => {
    const id_carrera = localStorage.getItem("id_carrera");
    if (!id_carrera) {
      toast.error("ID de carrera no encontrado.");
      return;
    }
    try {
      const response = await apiClient.get(
        `${API_URL}/api/personal/exportar-excel/carrera/${id_carrera}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "personal.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo Excel:", error);
      toast.error("No se pudo descargar el archivo Excel.");
    }
  };

  if (loading) {
    return <div className="loading">Cargando información del personal...</div>;
  }

  const personalConRoles = personal.map(persona => ({
    ...persona,
    rolesTexto: getRoleText(persona.roles).toLowerCase()
  }));
  
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

  // Filtrar personal por búsqueda
  const personalFiltrado = personalConRoles.filter(persona => {
    const search = searchTerm.toLowerCase();

    // Obtener nombre de carrera sin "Ing. en" y sin " (Semiescolarizado)"
    let nombreCarreraCompleto = carrerasPermitidas[persona.id_carrera] || "";
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
    const nombreCoincide = persona.nombre?.toLowerCase().includes(search);
    const matriculaCoincide = persona.matricula?.toLowerCase().includes(search);
    const idCarreraCoincide = persona.id_carrera?.toLowerCase().includes(search);
    const carreraNombreCoincide = nombreCarreraClave.includes(search);
    const rolesCoincide = persona.rolesTexto.includes(search);

    return (
      nombreCoincide ||
      matriculaCoincide ||
      idCarreraCoincide ||
      carreraNombreCoincide ||
      rolesCoincide
    );
  });

  return (
    <div className="personal-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="personal-container">
        <h3>Administrar personal</h3>
        <p className="info">Lista de personas asociados al programa académico:</p>

 
          <input
            type="text"
            placeholder="Buscar por carrera, matrícula, nombre o permisos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />

          {personalFiltrado.length > 0 ? (
          <div className="personal-scrollable-1">
            <table className="personal-table">
              <thead>
                <tr>
                    <th>Programa</th>
                    <th>Nombre</th>
                    <th>Matricula</th>
                    <th>Permisos</th>
                    <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
              {personalFiltrado.length > 0
                ? personalFiltrado
                    .sort((a, b) => {
                      const roleOrder = { 'C': 1, 'A': 2, 'D': 3, 'T': 4 };
                      const aRole = a.roles.find(role => roleOrder[role]) || 'T';
                      const bRole = b.roles.find(role => roleOrder[role]) || 'T';
                      return roleOrder[aRole] - roleOrder[bRole];
                    })
                    .map(personal => (
                      <tr key={personal.matricula}>
                        <td>{['C', 'A'].some(role => personal.roles.includes(role)) ? personal.id_carrera : '-'}</td>
                        <td>{personal.nombre}</td>
                        <td>{personal.matricula}</td>
                        <td>{getRoleText(personal.roles)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="icon-button" onClick={() => {
                              guardarEstadoVista();
                              navigate("/coord-gen/personal/modificar-personal", { state: { personal } })}}>
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
                    <td colSpan="5">No hay personal disponible.</td>
                  </tr>
                )}
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
              <p>¿Está seguro que desea eliminar este usuario?</p>
              <p>Esta acción no se puede revertir.</p>
              <button onClick={handleDelete}>Eliminar</button>
              <button onClick={() => setMostrarModal(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <div className="add-delete-buttons">
          <button onClick={() => {
            guardarEstadoVista();
            navigate("/coord-gen/personal/crear-personal")}}>Agregar personal</button>
        </div>
      </div>
    </div>
  );
};

export default AdministrarPersonalCG;