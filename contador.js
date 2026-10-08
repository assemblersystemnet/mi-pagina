// Espera a que todo el documento HTML esté completamente cargado en el navegador
document.addEventListener("DOMContentLoaded", () => {
    
    // Define el nombre único de tu sitio web para aislar tu contador de otros proyectos
    const MI_SITIO = "assembler-system-net-2026"; 
    
    // Define una clave única para guardar el tiempo de expiración en el localStorage del usuario
    const CLAVE_EXPIRACION = "expiracion_visita_" + MI_SITIO;

    // Obtiene la marca de tiempo actual del sistema en milisegundos
    const ahora = new Date().getTime();

    // Intenta leer si ya existe un tiempo de expiración guardado en la PC del usuario
    const tiempoExpiracionGuardado = localStorage.getItem(CLAVE_EXPIRACION);

    // Evalúa si el usuario se encuentra dentro del rango de bloqueo (1 hora de gracia)
    const estaBloqueado = tiempoExpiracionGuardado && ahora < parseInt(tiempoExpiracionGuardado);

    // Si está bloqueado (recargó la página antes de la hora), recuperamos el último número guardado
    if (estaBloqueado) {
        const visitasGuardadas = localStorage.getItem("ultimo_conteo_" + MI_SITIO);
        // Si hay un número guardado lo pinta de inmediato y detiene el script
        if (visitasGuardadas) {
            document.getElementById("numero-visitas").textContent = visitasGuardadas;
            return; // Detiene por completo la ejecución y evita llamar a la API
        }
    }
    // URL fija y real del nuevo servidor activo para SUMAR +1 visita
    const urlApi = "https://countapi.mileshilliard.com/api/v1/hit/" + MI_SITIO;

    // Realiza la petición de red HTTP hacia la API pública activa
    fetch(urlApi)
        .then(response => {
            // Verifica si la respuesta de red fue correcta (status 200)
            if (!response.ok) {
                throw new Error("Error en la respuesta del servidor");
            }
            // Transforma el cuerpo a formato JSON puro
            return response.json();
        })
        .then(res => {
            // Esta API devuelve el número entero directamente bajo la propiedad 'value'
            const visitas = res.value || 0;
            
            // Busca tu elemento HTML por su ID e introduce el número de visitas en pantalla
            document.getElementById("numero-visitas").textContent = visitas;
            
            // Guardamos el número actual localmente para recuperarlo en las recargas de esta hora
            localStorage.setItem("ultimo_conteo_" + MI_SITIO, visitas);
            
            // Define la duración del bloqueo en milisegundos (1 hora = 60 min * 60 seg * 1000 ms)
            const tiempoDuracion = 1 * 60 * 60 * 1000;
            const nuevaExpiracion = ahora + tiempoDuracion;
            
            // Almacena la marca de tiempo límite en el navegador del usuario
            localStorage.setItem(CLAVE_EXPIRACION, nuevaExpiracion.toString());
        })
        // Captura cualquier inconveniente en la petición de red
        .catch(error => {
            console.error("Hubo un problema con el contador:", error);
            // Muestra un mensaje en el HTML en lugar de dejar un espacio en blanco
            document.getElementById("numero-visitas").textContent = "Error";
        });
});
//RELOJ Y FECHA
function actualizarReloj() {
    const ahora = new Date();

    // 1. Formatear la Hora (HH:MM:SS)
    const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    document.getElementById('hora').textContent = ahora.toLocaleTimeString('es-MX', opcionesHora);

    // 2. Formatear la Fecha (ej. jueves, 1 de octubre de 2026)
    const opcionesFecha = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('fecha').textContent = ahora.toLocaleDateString('es-MX', opcionesFecha);
  }

  // Ejecutar inmediatamente y luego cada segundo
  actualizarReloj();
  setInterval(actualizarReloj, 1000);

    // LÓGICA DE PROGRAMACIÓN EN JAVASCRIPT
 function cargarClimaSeguro() {
    try {
      let lat = 16.7622;
      let lon = -93.3743;
      let ubicacionTexto = "Ocozocoautla, Chis.";

      // 1. Intentar obtener coordenadas reales del navegador (GPS)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            ejecutarPeticionClima(lat, lon, "Tu Ubicación Local");
          },
          (geoError) => {
            console.log("Permiso denegado o error de GPS. Usando Ocozocoautla.");
            ejecutarPeticionClima(lat, lon, ubicacionTexto);
          },
          { timeout: 4000 }
        );
      } else {
        ejecutarPeticionClima(lat, lon, ubicacionTexto);
      }
    } catch (error) {
      activarContingenciaVisual("Error general en el script inicial");
    }
}

// 2. PETICIÓN CON PASARELA INDEPENDIENTE (Evita intercepciones del Servidor Local)
function ejecutarPeticionClima(lat, lon, ubicacionTexto) {
    // Construimos la URL limpia hacia el servidor externo real
    const urlFinal = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code&timezone=auto&_nocache=" + Date.now();

    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlFinal, true);
    
    // Forzamos al navegador a tratar esto como una conexión externa e independiente
    xhr.setRequestHeader("Accept", "application/json");

    xhr.onload = function () {
        try {
            // Si tu servidor local interceptó la llamada devolviendo un HTML, la respuesta fallará aquí intencionalmente
            if (xhr.status >= 200 && xhr.status < 300) {
                const climaDatos = JSON.parse(xhr.responseText);
                
                if (!climaDatos || !climaDatos.current) {
                    throw new Error("Estructura de datos inválida");
                }

                const temperaturaActual = Math.round(climaDatos.current.temperature_2m); 
                const codigoClima = climaDatos.current.weather_code; 
                
                const diccionarioWMO = {
                    0: 'Despejado', 1: 'Mayormente Despejado', 2: 'Parcialmente Nublado', 3: 'Nublado',
                    45: 'Niebla', 48: 'Niebla con Escarcha', 51: 'Llovizna Ligera', 53: 'Llovizna',
                    55: 'Llovizna Densa', 61: 'Lluvia Débil', 63: 'Lluvia', 65: 'Lluvia Fuerte',
                    71: 'Nieve Ligera', 73: 'Nieve', 75: 'Nieve Intensa', 80: 'Chubascos de Lluvia',
                    81: 'Chubascos Fuertes', 95: 'Tormenta Eléctrica', 96: 'Tormenta con Granizo'
                };
                
                // 3. Insertar los textos dinámicos en las etiquetas HTML originales
                document.getElementById('ubicacion-nombre').textContent = ubicacionTexto;
                document.getElementById('clima-temp').textContent = temperaturaActual + "°C";
                document.getElementById('clima-desc').textContent = diccionarioWMO[codigoClima] || 'Templado';
                
                // 4. Clases HTML e iconos dinámicos para tus estilos animados CSS
                const contenedorIcono = document.getElementById('icono-animado');
                if (codigoClima === 0 || codigoClima === 1) {
                    contenedorIcono.className = "icono-sol"; contenedorIcono.innerHTML = ""; 
                } else if (codigoClima === 2 || codigoClima === 3 || codigoClima === 45 || codigoClima === 48) {
                    contenedorIcono.className = "icono-nube"; contenedorIcono.innerHTML = ""; 
                } else if (codigoClima >= 51 && codigoClima <= 81) {
                    contenedorIcono.className = "icono-lluvia"; contenedorIcono.innerHTML = "<div class='icono-lluvia-gotas'></div>"; 
                } else if (codigoClima === 95 || codigoClima === 96) {
                    contenedorIcono.className = "icono-tormenta"; contenedorIcono.innerHTML = "<div class='icono-rayo'></div>"; 
                } else {
                    contenedorIcono.className = "icono-nube"; contenedorIcono.innerHTML = "";
                }
            } else {
                throw new Error("HTTP Status Error: " + xhr.status);
            }
        } catch (e) {
            activarContingenciaVisual(e.message);
        }
    };

    xhr.onerror = function () {
        activarContingenciaVisual("Error de red o conexión bloqueada localmente");
    };

    xhr.send();
}

// 5. SISTEMA DE RESPALDO DE SEGURIDAD ESTABLECIDO
function activarContingenciaVisual(motivo) {
    console.warn("Contingencia activa (Evitando romper interfaz por restricción local):", motivo);
    document.getElementById('ubicacion-nombre').textContent = "Ocozocoautla, Chis.";
    document.getElementById('clima-temp').textContent = "22°C";
    document.getElementById('clima-desc').textContent = "Lluvia";
    
    const contenedorIcono = document.getElementById('icono-animado');
    contenedorIcono.className = "icono-lluvia";
    contenedorIcono.innerHTML = "<div class='icono-lluvia-gotas'></div>";
}

// Ejecución inicial automática y temporizador cada 15 minutos
cargarClimaSeguro(); 
setInterval(cargarClimaSeguro, 900000);
