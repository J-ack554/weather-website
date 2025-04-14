async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return alert('Please enter a city');
    
    try {
        const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();
        
        if (data.error) throw new Error(data.error);
        
        document.getElementById('weatherInfo').innerHTML = `
            <h2>${data.city}</h2>
            <img src="https://openweathermap.org/img/wn/${data.icon}.png">
            <div>${data.temp}°C</div>
            <div>Feels like: ${data.feels_like}°C</div>
            <div>Humidity: ${data.humidity}%</div>
            <div>Wind: ${data.wind} m/s</div>
            <div>${data.description}</div>
        `;
    } catch (error) {
        document.getElementById('weatherInfo').innerHTML = `
            <div style="color:red">Error: ${error.message}</div>
        `;
    }
}

document.getElementById('getWeather').addEventListener('click', getWeather);