require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 12000;

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// OpenWeatherMap API key from environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Routes
app.get('/', (req, res) => {
  res.render('index', { weather: null, error: null });
});

app.post('/weather', async (req, res) => {
  try {
    const { resort } = req.body;
    
    if (!resort) {
      return res.render('index', { 
        weather: null, 
        error: 'Please enter a ski resort name' 
      });
    }
    
    // Add "ski resort" to the search query if not already included
    const searchQuery = resort.toLowerCase().includes('ski') || 
                        resort.toLowerCase().includes('resort') ? 
                        resort : `${resort} ski resort`;

    // First, get coordinates for the resort using geocoding API
    const geoResponse = await axios.get(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(searchQuery)}&limit=1&appid=${WEATHER_API_KEY}`
    );

    if (!geoResponse.data || geoResponse.data.length === 0) {
      return res.render('index', { 
        weather: null, 
        error: 'Ski resort not found. Please try another location.' 
      });
    }

    const { lat, lon } = geoResponse.data[0];
    
    // Get 7-day weather forecast
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${WEATHER_API_KEY}`
    );

    const weatherData = weatherResponse.data;
    const dailyForecast = weatherData.daily.slice(0, 7); // Get 7 days of forecast
    
    // Analyze snow conditions
    const snowAnalysis = analyzeSnowConditions(dailyForecast);

    res.render('index', {
      weather: {
        resort: resort,
        current: weatherData.current,
        daily: dailyForecast,
        snowAnalysis: snowAnalysis
      },
      error: null
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.render('index', { 
      weather: null, 
      error: 'Error fetching weather data. Please try again later.' 
    });
  }
});

// Function to analyze snow conditions based on weather forecast
function analyzeSnowConditions(dailyForecast) {
  let totalSnow = 0;
  let snowDays = 0;
  let lowestTemp = 100;
  let highestTemp = -100;
  
  dailyForecast.forEach(day => {
    // Check for snow (precipitation when temp is near or below freezing)
    const hasSnow = day.snow || (day.weather[0].main === 'Snow');
    const snowAmount = day.snow ? day.snow : 0;
    
    if (hasSnow) {
      snowDays++;
      totalSnow += snowAmount;
    }
    
    // Track temperature range
    if (day.temp.min < lowestTemp) lowestTemp = day.temp.min;
    if (day.temp.max > highestTemp) highestTemp = day.temp.max;
  });
  
  // Generate analysis
  let analysis = '';
  
  if (snowDays >= 3) {
    analysis = 'Great news! Fresh powder expected with multiple snow days in the forecast.';
  } else if (snowDays > 0) {
    analysis = `Some fresh snow expected with ${snowDays} snow day(s) in the forecast.`;
  } else if (lowestTemp < 0) {
    analysis = 'No fresh snow expected, but temperatures will be cold enough to preserve existing snow.';
  } else if (lowestTemp < 5) {
    analysis = 'No fresh snow expected. Cool temperatures may help maintain snow conditions.';
  } else {
    analysis = 'No fresh snow expected and temperatures are relatively warm. Snow conditions may deteriorate.';
  }
  
  return {
    snowDays,
    totalSnow,
    lowestTemp,
    highestTemp,
    analysis
  };
}

// Check if API key is set
if (!WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key_here') {
  console.warn('\x1b[33m%s\x1b[0m', 'Warning: OpenWeatherMap API key is not set or is using the default value.');
  console.warn('\x1b[33m%s\x1b[0m', 'Please set a valid API key in the .env file or as an environment variable.');
  console.warn('\x1b[33m%s\x1b[0m', 'You can get a free API key by signing up at https://openweathermap.org/api');
  console.warn('\x1b[33m%s\x1b[0m', 'The application will still run, but weather data requests will fail.');
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Also accessible at https://work-1-ouaozggwjxpugtrn.prod-runtime.all-hands.dev`);
});