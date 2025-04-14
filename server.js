require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));

// Weather endpoint
app.get('/weather', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) return res.status(400).json({ error: 'City required' });
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        
        res.json({
            city: response.data.name,
            temp: Math.round(response.data.main.temp),
            feels_like: Math.round(response.data.main.feels_like),
            humidity: response.data.main.humidity,
            wind: response.data.wind.speed,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        });
    } catch (error) {
        console.error('SERVER ERROR:', error.response?.data || error.message);
        res.status(500).json({ 
            error: error.response?.data?.message || 'Failed to get weather data' 
        });
    }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));