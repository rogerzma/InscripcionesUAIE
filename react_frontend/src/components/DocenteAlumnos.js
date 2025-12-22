import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "./DocenteAlumnos.css";

function DocenteAlumnos() {
  const [alumnos, setAlumnos] = useState([]); // Definir el estado alumnos
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el filtro de búsqueda
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { nombre, matricula: matriculaDocente, materiaId, materiaNombre } = location.state || {};
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env
  
  // Guardar la matrícula del tutor en localStorage
  useEffect(() => {
    if (matriculaDocente) {
      localStorage.setItem("matriculaTutor", matriculaDocente);
    }
  }, [matriculaDocente]);

  // Obtener la matrícula del tutor desde localStorage si no está en location.state
  const storedMatriculaDocente = localStorage.getItem("matriculaDocente");

  useEffect(() => {
    const fetchAlumnos = async () => {
      try {
        if (!materiaId) {
          console.error("ID de la materia no encontrado");
          return;
        }
        // Obtener los alumnos de la materia
        const response = await fetch(`${API_URL}/api/docentes/materia/${materiaId}/alumnos`,
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
        // Ordenar los alumnos alfabéticamente por nombre (manejar array vacío)
        const alumnosOrdenados = (data.alumnos || []).sort((a, b) => a.nombre.localeCompare(b.nombre));
        setAlumnos(alumnosOrdenados);
      } catch (error) {
        console.error("Error al obtener los alumnos:", error);
      }
    };
  
    fetchAlumnos();
  }, [materiaId]);
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleDownloadCSV = (materiaNombre) => {
    if (alumnos.length === 0) return;
  
    const headers = ["Matrícula", "Nombre", "Teléfono"];
    // Asegurar que los datos estén ordenados antes de generar el CSV
    const alumnosOrdenados = [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre));
  
    const csvRows = [
      headers.join(","), 
      ...alumnosOrdenados.map(alumno => [alumno.matricula, alumno.nombre, alumno.telefono].join(","))
    ];
  
    const csvString = "\uFEFF" + csvRows.join("\n"); // Agregar BOM para compatibilidad con Excel
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
  
    const nombreArchivo = `${materiaNombre.replace(/\s+/g, "_")}.csv`; // Reemplaza espacios con guiones bajos
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  
  const handleBack = () => {
    navigate(-1, { state: { nombre, token, matricula: matriculaDocente || storedMatriculaDocente } });
  };

  // Filtrar alumnos por búsqueda
  const alumnosFiltrados = alumnos.filter(alumno => 
    alumno.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="docente-layout">
      <div className="docente-container">
          <button className="back-button" onClick={handleBack}>Regresar</button>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        <h2>Lista de alumnos de la materia</h2>
        <div className="docente-header">
          <h3>Docente: {`${nombre}`}</h3>
          <h3>Grupo: 1A</h3>
          <h3>Materia: {materiaNombre}</h3>
        </div>

          {/* Input de búsqueda */}
          <input
          type="text"
          placeholder="Buscar por matrícula o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

        {alumnosFiltrados.length > 0 ? (
        <div className="docente-content">
          <table className="docente-table-1">
            <thead>
              <tr>
                <th>Matricula</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Telefono</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((alumno) => (
                <tr key={alumno._id}>
                  <td>{alumno.matricula}</td>
                  <td>{alumno.nombre}</td>
                  <td>{alumno.correo}</td>
                  <td>{alumno.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-alumnos-message">No se encontraron resultados.</p>
      )}
        <div className="horario-buttons">
          <button className="button" onClick={() => handleDownloadCSV(materiaNombre)} disabled={alumnosFiltrados.length === 0}>
            Descargar lista de alumnos
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocenteAlumnos;