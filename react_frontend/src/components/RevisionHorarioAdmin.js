import React, { useState, useEffect } from "react";
import "./RevisionHorarioTutor.css";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { useParams, useNavigate, useLocation } from "react-router-dom";

function RevisionHorarioAdmin() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [horario, setHorario] = useState([]);
  const [comentario, setComentario] = useState("");
  const token = localStorage.getItem("token");
  const [estatus, setEstatus] = useState(null);
  const [alumno, setAlumno] = useState(null); // Inicializar como null
  const navigate = useNavigate();

  // Recuperar el estado (nombre y matricula) desde la navegación
  const location = useLocation();
  const id_carrera = localStorage.getItem("id_carrera");
  const { nombre , matricula, matriculaTutor } = location.state || {};
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
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

  const eliminarHorario = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tutores/eliminar/${alumno.matricula}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "DELETE",
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
      const response = await fetch(`${API_URL}/api/tutores/enviarCorreo`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ alumnoId: alumno._id, comentario }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar el comentario por correo");
      }

    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };


const actualizarEstatus = async (nuevoEstatus) => {
  try {
    const response = await fetch(`${API_URL}/api/tutores/estatus/actualizar-admin/${matricula}`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" },
      body: JSON.stringify({ estatus: nuevoEstatus, comentario }),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar el estatus");
    }

    const adminMatricula = matriculaTutor || localStorage.getItem("matriculaTutor") || "";


    if (adminMatricula.startsWith("AG")) {
        navigate("/admin-gen/alumnos", { state: { reload: true } });
      } else if (adminMatricula.startsWith("A")) {
        // Regresar a la vista principal de docente (no a /docente/alumnos)
        navigate("/administrador/alumnos", { state: { reload: true } });
      } else {
        navigate(-1);
      }

    // Ya NO elimines el horario ni envíes el comentario aquí,
    // el backend ya envía el correo automáticamente al cambiar el estatus.
  } catch (error) {
    console.error("Error al actualizar el estatus:", error);
    alert("Hubo un error al actualizar el estatus.");
  }
};
  

  const handleBack = () => { 
    navigate(-1); // Navegar a la página anterior 
  }

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
          <button className="back-button" onClick={handleBack}>Regresar</button>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
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
              style={{ backgroundColor: "orange", color: "white" }}
              onClick={() => {
                setEstatus(0);
                actualizarEstatus(0);
              }}
            >
              Quitar validación
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevisionHorarioAdmin;