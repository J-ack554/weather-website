require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
            country: response.data.sys.country,
            temp: Math.round(response.data.main.temp),
            feels_like: Math.round(response.data.main.feels_like),
            humidity: response.data.main.humidity,
            pressure: response.data.main.pressure,
            wind: response.data.wind.speed,
            description: response.data.weather[0].description,
            icon: response.data.weather[0].icon
        });
    } catch (error) {
        console.error('SERVER ERROR:', error.response?.data || error.message);
        
        // Better error handling with specific messages
        if (error.response?.status === 404) {
            return res.status(404).json({ error: 'City not found. Please check the spelling and try again.' });
        }
        
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'API key error. Please check your OpenWeatherMap API key.' });
        }
        
        res.status(500).json({ 
            error: error.response?.data?.message || 'Failed to get weather data. Please try again later.' 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`✨ Server running on http://localhost:${port}`);
    console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
});

// Handle termination gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});