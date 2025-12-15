import React, { useState, useEffect } from "react";
import "./RevisionHorarioTutor.css";
import { useNavigate, useLocation } from "react-router-dom";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import axios from "axios"; // Asegúrate de tener axios instalado

function RevisionComprobantePago() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [horario, setHorario] = useState([]);
  const [comentario, setComentario] = useState("");
  const [estatus, setEstatus] = useState(null);
  const [alumno, setAlumno] = useState(null);
  const token = localStorage.getItem("token");
  const [alumnoCargado, setAlumnoCargado] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { nombre, matricula, matriculaTutor, id_carrera: idCarreraState } = location.state || {};
  const id_carrera = idCarreraState || localStorage.getItem("id_carrera");
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

  useEffect(() => {
    // Obtener datos del alumno (no dependas del horario)
    fetch(`${API_URL}/api/alumnos/matricula/${matricula}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        } 
      }
    )
      .then(response => response.json())
      .then(data => {
        setAlumno(data);
        setAlumnoCargado(true);
      })
      .catch(error => {
        setAlumnoCargado(true); // Permite mostrar el comprobante aunque falle
      });

    // Obtener horario (opcional)
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
          setHorario([]);
          return null;
        }
        return response.json();
      })
      .then(data => {
        if (data) {
          setHorario(data.horario || []);
        }
      })
      .catch(error => {
        console.log("Error al obtener horario, usando horario vac\u00edo");
        setHorario([]);
      });
  }, [matricula]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    localStorage.removeItem("tutorId");
    localStorage.removeItem("matriculaTutor");
    navigate("/");
  };

  // Nueva función para validar comprobante
  const validarComprobante = async (nuevoEstatus) => {
    try {
      await apiClient.put(
        `${API_URL}/api/alumnos/validar-comprobante/${matricula}`,
        { estatus: nuevoEstatus }
      );
      toast.success(`Comprobante marcado como ${nuevoEstatus === "Aceptado" ? "ACEPTADO" : "RECHAZADO"}`);
      // Opcional: recargar datos del alumno o navegar
      setAlumno({ ...alumno, estatusComprobante: nuevoEstatus });
      // Usar matriculaTutor de props o de localStorage como fallback
      const tutorMatricula = matriculaTutor || localStorage.getItem("matriculaTutor") || "";

      
      // Filtrar por la matrícula para determinar el tipo de usuario
      if (tutorMatricula.startsWith("T")) {
        navigate("/tutor", { state: { reload: true } });
      } else if(tutorMatricula.startsWith("CG")){
        // Limpiar sessionStorage y navegar con reload para coordinador general
        sessionStorage.removeItem("vistaAlumnoCoordGen");
        setTimeout(() => {
          navigate("/coord-gen/alumnos", { state: { reload: true }, replace: true });
        }, 1000);
      } else if(tutorMatricula.startsWith("C")){
        // Limpiar sessionStorage y navegar con reload para coordinador
        sessionStorage.removeItem("vistaAlumnoCoord");
        setTimeout(() => {
          navigate("/coordinador/alumnos", { state: { reload: true }, replace: true });
        }, 1000);
      } else if (tutorMatricula.startsWith("P")) {
        // Regresar a la vista principal de docente
        navigate("/docente/alumnos", { state: { reload: true } });
      } else {
        navigate(-1);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al actualizar el estatus del comprobante";
      toast.error(errorMessage);
    }
  };

  // Mostrar comprobante aunque no haya horario ni alumno, pero sí matrícula
  return (
    <div className="horario-layout">
      <ToastContainer />
      <div className="horario-container">
        <div className="top-left">
          <button className="back-button" onClick={handleBack}>Regresar</button>
        </div>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
        <h1>Revisión de comprobante de pago</h1>
        {(alumnoCargado && (alumno || matricula)) ? (
          <>
            <div className="horario-header">
              <h3>Nombre del alumno: {alumno?.nombre || nombre || "Desconocido"}</h3>
              <h3>Carrera: {alumno?.id_carrera || id_carrera || "Desconocida"}</h3>
            </div>
            <div className="horario-content">
              <div className="comprobante-viewer" style={{ width: "100%", maxWidth: 1000, margin: "0 auto", marginBottom: 24 }}>
                <iframe
                  src={`${API_URL}/uploads/comprobantes/Pago_${matricula}.pdf`}
                  title="Comprobante de pago"
                  width="100%"
                  height="500px"
                  style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                >
                  Este navegador no soporta la visualización de PDFs.
                </iframe>
              </div>
            </div>
          </>
        ) : (
          <p>Cargando datos del alumno...</p>
        )}

        <div className="comments-validation-wrapper">
          <div className="validation-section">
            <h3>Validación</h3>
            <div className="button-group">
              <button
                className="accept-button"
                style={{ backgroundColor: "green", color: "white" }}
                onClick={() => validarComprobante("Aceptado")}
              >
                Aceptado
              </button>
              <button
                className="reject-button"
                style={{ backgroundColor: "red", color: "white" }}
                onClick={() => validarComprobante("Rechazado")}
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

export default RevisionComprobantePago;