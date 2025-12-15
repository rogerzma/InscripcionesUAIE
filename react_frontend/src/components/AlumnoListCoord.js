import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../utils/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./AlumnoList.css";

const AlumnoListCoord = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [tutoresNombres, setTutoresNombres] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalMaterias, setMostrarModalMaterias] = useState(false);
  const [nombre, setNombreAlumno] = ("");
  const [comprobanteHabilitado, setComprobanteHabilitado] = useState(true);
  const id_carrera = localStorage.getItem("id_carrera");
  const location = useLocation(); 
  const [comprobantes, setComprobantes] = useState([]);
  const [matricula, setMatriculaAlumno] = useState("");
  const [mostrarComprobante, setMostrarComprobante] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const [loading, setLoading] = useState(true);
  const [AlumnoAEliminar, setAlumnoAEliminar] = useState(null);
  const matriculaCord = localStorage.getItem("matricula");
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;


  useEffect(() => {
    // Obtener alumnos y tutores
    const fetchAlumnos = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/alumnos/carrera/${matriculaCord}`);
        const alumnosData = response.data;

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

        // Obtener estatus de horario para cada alumno
        const fetchEstatus = async (alumno) => {
          try {
            const token = localStorage.getItem("token");
            const estatusResponse = await fetch(
              `${API_URL}/api/tutores/estatus/${alumno.matricula}`,
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
            console.error("Error al obtener el estatus del horario para", alumno.matricula, error);
            return { ...alumno, estatus: "Desconocido" };
          }
        };

        const alumnosConEstatus = await Promise.all(alumnosData.map(fetchEstatus));
        setAlumnos(alumnosConEstatus);
        setTutoresNombres(tutoresNombresTemp);
      } catch (error) {
        console.error('Error al obtener alumnos:', error);
      }
    };

    // Obtener lista de comprobantes
    const fetchComprobantes = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/alumnos/comprobantes/lista`);
        setComprobantes(response.data);
      } catch (error) {
        console.error('Error al obtener la lista de comprobantes:', error);
      }
    };

    // Obtener si el comprobante está habilitado
    const fetchComprobanteHabilitado = async () => {
      try {
        const res = await apiClient.get(`${API_URL}/api/coordinadores/comprobante-habilitado/${id_carrera}`);
        setComprobanteHabilitado(res.data.comprobantePagoHabilitado);
        setMostrarComprobante(res.data.comprobantePagoHabilitado); // Sincroniza el estado visual
      } catch (error) {
        setComprobanteHabilitado(true); // Por defecto true si falla
        setMostrarComprobante(true);
      }
    };

    // Recuperar estado guardado de la sesión
    const estadoGuardado = sessionStorage.getItem("vistaAlumnoCoord");
    
    // Verificar si se viene de una validación
    const cameFromValidation = location.state?.reload === true;

    // Si hay un estado guardado, restaurarlo
    if (estadoGuardado && !cameFromValidation) {
      const { searchTerm, scrollY, alumnos, tutoresNombres, mostrarComprobante } = JSON.parse(estadoGuardado);
      setSearchTerm(searchTerm || "");
      setAlumnos(alumnos || []);
      setTutoresNombres(tutoresNombres || {});
      setMostrarComprobante(mostrarComprobante ?? true);
      setComprobanteHabilitado(mostrarComprobante ?? true);
      setTimeout(() => window.scrollTo(0, scrollY || 0), 0);
      sessionStorage.removeItem("vistaAlumnoCoord");
      setLoading(false);
      return;
    }

    // Si reload es true, borra el sessionStorage y haz fetch
    if (cameFromValidation) {
      sessionStorage.removeItem("vistaAlumnoCoord");
    }

    // Ejecutar todas las funciones asíncronas
    const fetchData = async () => {
      await fetchAlumnos();
      await fetchComprobantes();
      await fetchComprobanteHabilitado();
      setLoading(false);
    };

    fetchData();
  }, [matriculaCord, id_carrera, location.state]);

  useEffect(() => {
    if (location.state?.reload) {
      window.history.replaceState({}, document.title);
    }
  }, []);


  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaAlumnoCoord", JSON.stringify({
      searchTerm,
      scrollY: window.scrollY,
      alumnos,
      tutoresNombres,
      mostrarComprobante,
    }));
  };


  const handleNavigate1 = () => {
    guardarEstadoVista(); // Guarda el estado actual antes de navegar
    navigate("/coordinador/crear-alumno", { state: { matriculaCord: matriculaCord } });
  };

    const handleDownloadCSV = async () => {
      const ids = alumnosFiltrados.map(a => a._id);
      const response = await apiClient.post(
        `${API_URL}/api/alumnos/exportar-csv/carrera-filtrados/${id_carrera}`,
        { ids },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `alumnos_filtrados.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  const handleNavigate2 = () => {
    guardarEstadoVista(); // Guarda el estado actual antes de navegar
    navigate("/coordinador/admin-tutor", { state: { matriculaCord: matriculaCord } });
  };

  const handleNavigate3 = (alumno) => {
    guardarEstadoVista(); // Guarda el estado actual antes de navegar
    navigate(`/coordinador/revisar-horario/${alumno.matricula}`, { state: 
      { 
        nombre: alumno.nombre, 
        matricula: alumno.matricula, 
        matriculaTutor: matriculaCord
      } 
    });
  };

  const handleNavigate4 = (alumno) => {
    guardarEstadoVista(); // Guarda el estado actual antes de navegar
    navigate(`/coordinador/validar-pago/${alumno.matricula}`, { state: { nombre: alumno.nombre, matricula: alumno.matricula, matriculaTutor: matriculaCord} });
  };

  const handleModify = (alumno) => {
    guardarEstadoVista(); // Guarda el estado actual antes de navegar
    navigate("/coordinador/modificar-alumno", { state: { alumno, matriculaCord: matriculaCord } });
  };

  const handleToggleComprobante = async () => {
    const nuevoEstado = !comprobanteHabilitado;
    setComprobanteHabilitado(nuevoEstado);
    setMostrarComprobante(nuevoEstado);
    try {
      await apiClient.put(`${API_URL}/api/coordinadores/comprobante-habilitado/${id_carrera}`, {
        comprobantePagoHabilitado: nuevoEstado
      });
      toast.success(nuevoEstado ? "Comprobante habilitado" : "Comprobante deshabilitado");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al actualizar el estado del comprobante";
      toast.error(errorMessage);
    }
  };

  const setModal = (id) => {
    setAlumnoAEliminar(id);
    setMostrarModal(true);
  };

  const handleDownloadDB = () => {
    setMostrarModalMaterias(true);
  };
  

  const handleDelete = async () => {
    try {
      await apiClient.delete(`${API_URL}/api/alumnos/${AlumnoAEliminar}`);
      setAlumnos(prevState => prevState.filter(alumno => alumno._id !== AlumnoAEliminar));
      toast.success("Alumno eliminado con éxito");
      setMostrarModal(false);
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
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

  
  if (loading) {
    return <div className="loading">Cargando información de alumnos...</div>;
  }

    // Filtrar alumnos por búsqueda
  const alumnosFiltrados = alumnos.filter(alumno => {
    const search = searchTerm.toLowerCase();
    const nombreCoincide = alumno.nombre.toLowerCase().includes(search);
    const matriculaCoincide = alumno.matricula.toLowerCase().includes(search);
    const tutorCoincide =
      tutoresNombres[alumno._id] &&
      tutoresNombres[alumno._id].toLowerCase().includes(search);
    const estatusCoincide = alumno.estatus.toLowerCase() === search;
    const idCarreraCoincide = alumno.id_carrera.toLowerCase().includes(search);
    // Si el término de búsqueda es un estatus exacto, solo filtrar por estatus
    const esFiltroPorEstatus = ["falta de revisar", "revisado", "en espera"].includes(search);

    
    return esFiltroPorEstatus
      ? estatusCoincide
      : nombreCoincide || matriculaCoincide || tutorCoincide || idCarreraCoincide || alumno.estatus.toLowerCase().includes(search);
  });


  return (
    <div className="alumno-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="alumno-container">
      <h3>Administrar alumnos</h3>
      <p>Lista de alumnos asociados al programa académico</p>
      
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          {/* Input de búsqueda */}
          <input
            type="text"
            placeholder="Buscar por matrícula, nombre, tutor o estatus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
            style={{ flex: 1, minWidth: "450px", height: "50px" }} // Más ancho y alto fijo
          />
          <button
           className="clear-filter-button"
            onClick={handleToggleComprobante}
          >
            {mostrarComprobante ? "Descativar comp. de pago" : "Activar comp. de pago"}
          </button>
          <button onClick={() => setSearchTerm("")} className="clear-filter-button">
            Limpiar filtro
          </button>
        </div>

      {alumnosFiltrados.length > 0 ? (
      <div className="alumno-scrollable-table">
        <table className="alumnos-table">
          <thead>
            <tr>
              <th>Matricula</th>
              <th>Nombre alumno</th>
              <th>Tutor</th>
              <th>Correo</th>
              <th>Telefono</th>
              <th>Horario</th>
              <th>Estatus</th>
              {mostrarComprobante && <th>Pago</th>}
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
          {alumnosFiltrados.map((alumno) => (
              <tr key={alumno._id}>
                <td>{alumno.matricula}</td>
                <td>{alumno.nombre}</td>
                <td>{tutoresNombres[alumno._id] ? tutoresNombres[alumno._id] : "Sin asignar"}</td>
                <td>{alumno.correo}</td>
                <td>{alumno.telefono}</td>
                <td className="actions">
                  <button
                    className="icon-button"
                    onClick={() => handleNavigate3(alumno)}
                    disabled={alumno.estatus === "En espera"} // Deshabilitar el botón si el estatus es "En espera"
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
                {mostrarComprobante && (
                  <td>
                    {comprobantes.includes(`Pago_${alumno.matricula}.pdf`) ? (
                      alumno.estatusComprobante === "Rechazado" ? (
                        // Rojo: Rechazado
                        <button
                          className="icon-button"
                          onClick={() => handleNavigate4(alumno)}
                          title="Comprobante rechazado"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="red" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </button>
                      ) : alumno.estatusComprobante === "Pendiente" ? (
                        // Amarillo: Pendiente
                        <button
                          className="icon-button"
                          onClick={() => handleNavigate4(alumno)}
                          title="Comprobante pendiente de revisión"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#FFD600" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </button>
                      ) : alumno.estatusComprobante === "Revisado" || alumno.estatusComprobante === "Aceptado" ? (
                        // Verde: Revisado/Aceptado
                        <button
                          className="icon-button"
                          onClick={() => handleNavigate4(alumno)}
                          title="Comprobante aceptado"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="green" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </button>
                      ) : (
                        // Gris: Subido pero sin estatus válido
                        <button
                          className="icon-button"
                          onClick={() => handleNavigate4(alumno)}
                          title="Comprobante sin estatus"
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#BDBDBD" viewBox="0 0 24 24">
                            <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                          </svg>
                        </button>
                      )
                    ) : (
                      // Gris: No subido
                      <span title="Sin comprobante">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#BDBDBD" viewBox="0 0 24 24">
                          <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                        </svg>
                      </span>
                    )}
                  </td>
                )}
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

      {mostrarModalMaterias && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Descargar base de datos base de datos</h3>
                  <p>Seleccione el archivo a subir:</p>
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
        <button onClick={handleNavigate1}>Agregar alumnos</button>
        <button onClick={handleNavigate2}>Administrar tutorados</button>
        <button onClick={handleDownloadDB}>Descargar lista de alumnos</button>
      </div>

      <ul>
        
      </ul>
    </div>
    </div>
    
  );
};

export default AlumnoListCoord;