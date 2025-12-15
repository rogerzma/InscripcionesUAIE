import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Validacion2.css";

function Validacion2() {
  const navigate = useNavigate();
  const location = useLocation();
  const [archivo, setArchivo] = useState(null);
  const [archivoSubido, setArchivoSubido] = useState(false);
  const [archivoURL, setArchivoURL] = useState("");
  const [matricula, setMatricula] = useState(localStorage.getItem("matricula"));
  const [nombreAlumno, setNombreAlumno] = useState(location.state?.nombre || "");
  const [IDAlumno, setIDAlumno] = useState(location.state?._id || "");
  const [estatusHorario, setEstatusHorario] = useState(0); // 0: En proceso, 1: Validado
  const [estatusComprobante, setEstatusComprobante] = useState("Pendiente");
  const [comprobanteExiste, setComprobanteExiste] = useState(false);
  const [comprobanteHabilitado, setComprobanteHabilitado] = useState(true);
  const id_carrera = localStorage.getItem("id_carrera");
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env

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
    const nombre = location.state?.nombre || localStorage.getItem("nombreAlumno");
    setNombreAlumno(nombre || "Alumno desconocido");
  }, [location.state]);

  useEffect(() => {
    const idAlumno = location.state?.id || localStorage.getItem("IDAlumno");
    setIDAlumno(idAlumno || "ID desconocido");
  }, [location.state]);

  useEffect(() => {
    // Obtener el estatus del horario del alumno
    const obtenerEstatusHorario = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/alumnos/estatus/${matricula}`);
        setEstatusHorario(response.data); // Guardar el estatus recibido (0 o 1)
      } catch (error) {
        console.error("Error al obtener el estatus del horario:", error);
      }
    };
    obtenerEstatusHorario();
  }, [matricula]);

  useEffect(() => {
    const fetchComprobanteHabilitado = async () => {
      try {
        const res = await apiClient.get(`${API_URL}/api/coordinadores/comprobante-habilitado/${id_carrera}`);
        setComprobanteHabilitado(res.data.comprobantePagoHabilitado);
      } catch (error) {
        setComprobanteHabilitado(true); // Por defecto true si falla
      }
    };
    fetchComprobanteHabilitado();
  }, [id_carrera]);

  useEffect(() => {
    // Consultar si ya hay comprobante y su estatus usando la nueva ruta optimizada
    const fetchComprobanteYEstado = async () => {
      try {
        const response = await apiClient.get(`${API_URL}/api/alumnos/comprobante/${matricula}`);
        setComprobanteExiste(response.data.existe);
        setEstatusComprobante(response.data.estatus || "Pendiente");
      } catch (error) {
        setComprobanteExiste(false);
        setEstatusComprobante("Pendiente");
      }
    };
    fetchComprobanteYEstado();
  }, [matricula, archivoSubido]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setArchivo(file);
      setArchivoURL(URL.createObjectURL(file));
    } else {
      alert("Por favor, selecciona un archivo PDF válido.");
    }
  };

  const handleSubirComprobante = async () => {
    if (!archivo) return;

    const nombreArchivo = `Pago_${matricula}.pdf`;
    const archivoRenombrado = new File([archivo], nombreArchivo, { type: archivo.type });

    const formData = new FormData();
    formData.append('comprobante', archivoRenombrado);

    try {
      await apiClient.post(
        `${API_URL}/api/alumnos/subir-comprobante/${matricula}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setArchivoSubido(true);
      toast.success("El comprobante de pago se ha subido correctamente.");
      setArchivo(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al subir el comprobante.";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  };

  // Solo mostrar controles de subida si no hay comprobante o si está rechazado
  const mostrarControlesSubida = !comprobanteExiste || estatusComprobante === "Rechazado";

  return (
    <div className="validacion-layout">
      <ToastContainer />
      <div className="validacion-container">
        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <h2>Validación de horario</h2>
        <h4><strong>{nombreAlumno || "Cargando..."}</strong></h4>
        <h4>Matricula: <strong>{matricula || "Cargando..."}</strong></h4>

        {estatusHorario === 0 ? (
          <>
            <p>Tu horario está en proceso de validación por parte del tutor. Una vez validado y subiendo tu comprobante de pago, podrás descargar tu horario para poder continuar con tu proceso.</p>
            <div className="same-line">
              <h3 className="center-text">Estatus de horario: En proceso</h3>
            </div>
          </>
        ) : (
          <>
            <p>Tu horario ha sido validado. Ahora puedes subir tu comprobante de pago para finalizar el proceso.</p>
            <div className="same-line">
              <h3 className="center-text">Estatus de horario: Validado</h3>
            </div>
            {comprobanteHabilitado && (
            <div className="validacion-buttons">
              {/* Mostrar link y estatus si existe comprobante */}
              {comprobanteExiste && (
                <div className="file-upload-container" style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: 10 }}>
                  <a
                    href={`${API_URL}/uploads/comprobantes/Pago_${matricula}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver comprobante de pago"
                    style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "#1976d2" }}
                  >
                    <svg width="32" height="32" fill="#1976d2" viewBox="0 0 24 24">
                      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z"/>
                    </svg>
                    <span style={{ marginLeft: 8 }}>Ver comprobante</span>
                  </a>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#000", fontWeight: "bold" }}>Estatus:</span>
                    <span style={{
                      fontWeight: "bold",
                      color:
                        estatusComprobante === "Rechazado" ? "red" :
                        estatusComprobante === "Pendiente" ? "orange" :
                        estatusComprobante === "Revisado" || estatusComprobante === "Aceptado" ? "green" : "#BDBDBD"
                    }}>
                      {estatusComprobante}
                    </span>
                  </div>
                </div>
              )}

              {/* Mostrar controles solo si NO hay comprobante o si está rechazado */}
              {mostrarControlesSubida && (
                <>
                  <div className="file-upload-container">
                    <label htmlFor="archivo" className="button-validar">
                      Subir archivo
                    </label>
                    <input
                      id="archivo"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    <span className="archivo-mensaje">{archivo ? archivo.name : "Ningún archivo seleccionado"}</span>
                  </div>
                  <div className="validacion-buttons">
                    <button
                      className="button"
                      onClick={handleSubirComprobante}
                      disabled={!archivo}
                    >
                      Subir comprobante de pago
                    </button>
                  </div>
                </>
              )}
            </div>
            )}
                {/* Si comprobante está deshabilitado, solo muestra el estado del horario */}
                {!comprobanteHabilitado && (
                  <div style={{ color: "#888", marginTop: 8 }}>
                    El comprobante de pago no es requerido para tu carrera.
                  </div>
                )}
            {/* Mensaje informativo si no puede subir */}
            {!mostrarControlesSubida && (
              <div style={{ color: "#888", marginTop: 8 }}>
                Ya has subido un comprobante de pago. Espera a que sea validado por tu tutor.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Validacion2;