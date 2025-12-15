import React, { useState, useEffect } from "react";
import "./RevisionHorarioTutor.css";
import apiClient from '../utils/axiosConfig';
import { useParams, useNavigate, useLocation } from "react-router-dom";

function RevisionHorarioTutor() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [horario, setHorario] = useState([]);
  const [comentario, setComentario] = useState("");
  const [estatus, setEstatus] = useState(null);
  const [alumno, setAlumno] = useState(null); // Inicializar como null
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

  // Recuperar el estado (nombre y matricula) desde la navegación
  const location = useLocation();
  const id_carrera = localStorage.getItem("id_carrera");
  const { nombre, matricula, matriculaTutor, origen } = location.state || {};
  const carrerasPermitidasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];

  useEffect(() => {
    fetch(`${API_URL}/api/tutores/horario/${matricula}`,
      {
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
                }

      }
    )
      .then(response => {
        if (!response.ok) {
          console.log(`No se pudo obtener el horario para ${matricula}`);
          throw new Error('No se pudo obtener el horario');
        }
        return response.json();
      })
      .then(data => {
        setAlumno(data.alumno);
        setHorario(data.horario || []);
      })
      .catch(error => {
        console.error("Error al cargar el horario:", error);
        setHorario([]);
      });
  }, [matricula]);

  const eliminarHorario = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tutores/eliminar/${alumno.matricula}`, {
        method: "DELETE",
        headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el horario");
      }

      //navigate(-1); // Regresar a la página anterior
    } catch (error) {
      console.error("Error al eliminar el horario:", error);
    }
  };

  const enviarComentarioCorreo = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tutores/${alumno._id}/comentario`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" },
        body: JSON.stringify({ comentario }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el comentario por correo");
      }

      //navigate(-1); // Regresar a la página anterior
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  const actualizarEstatus = async (nuevoEstatus) => {
    try {
      const response = await fetch(`${API_URL}/api/tutores/estatus/actualizar/${matricula}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" },
        body: JSON.stringify({ estatus: nuevoEstatus, comentario }),
      });
  
      if (!response.ok) {
        throw new Error("Error al actualizar el estatus");
      }
  
      // Usar matriculaTutor de props o de localStorage como fallback
      const tutorMatricula = matriculaTutor || localStorage.getItem("matriculaTutor") || "";
      
      // Filtrar por la matrícula para determinar el tipo de usuario
      if (tutorMatricula.startsWith("T")) {
        sessionStorage.removeItem("vistaAlumnoTutor");
        setTimeout(() => {
          navigate("/tutor", { state: { reload: true } });
        }, 200); // Espera un poco para mostrar el toast antes de recargar
      } else if (tutorMatricula.startsWith("P")) {
        sessionStorage.removeItem("vistaAlumnoDocente");
        setTimeout(() => {
          navigate("/docente/alumnos", { state: { reload: true } });
        }, 200); // Espera un poco para mostrar el toast antes de recargar
      } else if(tutorMatricula.startsWith("CG")){
        sessionStorage.removeItem("vistaAlumnoCoord");
        setTimeout(() => {
          navigate("/coord-gen/alumnos", { state: { reload: true } });
        }, 200); // Espera un poco para mostrar el toast antes de recargar
      } else if(tutorMatricula.startsWith("C")){
        sessionStorage.removeItem("vistaAlumnoCoordGen");
        setTimeout(() => {
          navigate("/coordinador/alumnos", { state: { reload: true } });
        }, 200); // Espera un poco para mostrar el toast antes de recargar
      } else {
          navigate(-1);
      }

      if (nuevoEstatus === 0) { // Si está rechazado
        await eliminarHorario(); // Esperar a que se complete
        //await enviarComentarioCorreo(); // Esperar a que se complete
      }
    } catch (error) {
      alert("Hubo un error al actualizar el estatus.");
      console.error("Error al actualizar el estatus:", error);
    }
  };

  const storedMatriculaTutor = localStorage.getItem("matriculaTutor");
  

  const handleBack = () => {
    navigate(-1, { state: { nombre, matricula: matriculaTutor || storedMatriculaTutor } });
  };

  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    localStorage.removeItem("tutorId");
    localStorage.removeItem("matriculaTutor"); // Limpiar la matrícula del tutor al cerrar sesión
    navigate("/");
  };

  const isSemiescolarizada = alumno && carrerasPermitidasSemiescolarizadas.includes(alumno.id_carrera);
  
  return (
    <div className="horario-layout">
      <div className="horario-container">
        <button className="button-small logout-button" onClick={handleLogout}>Cerrar sesión</button>
        <button className="button-small back-button" onClick={() => navigate(-1)}>Regresar</button>

        <h1>Revisión de horario</h1>
        {alumno ? (
          <>
            <div className="horario-header">
              <h3>Nombre del alumno: {alumno.nombre}</h3>
              <h3>Carrera: {alumno.id_carrera}</h3>
            </div>

            <div className="horario-content">
          {!isSemiescolarizada && (
            <>
              <table className="horario-table">
                <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Salón</th>
                    <th>Materia</th>
                    <th>Lunes</th>
                    <th>Martes</th>
                    <th>Miércoles</th>
                    <th>Jueves</th>
                    <th>Viernes</th>
                  </tr>
                </thead>
                <tbody>
                  {horario.map((materia, index) => (
                    <tr key={index}>
                      <td>{materia.grupo}</td>
                      <td>{materia.salon}</td>
                      <td>{materia.materia}</td>
                      <td>{materia.horarios.lunes || "-"}</td>
                      <td>{materia.horarios.martes || "-"}</td>
                      <td>{materia.horarios.miercoles || "-"}</td>
                      <td>{materia.horarios.jueves || "-"}</td>
                      <td>{materia.horarios.viernes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            
            </>
        )}

        {isSemiescolarizada && (
          <>
          
            <table className="horario-table">
            <thead>
                  <tr>
                    <th>Grupo</th>
                    <th>Salón</th>
                    <th>Materia</th>
                    <th>Paridad</th>
                    <th>Viernes</th>
                    <th>Sabado</th>
                  </tr>
                </thead>
                <tbody>
                  {horario.map((materia, index) => (
                    <tr key={index}>
                      <td>{materia.grupo}</td>
                      <td>{materia.salon}</td>
                      <td>{materia.materia}</td>
                      <td>{materia.semi}</td>
                      <td>{materia.horarios.viernes || "-"}</td>
                      <td>{materia.horarios.sabado || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            
            </>
        )}

            </div>
          </>
        ) : (
          <p>Cargando datos del alumno...</p>
        )}

        {mostrarModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>AVISO</h3>
              <p>Una vez que finalice el proceso, no podrá hacer cambios.</p>
              <p>¿Desea continuar con la validación?</p>
              <button onClick={actualizarEstatus}>Continuar</button>
              <button onClick={() => setMostrarModal(false)}>Cerrar</button>
            </div>
          </div>
        )}

        <div className="comments-validation-wrapper">
          <div className="comments-section">
            <h3>Comentarios</h3>
            <textarea 
              placeholder="Ingrese comentarios en caso de tenerlos." 
              value={comentario} 
              onChange={(e) => setComentario(e.target.value)} // Actualizar estado del comentario
            />
          </div>
          <div className="validation-section">
            <h3>Validación</h3>
            <div className="button-group">
            <button
              className="accept-button"
              style={{ backgroundColor: "green", color: "white" }}
              onClick={() => {
                setEstatus(1);
                actualizarEstatus(1);
              }}
            >
              Aceptado
            </button>
            <button
              className="reject-button"
              style={{ backgroundColor: "red", color: "white" }}
              onClick={() => {
                setEstatus(0);
                actualizarEstatus(0);
              }}
            >
              Rechazado
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevisionHorarioTutor;