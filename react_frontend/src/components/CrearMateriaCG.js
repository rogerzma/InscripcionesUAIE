import React, { useState, useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from '../utils/axiosConfig'; // Importar la configuración de axios
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CrearMateria.css";

function CrearMateriaCG() {
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const token = localStorage.getItem("token");
  const [mostrarCarrera, setMostrarCarrera] = useState(false);
  const [file, setFile] = useState(null); // Almacenar el archivo CSV
  const API_URL = process.env.REACT_APP_API_URL; // Asegúrate de que esta variable esté definida en tu entorno
  const [formData, setFormData] = useState({
      id_materia: '',
      id_carrera: '',
      nombre: '',
      horarios: {
        lunes: '',
        martes: '',
        miercoles: '',
        jueves: '',
        viernes: '',
        sabado: '' // Agregar sábado para materias semiescolarizadas
      },
      semi: '', // Agregar campo para paridad
      salon: '',
      grupo: '',
      cupo: '',
      laboratorio: false,
      docente: '' // Aquí puedes colocar el ObjectId del docente si es necesario
    });

    // Dentro del componente CrearMateria
    const [docentes, setDocentes] = useState([]);
    
    
  const carrerasPermitidas = {
    ISftw: "Ing. en Software",
    IDsr: "Ing. en Desarrollo",
    IEInd: "Ing. Electrónica Industrial",
    ICmp: "Ing. Computación",
    IRMca: "Ing. Robótica y Mecatrónica",
    IElec: "Ing. Electricista",
    ISftwS: "Ing. en Software (Semiescolarizado)",
    IDsrS: "Ing. en Desarrollo (Semiescolarizado)",
    IEIndS: "Ing. Electrónica Industrial(Semiescolarizado)",
    ICmpS: "Ing. Computación (Semiescolarizado)",
    IRMcaS: "Ing. Robótica y Mecatrónica (Semiescolarizado)",
    IElecS: "Ing. Electricista (Semiescolarizado)",
  };

  const carrerasPermitidasSemiescolarizadas = ['ISftwS', 'IDsrS', 'IEIndS', 'ICmpS', 'IRMcaS', 'IElecS'];


    useEffect(() => {
      const fetchDocentes = async () => {
        try {
          const response = await apiClient.get(`${API_URL}/api/docentes`); 
          setDocentes(response.data); // Guardamos la lista de docentes con el nombre incluido
        } catch (error) {
          console.error("Error al obtener los docentes:", error);
        }
      };
    
      fetchDocentes();
    }, []);


    const handleFileChange = (e) => {
      setFile(e.target.files[0]); // Guarda el archivo CSV seleccionado
    };
    
    const handleSubmitCSV = async (e) => {
      e.preventDefault();
      if (!file) {
        alert("Por favor selecciona un archivo CSV");
        return;
      }
    
      const formData = new FormData();
      formData.append("csv", file);
    
      try {
        await apiClient.post(
          `${API_URL}/api/materias/subir-csv`, // Cambiar la URL a 'materias'
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
    
        toast.success("Base de datos de materias actualizada con éxito desde el archivo CSV");
        setMostrarModal(false);
      } catch (error) {
        console.error("Error al subir el archivo CSV:", error);
        const errorMessage = error.response?.data?.message || "Hubo un error al actualizar la base de datos";
        toast.error(errorMessage);
      }
    };
    
    const handleDownloadCSV = async () => {
      try {
        const response = await apiClient.get(
          `${API_URL}/api/materias/exportar-csv`, // Cambiar la URL a 'materias'
          { responseType: "blob" }
        );
    
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "materias.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error("Error al descargar el archivo CSV:", error);
        toast.error("No se pudo descargar el archivo");
      }
    };
    
      

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userType");
    navigate("/");
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
  
    if (["lunes", "martes", "miercoles", "jueves", "viernes","sabado"].includes(id)) {
      // Si el cambio es en los horarios, actualiza solo esa clave dentro de horarios
      setFormData((prevState) => ({
        ...prevState,
        horarios: {
          ...prevState.horarios,
          [id]: value, // Actualiza el día correspondiente
        },
      }));
    } else {
      // Si es otro campo, actualiza normalmente
      setFormData((prevState) => ({
        ...prevState,
        [id]: value,
      }));
    }
  };
  
  const handleBack = () => { 
    navigate(-1); // Navegar a la página anterior 
    }


    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validar campos requeridos
      if (!formData.id_materia || !formData.id_materia.trim()) {
        toast.error("Falta el campo: ID de materia");
        return;
      }
      
      if (!formData.nombre || !formData.nombre.trim()) {
        toast.error("Falta el campo: Nombre de la materia");
        return;
      }
      
      if (!formData.id_carrera) {
        toast.error("Falta el campo: Carrera");
        return;
      }
      
      if (!formData.salon || !formData.salon.trim()) {
        toast.error("Falta el campo: Salón");
        return;
      }
      
      if (!formData.grupo || !formData.grupo.trim()) {
        toast.error("Falta el campo: Grupo");
        return;
      }
      
      if (!formData.cupo || formData.cupo === '') {
        toast.error("Falta el campo: Cupo");
        return;
      }
      
      if (!formData.docente) {
        toast.error("Falta el campo: Docente");
        return;
      }
      
      try {
        const { id_carrera } = formData;
        if (!id_carrera) {
          toast.error("Error: No se encontró el ID de la carrera.");
          return;
        }

        const finalData = {
          ...formData,
          id_carrera,
          horarios: Object.fromEntries(
            Object.entries(formData.horarios).map(([key, value]) => [key, value === "" ? null : value])
          )
        };

        if (id_carrera === "ISftwS" || id_carrera === "IDsrS" || id_carrera === "IEIndS" || id_carrera === "ICmpS" || id_carrera === "IRMcaS" || id_carrera === "IElecS") {
          const response = await apiClient.post(`${API_URL}/api/materias`, finalData);
          toast.success('Materia creada con éxito');
          setFormData({
            id_materia: '',
            id_carrera: '',
            nombre: '',
            horarios: { sabado: '' },
            salon: '',
            grupo: '',
            cupo: '',
            laboratorio: false,
            docente: ''
          });
        } else {
          const response = await apiClient.post(`${API_URL}/api/materias`, finalData);
          toast.success('Materia creada con éxito');
          setFormData({
            id_materia: '',
            id_carrera: '',
            nombre: '',
            horarios: { lunes: '', martes: '', miercoles: '', jueves: '', viernes: '' },
            salon: '',
            grupo: '',
            cupo: '',
            laboratorio: '',
            docente: ''
          });
          setTimeout(() => {
            navigate("/coord-gen/materias", { state: { reload: true } });
          }, 200);  // Espera un poco para mostrar el toast antes de recargar
        }
      } catch (error) {
        console.error('Error al crear la materia:', error.response?.data || error.message);
        toast.error(error.response?.data?.message || 'Hubo un error al crear la materia');
      }
    };
    
    const isSemiescolarizada = carrerasPermitidasSemiescolarizadas.includes(formData.id_carrera);

  return (
    <div className="materia-layout">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="materia-container">
          <button className="back-button" onClick={handleBack}>Regresar</button> 
      <div className="top-right"> 
          <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button> 
        </div>
        <h1>Agregar materia</h1>
        <div className="materia-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
            <div className="input-wrapper short-field">
                <label htmlFor="id_materia">ID de materia</label>
                <input
                  type="text"
                  id="id_materia"
                  placeholder="ID de la materia"
                  value={formData.id_materia}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  placeholder="Nombre de la materia"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="salon">Salón</label>
                <input
                  type="text"
                  id="salon"
                  placeholder="Ingresar el salón"
                  value={formData.salon}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <div className="input-wrapper short-field">
                <label htmlFor="cupo">Cupo</label>
                <input
                  type="text"
                  id="cupo"
                  placeholder="Cupo de materia"
                  value={formData.cupo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field">
                <label htmlFor="grupo">Grupo</label>
                <input
                  type="text"
                  id="grupo"
                  placeholder="Grupo"
                  value={formData.grupo}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-wrapper short-field2">
                <label htmlFor="docente">Docente</label>
                <select id="docente" value={formData.docente} onChange={handleChange} required>
                  <option value="" disabled hidden>Seleccione un docente</option>
                  {docentes.map(docente => (
                    <option key={docente.personalMatricula} value={docente.personalMatricula}>
                      {docente.nombre}  {/* Mostramos nombre + matrícula */}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-wrapper short-field3">
                <label htmlFor="laboratorio">Laboratorio</label>
                <select id="laboratorio" value={formData.laboratorio || "false"} onChange={handleChange} required>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
            <div className="form-group">
        {!isSemiescolarizada && (
            <>
                <div className="input-wrapper short-field">
                    <label htmlFor="lunes">Lunes</label>
                    <select id="lunes" value={formData.horarios.lunes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="martes">Martes</label>
                    <select id="martes" value={formData.horarios.martes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="miercoles">Miércoles</label>
                    <select id="miercoles" value={formData.horarios.miercoles} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="jueves">Jueves</label>
                    <select id="jueves" value={formData.horarios.jueves} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>

                <div className="input-wrapper short-field">
                    <label htmlFor="viernes">Viernes</label>
                    <select id="viernes" value={formData.horarios.viernes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:30-9:30">7:30-9:30</option>
                       <option value="10:00-12:00">10:00-12:00</option>
                       <option value="12:00-14:00">12:00-14:00</option>
                       <option value="14:00-16:00">14:00-16:00</option>
                       <option value="16:00-18:00">16:00-18:00</option>
                       <option value="18:00-20:00">18:00-20:00</option>
               </select>
                </div>
            </>
        )}

        {isSemiescolarizada && (

          <>
             <div className="input-wrapper short-field">
                    <label htmlFor="viernes">Viernes</label>
                    <select id="viernes" value={formData.horarios.viernes} onChange={handleChange}>
                        <option value="" disabled hidden>Seleccione...</option>
                   <option value="">-</option>
                       <option value="7:00-14:00">7:00-14:00</option>
                       <option value="7:00-15:00">7:00-15:00</option>
                       <option value="14:00-20:00">14:00-20:00</option>
                       <option value="14:00-21:00">14:00-21:00</option>
                       <option value="15:00-20:00">15:00-20:00</option>
                       <option value="15:00-21:00">15:00-21:00</option>
               </select>
                </div>
            <div className="input-wrapper short-field">
                <label htmlFor="sabado">Sábado</label>
                <select id="sabado" value={formData.horarios.sabado} onChange={handleChange}>
                    <option value="" disabled hidden>Seleccione...</option>
                    <option value="">-</option>
                       <option value="7:00-14:00">7:00-14:00</option>
                       <option value="7:00-15:00">7:00-15:00</option>
                       <option value="14:00-20:00">14:00-20:00</option>
                       <option value="14:00-21:00">14:00-21:00</option>
                       <option value="15:00-20:00">15:00-20:00</option>
                       <option value="15:00-21:00">15:00-21:00</option>
                </select>
            </div>

            <div className="input-wrapper short-field">
              <label htmlFor="semi">Par-Impar</label>
                <select id="semi" value={formData.semi} onChange={handleChange} required>
                  <option value="" disabled hidden>Seleccione paridad</option>
                  <option value="par">Par</option>
                  <option value="impar">Impar</option>
                </select>
            </div>

            </>
        )}

        <div className="input-wrapper short-field2">
            <label htmlFor="id_carrera">Carrera</label>
            <select id="id_carrera" value={formData.id_carrera} onChange={handleChange} required>
                <option value="" disabled hidden>Seleccione una carrera</option>
                {Object.entries(carrerasPermitidas).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                ))}
            </select>
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
            <div className="materia-buttons">
              <button type="submit" className="button">Agregar</button>
              <button className="button" onClick={() => setMostrarModal(true)}>Subir base de datos de materias</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CrearMateriaCG;
