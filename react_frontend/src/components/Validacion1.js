import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

import "./Validacion1.css";

function Validacion1() {
  const location = useLocation();
  const navigate = useNavigate();
  const tutor = localStorage.getItem("matricula") || "Tutor desconocido";
  const [nombre, setNombreAlumno] = useState(localStorage.getItem("nombreAlumno") || "Alumno desconocido");
  const id = localStorage.getItem("id") || "ID desconocido";
  const [idAlumno, setIDAlumno] = useState(localStorage.getItem("IDAlumno") || "ID de alumno desconocido");
  const [id_carrera, setIDCarrera] = useState(localStorage.getItem("id_carrera") || "ID de carrera desconocido");
  const [matricula, setMatricula] = useState(localStorage.getItem("matricula")); // Obtener matrícula del localStorage
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const token = localStorage.getItem("token");
  const { materiasSeleccionadas = [] } = location.state || {};
  const carrerasPermitidasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];

  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de tener configurada la URL base en tu .env
  
  useEffect(() => {
    const fetchAlumnoData = async () => {
      const id = location.state?.id || localStorage.getItem("id");
      if (!id) {
        toast.error("No se encontró el ID del alumno.");
        return;
      }

      try {
        const response = await apiClient.get(
          `${API_URL}/api/alumnos/${id}`
        );
        const { _id, nombre, correo, telefono } = response.data;
        setNombreAlumno(nombre);
        setEmail(correo);
        setPhone(telefono);
        if (_id) {
          localStorage.setItem("IDAlumno", _id);
        } else {
          console.error("Error: El ID del alumno no está en la respuesta del backend.");
        }

        // Guardamos el ID del alumno en localStorage
        localStorage.setItem("IDAlumno", _id);
      } catch (error) {
        console.error("Error al obtener los datos del alumno:", error);
        const errorMessage = error.response?.data?.message || "Error al obtener los datos del alumno.";
        toast.error(errorMessage);
      }
    };

    fetchAlumnoData();
  }, [location.state]);

  useEffect(() => {
    if (location.state?.nombre) {
      setNombreAlumno(location.state.nombre);
      localStorage.setItem("nombreAlumno", location.state.nombre);
    }
    if (location.state?.id) {
      setIDAlumno(location.state.id);
      localStorage.setItem("IDAlumno", location.state.id);
    }
  }, [location.state]);

  // Función de validación
  const validarCampos = () => {
    let esValido = true;

    if (!email) {
      toast.error("El correo es obligatorio.");
      esValido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("El correo no tiene un formato válido.");
      esValido = false;
    }

    if (!phone) {
      toast.error("El teléfono es obligatorio.");
      esValido = false;
    } else if (!/^\d{10}$/.test(phone)) {
      toast.error("El teléfono debe tener 10 dígitos.");
      esValido = false;
    }

    return esValido;
  };

  const handleContinuarValidacion = async () => {
    if (!validarCampos()) return;

    const id = location.state?.id || localStorage.getItem("IDAlumno");
    if (!id) {
      toast.error("No se encontró el ID del alumno.");
      return;
    }

    try {
      // Actualizar los datos del alumno
      await apiClient.put(`${API_URL}/api/alumnos/horario/${id}`, {
        nombre: nombre,
        correo: email,
        telefono: phone,
        materiasSeleccionadas: materiasSeleccionadas,
        tutor: null // Enviar las materias seleccionadas
      });
      toast.success("Datos actualizados correctamente.");
      navigate("/validacion-estatus");
    } catch (error) {
      console.error("Error al actualizar los datos del alumno:", error, id);
      const errorMessage = error.response?.data?.message || "Error al actualizar los datos del alumno.";
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleBack = () => {
    navigate("/horario-seleccion", { state: { nombre, id, id_carrera } });
  };

  const isSemiescolarizada = carrerasPermitidasSemiescolarizadas.includes(id_carrera);

  return (
    <div className="horario-layout">
      <ToastContainer />
      <div className="horario-container">
          <button className="back-button" onClick={handleBack}>
            Regresar
          </button>
        <div className="top-right">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
        <h2>Verificación de horario</h2>
        <p>
          Bienvenido(a): <strong>{nombre || "Cargando..."}</strong>
        </p>
        <p>Verifique que las materias seleccionadas estén correctas.</p>
        <p>
          Una vez finalizado el proceso, no se podrán agregar ni quitar
          materias.
        </p>

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
              {materiasSeleccionadas.map((materia, index) => (
                <tr key={index}>
                  <td>{materia.grupo}</td>
                  <td>{materia.salon}</td>
                  <td>{materia.nombre}</td>
                  <td>{materia.horarios.lunes || "—"}</td>
                  <td>{materia.horarios.martes || "—"}</td>
                  <td>{materia.horarios.miercoles || "—"}</td>
                  <td>{materia.horarios.jueves || "—"}</td>
                  <td>{materia.horarios.viernes || "—"}</td>
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
                <th>Sábado</th>
              </tr>
            </thead>
            <tbody>
              {materiasSeleccionadas.map((materia, index) => (
                <tr key={index}>
                  <td>{materia.grupo}</td>
                  <td>{materia.salon}</td>
                  <td>{materia.nombre}</td>
                  <td>{materia.semi || "—"}</td>
                  <td>{materia.horarios.viernes || "—"}</td>
                  <td>{materia.horarios.sabado || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </>
        )}

        </div>
          <div className="form-group">
            <div className="form-item">
              <label htmlFor="email">Correo electrónico:</label>
              <input
                type="email"
                id="email"
                placeholder="alguien@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-item">
              <label htmlFor="phone">Teléfono:</label>
              <input
                type="tel"
                id="phone"
                placeholder="000-000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>


        <div className="horario-buttons">
          <button className="button" onClick={handleContinuarValidacion}>
            Inscribir materias
          </button>
        </div>
      </div>
    </div>
  );
}

export default Validacion1;