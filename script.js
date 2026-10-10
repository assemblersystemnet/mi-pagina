// Configuración de la API de OpenWeatherMap (Tu clave ya validada)
const API_KEY = '6a88db408312446d38614b7874884c84'; 

// Elementos del DOM
const locationTxt = document.getElementById('location');
const temperatureTxt = document.getElementById('temperature');
const descriptionTxt = document.getElementById('description');

// 1. Solicitar geolocalización al cargar la página
window.addEventListener('load', () => {
    if (navigator.geolocation) {
        // Opción de configuración para forzar una respuesta rápida del GPS
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    } else {
        locationTxt.innerText = "Tu navegador no soporta geolocalización";
    }
});

// 2. Si el usuario acepta compartir su ubicación de manera exitosa
function onSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    // URL usando concatenación tradicional (comillas simples y signo de más)
    const url = 'https://openweathermap.org' + latitude + '&lon=' + longitude + '&units=metric&lang=es&appid=' + API_KEY;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Error HTTP: ' + response.status);
            return response.json();
        })
        .then(data => displayWeather(data))
        .catch(err => {
            locationTxt.innerText = "Error al conectar con el servicio";
            console.error("Detalles del error de red o API:", err);
        });
}


// 3. Si el usuario rechaza el permiso o el dispositivo no puede obtener las coordenadas
function onError(error) {
    console.error("Código de error de geolocalización:", error.code, error.message);
    locationTxt.innerText = "Permiso denegado o error de GPS";
    descriptionTxt.innerText = "Asegúrate de permitir el acceso a la ubicación en tu navegador para ver tu clima.";
}

// 4. Renderizar de forma correcta los datos en la tarjeta HTML
function displayWeather(data) {
    const city = data.name;
    const country = data.sys.country;
    const temp = Math.round(data.main.temp);
    
    // Accedemos al primer elemento del arreglo 'weather[0]'
    const desc = data.weather[0].description; 

    locationTxt.innerText = `${city}, ${country}`;
    temperatureTxt.innerText = `${temp}°C`; // Agregada la unidad de medida visual
    descriptionTxt.innerText = desc.charAt(0).toUpperCase() + desc.slice(1); // Capitaliza la primera letra
}
