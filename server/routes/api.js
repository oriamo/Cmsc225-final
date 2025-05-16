const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

// Using OpenLibrary API for book searches
router.get('/books', async (req, res) => {
  try {
    const query = req.query.q || 'javascript';
    console.log('OpenLibrary API Query:', query, "URL:", `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const response = await axios.get(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`, {
      timeout: 5000 // 5 second timeout
    });
    res.json(response.data);
  } catch (error) {
    console.error('OpenLibrary API Error:', error);
    res.status(500).json({ 
      message: 'Error fetching from OpenLibrary API',
      error: error.message 
    });
  }
});

// Using OpenWeatherMap API for weather data
router.get('/weather', async (req, res) => {
  try {
    // Default to a location if geolocation isn't available
    const city = 'College Park'; // Default to College Park, MD as a fallback
    
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('Weather API key is not configured');
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`,
      { timeout: 5000 }
    );
    
    const weatherData = {
      temperature: Math.round(response.data.main.temp),
      description: response.data.weather[0].description,
      icon: response.data.weather[0].icon,
      location: response.data.name
    };
    
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API Error:', error);
    res.status(500).json({ 
      message: 'Error fetching weather data',
      error: error.message 
    });
  }
});

module.exports = router;