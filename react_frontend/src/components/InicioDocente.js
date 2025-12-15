import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "./InicioDocente.css";

function InicioDocente() {
 
  const [alumnos, setAlumnos] = useState([]);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [comprobantes, setComprobantes] = useState([]);
  const [comprobantePorCarrera, setComprobantePorCarrera] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;
  
  const nombreDocente = localStorage.getItem("matricula");

  const { nombre, matricula: matriculaDocente } = location.state || {};

    // Guardar la matrícula del tutor en localStorage
    useEffect(() => {
      if (matriculaDocente) {
        localStorage.setItem("matriculaDocente", matriculaDocente);
      }
    }, [matriculaDocente]);
  
    // Obtener la matrícula y nombre del docente desde localStorage si no está en location.state
    const storedMatriculaDocente = localStorage.getItem("matriculaDocente");
    // Evitar que el usuario regrese a la pantalla anterior con el botón de retroceso
    useEffect(() => {
      const bloquearAtras = () => {
        window.history.pushState(null, null, window.location.href);
      };
  
      bloquearAtras();
      window.addEventListener("popstate", bloquearAtras);
  
      return () => {
        window.removeEventListener("popstate", bloquearAtras);
      };
    }, []);


    useEffect(() => {

      // Verificar si hay un estado guardado en sessionStorage
      const estadoGuardado = sessionStorage.getItem("vistaAlumnoDocente");
      const cameFromValidation = location.state?.reload === true;

      // Si hay un estado guardado y no se viene de la validación, restaurar el estado
      if (estadoGuardado && !cameFromValidation) {
        const { searchTerm, scrollY, alumnos: savedAlumnos, comprobantePorCarrera: savedComprobantePorCarrera, comprobantes: savedComprobantes } = JSON.parse(estadoGuardado);

        setSearchTerm(searchTerm || "");
        setAlumnos(savedAlumnos || []);
        setComprobantePorCarrera(savedComprobantePorCarrera || {});
        setComprobantes(savedComprobantes || []);
        setTimeout(() => window.scrollTo(0, scrollY || 0), 0);

        sessionStorage.removeItem("vistaAlumnoDocente");
        setLoading(false);
        return;
      }

      const fetchAlumnos = async () => {
        try {
          const matricula = matriculaDocente || storedMatriculaDocente;
          if (!matricula) {
            console.error("Matrícula del docente no encontrada");
            setError("Matrícula del docente no encontrada");
            setLoading(false);
            return;
          }
  
          const response = await fetch(`${API_URL}/api/docentes/alumnos/${matricula}`,
            {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          if (!response.ok) {
            throw new Error("Error al obtener los alumnos");
          }
  
          const data = await response.json();
  
          const fetchEstatus = async (alumno) => {
            try {
              const estatusResponse = await fetch(`${API_URL}/api/docentes/estatus/${alumno.matricula}`,
                {
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  }
                }
              );
              if (!estatusResponse.ok) {
                throw new Error("Error al obtener el estatus del horario");
              }
              const estatusData = await estatusResponse.json();
              return { ...alumno, estatus: estatusData.estatus };
            } catch (error) {
              console.error("Error al obtener el estatus del horario para", alumno.matricula, error);
              return { ...alumno, estatus: "Desconocido" };
            }
          };
  
          const alumnosConEstatus = await Promise.all(data.alumnos.map(fetchEstatus));
          const carrerasUnicas = [...new Set(alumnosConEstatus.map(a => a.id_carrera))];
          const comprobanteCarreraTemp = {};

          await Promise.all(carrerasUnicas.map(async (carrera) => {
            try {
              const res = await apiClient.get(`${API_URL}/api/coordinadores/comprobante-habilitado/${carrera}`);
              comprobanteCarreraTemp[carrera] = res.data.comprobantePagoHabilitado;
            } catch (error) {
              console.log(`No se encontró configuración de comprobante para carrera ${carrera}, usando valor por defecto: true`);
              comprobanteCarreraTemp[carrera] = true;
            }
          }));

          setComprobantePorCarrera(comprobanteCarreraTemp);
          setAlumnos(alumnosConEstatus);

          // Cargar comprobantes
          try {
            const comprobantesResponse = await apiClient.get(`${API_URL}/api/alumnos/comprobantes/lista`);
            setComprobantes(comprobantesResponse.data);
          } catch (error) {
            console.error("Error al obtener comprobantes:", error);
            setComprobantes([]);
          }

          setLoading(false);
        } catch (error) {
          console.error("Error al obtener los alumnos:", error);
          setError("Error al cargar los alumnos. Por favor, inténtalo de nuevo.");
          setLoading(false);
        }
      };

      // Recarga si location.state.reload es true, igual que en InicioTutor
      if (location.state && location.state.reload) {
        fetchAlumnos();
        // Limpiar la bandera para evitar recargas infinitas
        navigate(location.pathname, { replace: true, state: { ...location.state, reload: false } });
      } else {
        fetchAlumnos();
      }
    }, [matriculaDocente, storedMatriculaDocente, location.state]);

    // Limpiar estado de reload
    useEffect(() => {
      if (location.state?.reload) {
        window.history.replaceState({}, document.title);
      }
    }, []);

  const guardarEstadoVista = () => {
    sessionStorage.setItem("vistaAlumnoDocente", JSON.stringify({
    searchTerm,
    scrollY: window.scrollY,
    alumnos,
    comprobantes,
    comprobantePorCarrera,
    }));
  };

  // Navega a la vista para revisar el horario del alumno
  const handleRevisarHorario = (alumno) => {
    guardarEstadoVista(); // Guardar el estado antes de navegar
    navigate(`/docente/revisar-horario/${alumno.matricula}`, { state: { nombre: alumno.nombre, matricula: alumno.matricula, matriculaTutor: matriculaDocente, id_carrera: alumno.id_carrera} });
  };

  // Funcion que permite descargar la base de datos de alumnos del docente en CSV
  const handleDownloadCSV = async () => {
    const matriculas = alumnosFiltrados.map((a) => a.matricula);
    if (matriculas.length === 0) {
      alert("No hay alumnos filtrados para exportar.");
      return;
    }

    try {
      const response = await apiClient.post(
        `${API_URL}/api/alumnos/exportar-csv/filtrados`,
        { matriculas },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `alumnos_${matriculaDocente || storedMatriculaDocente}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(" Error al descargar CSV:", error);
      alert("Error al descargar la lista filtrada.");
    }
  };

  // Carreras permitidas para una carrera
  const carrerasPermitidas = {
      ISftw: "Software",
      IDsr: "Desarrollo",
      IEInd: "Electrónica Industrial",
      ICmp: "Computación",
      IRMca: "Robótica y Mecatrónica",
      IElec: "Electricista",
      ISftwS: "Software (Semiescolarizado)",
      IDsrS: "Desarrollo (Semiescolarizado)",
      IEIndS: "Electrónica Industrial(Semiescolarizado)",
      ICmpS: "Computación (Semiescolarizado)",
      IRMcaS: "Robótica y Mecatrónica (Semiescolarizado)",
      IElecS: "Electricista (Semiescolarizado)",
    };

  // Función que cierra sesión
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    localStorage.removeItem("tutorId");
    localStorage.removeItem("matriculaTutor"); // Limpiar la matrícula del tutor al cerrar sesión
    localStorage.removeItem("nombreTutor");
    navigate("/");
  };

  const handleChangeView = () => {
    navigate('/docente/materias', { state: { nombre, matricula: matriculaDocente || storedMatriculaDocente } });
  }

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


  
  // Filtrar alumnos por búsqueda
  const alumnosFiltrados = alumnos.filter(alumno => {
  const nombreCoincide = alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase());
  const estatusCoincide = alumno.estatus.toLowerCase() === searchTerm.toLowerCase();
  
  // Si searchTerm coincide exactamente con un estatus conocido, filtramos solo por estatus
  const esFiltroPorEstatus = ["falta de revisar", "revisado", "en espera"].includes(searchTerm.toLowerCase());

  return esFiltroPorEstatus ? estatusCoincide : nombreCoincide || estatusCoincide;
});


  // Manejar la validación del pago
  const handleValidate = (alumno) => {
    navigate(`/tutor/validar-pago/${alumno.matricula}`, { 
      state: { 
        nombre: alumno.nombre, 
        matricula: alumno.matricula, 
        matriculaTutor: matriculaDocente,
        id_carrera: alumno.id_carrera // AGREGADO
      } 
    });
  };

  return (
    <div className="docente-layout">
      <div className="docente-container">
        <div className="top-right"> 
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button> 
        </div>

        <h2>Docente</h2>
        <h4>{`Bienvenido, ${nombre || nombreDocente}`}</h4>
        <h4>A continuación, seleccione la lista que desee visualizar</h4>

        <div className="docente-buttons">
          <button className="button">Lista de alumnos</button>
          <button className="button" onClick={handleChangeView}>Lista de materias</button>
        </div>

        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por nombre o estatus..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
  <button onClick={() => setSearchTerm("")} className="clear-filter-button">
    Limpiar filtro
  </button>
        {error && <p className="error-message">{error}</p>}
        {alumnosFiltrados.length > 0 ? (
          <div className="docente-content">
            <div className="docente-scrollable-table">
              <table className="docente-tabla">
                <thead>
                  <tr>
                    <th>Matricula</th>
                    <th>Nombre del alumno</th>
                    <th>Carrera</th>
                    <th>Revisar horario</th>
                    <th>Estatus</th>
                    <th>Comprobante de pago</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map((alumno) => (
                    <tr key={alumno._id}>
                      <td>{alumno.matricula}</td>
                      <td>{alumno.nombre}</td>
                      <td>{carrerasPermitidas[alumno.id_carrera] || alumno.id_carrera}</td>
                      <td>
                        <button
                          className="icon-button"
                          onClick={() => handleRevisarHorario(alumno)}
                          disabled={alumno.estatus === "En espera"} // Deshabilitar botón si el estatus es "En espera"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="blue"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="no-alumnos-message">No se encontraron resultados.</p>
        )}

        <div className="horario-buttons">
          <button className="button"
            onClick={handleDownloadCSV}
             disabled={alumnosFiltrados.length === 0}>
            Descargar Lista de alumnos
          </button>
        </div>
      </div>
    </div>
  );
}

export default InicioDocente;