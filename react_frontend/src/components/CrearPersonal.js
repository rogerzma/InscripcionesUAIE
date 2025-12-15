import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import "react-toastify/dist/ReactToastify.css";
import "./CrearPersonal.css";

function CrearPersonal() {
  const [mostrarModal, setMostrarModal] = useState(false); // Controlar el modal
  const [file, setFile] = useState(null); // Almacenar el archivo CSV
  const [form, setForm] = useState({
    nombre: "",
    matricula: "",
    correo: "",
    telefono: "",
    roles: [],
    password: ""
  });
  const id_carrera = localStorage.getItem("id_carrera");
  const token = localStorage.getItem("token");
  const matriculaCoord = localStorage.getItem("matricula");
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de que esta variable esté definida en tu entorno

  const navigate = useNavigate();

  const validarMatricula = (matricula) => {
    return /^(CG|AG)?[A-Z]\d{4}$/.test(matricula); 
  };

  const validarPassword = (password) => {
    // Mínimo 8 caracteres y al menos un carácter especial
    const tieneMinimo8 = password.length >= 8;
    const tieneCaracterEspecial = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/~`]/.test(password);
    return tieneMinimo8 && tieneCaracterEspecial;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
  
    if (id === "roles") {
      let prefix = "";
      switch (value) {
        case "D":
          prefix = "P"; // Docente
          break;
        case "T":
          prefix = "T"; // Tutor
          break;
        case "C":
          prefix = "C"; // Coordinador
          break;
        case "A":
          prefix = "A"; // Administrador
          break;
        default:
          prefix = "";
      }  //message
      
      setForm((prevState) => ({
        ...prevState,
        roles: value,
        matricula: prefix // Reiniciar matrícula al cambiar de rol
      }));
    } else if (id === "matricula") {
      // Permitir solo 4 cifras y concatenar con la letra del rol
      const numbersOnly = value.replace(/\D/g, "").slice(0, 4);
      setForm((prevState) => ({
        ...prevState,
        matricula: prevState.matricula.charAt(0) + numbersOnly
      }));
    } else {
      setForm((prevState) => ({
        ...prevState,
        [id]: value
      }));
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!form.nombre || !form.nombre.trim()) {
      toast.error("Falta el campo: Nombre");
      return;
    }
    
    if (!form.matricula || !form.matricula.trim()) {
      toast.error("Falta el campo: ID del usuario");
      return;
    }
    
    if (!validarMatricula(form.matricula)) {
      toast.error("El ID del usuario no tiene el formato correcto");
      return;
    }
    
    if (!form.correo || !form.correo.trim()) {
      toast.error("Falta el campo: Correo electrónico");
      return;
    }
    
    if (!form.telefono || !form.telefono.trim()) {
      toast.error("Falta el campo: Teléfono");
      return;
    }
    
    if (!form.roles || (Array.isArray(form.roles) && form.roles.length === 0)) {
      toast.error("Falta el campo: Permisos");
      return;
    }
    
    if (!form.password || !form.password.trim()) {
      toast.error("Falta el campo: Contraseña");
      return;
    }
    
    // Validar contraseña
    if (!validarPassword(form.password)) {
      toast.error("La contraseña debe tener mínimo 8 caracteres y al menos un carácter especial (!@#$%^&*...)");
      return;
    }
    
    try {
      const formData = { ...form, id_carrera };
      const response = await apiClient.post(`${API_URL}/api/personal`, formData);
      setForm({ nombre: "", matricula: "", correo: "", telefono: "", roles: "", password: "" });
      setTimeout(() => {
        navigate("/coordinador/personal", { state: { reload: true } });
      }, 200); // Espera un poco para mostrar el toast antes de recargar
    } catch (error) {
      console.error("Error al agregar el usuario:", error);
      
      // Verifica si el error es por matrícula duplicada
      if (
        error.response &&
        (
          error.response.data?.message === "Error de duplicado" ||
          error.response.data?.duplicado === "matricula" ||
          error.response.data?.error?.code === 11000
        )
      ) {
        toast.error("La matrícula ingresada ya existe en el sistema");
      } else {
        // Usar directamente el mensaje del servidor que ahora es específico
        const errorMessage = error.response?.data?.message || "Hubo un error al agregar el usuario";
        toast.error(errorMessage);
      }
    }
  };

  const handleBack = () => { 
    navigate(-1); // Navegar a la página anterior 
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  };

  //CSV
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Guarda el archivo CSV seleccionado
  };
  
  const handleSubmitCSV = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Por favor selecciona un archivo CSV.");
      return;
    }
  
    const id_carrera = localStorage.getItem("id_carrera");
    if (!id_carrera) {
      toast.error("ID de carrera no encontrado.");
      return;
    }
  
    const formData = new FormData();
    formData.append("csv", file);
  
    try {
      await apiClient.post(
        `${API_URL}/api/personal/subir-csv/carrera/${id_carrera}`, // ✅ Ahora se pasa en la URL
        formData,
        { headers: { "Content-Type": "multipart/form-data", 
          "x-matricula-coordinador": matriculaCoord  // ✅ enviar matrícula del coordinador
        } }
      );
  
      toast.success("Base de datos actualizada con éxito desde el archivo CSV");
      setMostrarModal(false);
    } catch (error) {
      console.error("Error al subir el archivo CSV:", error);
      const errorMessage = error.response?.data?.message || "Hubo un error al actualizar la base de datos";
      toast.error(errorMessage);
    }
  };


  const handleSumbitDB = async (e) => {
    setMostrarModal(true);
    return;
  };
  
  const handleDownloadCSV = async () => {
    const id_carrera = localStorage.getItem("id_carrera");
    if (!id_carrera) {
      toast.error("ID de carrera no encontrado.");
      return;
    }
  
    try {
      const response = await apiClient.get(
        `${API_URL}/api/personal/exportar-csv/carrera/${id_carrera}`,
        { responseType: "blob" } // Recibir como blob para descarga
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `personal_${id_carrera}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error al descargar el archivo CSV:", error);
      toast.error("No se pudo descargar el archivo.");
    }
  };
  

  return (
    <div className="persona1-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="persona1-container">
        <div className="top-left"> 
          <button className="back-button" onClick={handleBack}>Regresar</button> 
        </div>
        <div className="top-right"> 
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button> 
        </div>
        <h1>Agregar personal</h1>
        <div className="persona1-content">
          <p>Bienvenido </p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre del personal"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="matricula">ID del usuario</label>
                <input
                  type="text"
                  id="matricula"
                  placeholder="Seleccione un permiso e ingrese 4 cifras"
                  value={form.matricula}
                  onChange={handleChange}
                  maxLength={5} // Máximo 5 caracteres (1 letra + 4 cifras)
                  disabled={!form.roles} // Deshabilitado si no se ha elegido un rol
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  type="email"
                  id="correo"
                  placeholder="alguien@example.com"
                  value={form.correo}
                  onChange={handleChange}
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="telefono">Telefono</label>
                <input
                  type="text"
                  id="telefono"
                  placeholder="000-000-0000"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="roles">Permisos</label>
                <select id="roles" value={form.roles} onChange={handleChange} required>
                  <option value="" disabled hidden>Seleccione...</option>
                  <option value="D">Docente</option>
                  <option value="T">Tutor</option>
                  <option value="C">Coordinador</option>
                  <option value="A">Administrador</option>
                </select>
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Ingrese su contraseña"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="persona1-buttons">
            <button type="submit" disabled={!validarMatricula(form.matricula)}>Agregar</button>
            </div>
          </form>
            <div className="persona1-buttons">
              <button className="button" onClick={handleSumbitDB}>Subir base de datos de personal</button>
            </div>
        </div>
      </div>
      {mostrarModal && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Subir base de datos</h3>
                  <p>Seleccione el archivo a subir:</p>
                  <input type="file" accept=".csv" onChange={handleFileChange} />
                  <button onClick={handleSubmitCSV}>Subir CSV</button>
                  <button onClick={handleDownloadCSV}>Descargar CSV</button>
                  <button onClick={() => setMostrarModal(false)}>Cerrar</button>
                </div>
              </div>
            )}
    </div>
  );
}

export default CrearPersonal;