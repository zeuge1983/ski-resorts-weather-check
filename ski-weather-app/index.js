require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const mockData = require('./mockData');

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
  const { resort } = req.body;
  
  if (!resort) {
    return res.render('index', { 
      weather: null, 
      error: 'Please enter a ski resort name' 
    });
  }
  
  // For API calls, we'll use just the resort name without "ski resort" suffix
  // as the geocoding API works better with simpler location names
  const searchQuery = resort;
  const displayQuery = resort.toLowerCase().includes('ski') || 
                      resort.toLowerCase().includes('resort') ? 
                      resort : `${resort} ski resort`;

  try {
    let lat, lon, weatherData;
    
    // Check if we should use real API or mock data
    if (USE_MOCK_DATA) {
      console.log('Using mock data for:', displayQuery);
      const geoData = mockData.getMockGeoData(displayQuery);
      
      if (!geoData || geoData.length === 0) {
        return res.render('index', { 
          weather: null, 
          error: 'Ski resort not found. Please try another location.' 
        });
      }
      
      lat = geoData[0].lat;
      lon = geoData[0].lon;
      weatherData = mockData.getMockWeatherData(displayQuery);
    } else {
      console.log('Using real API data for:', displayQuery);
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

      lat = geoResponse.data[0].lat;
      lon = geoResponse.data[0].lon;
      
      // Get 5-day weather forecast (free tier)
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );

      // Get current weather
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
      );

      // Convert the 5-day/3-hour forecast to daily format
      const forecastList = weatherResponse.data.list;
      const dailyData = [];
      const dayMap = {};
      
      // Group forecast by day
      forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toISOString().split('T')[0];
        
        if (!dayMap[day]) {
          dayMap[day] = {
            dt: item.dt,
            sunrise: currentWeatherResponse.data.sys.sunrise,
            sunset: currentWeatherResponse.data.sys.sunset,
            temp: {
              day: item.main.temp,
              min: item.main.temp_min,
              max: item.main.temp_max
            },
            feels_like: {
              day: item.main.feels_like
            },
            pressure: item.main.pressure,
            humidity: item.main.humidity,
            weather: item.weather,
            clouds: item.clouds.all,
            wind_speed: item.wind.speed,
            wind_deg: item.wind.deg,
            pop: item.pop || 0,
            rain: item.rain ? item.rain['3h'] : 0,
            snow: item.snow ? item.snow['3h'] : 0
          };
          dailyData.push(dayMap[day]);
        } else {
          // Update min/max temperatures
          dayMap[day].temp.min = Math.min(dayMap[day].temp.min, item.main.temp_min);
          dayMap[day].temp.max = Math.max(dayMap[day].temp.max, item.main.temp_max);
          
          // Accumulate precipitation
          if (item.rain) {
            dayMap[day].rain += item.rain['3h'] || 0;
          }
          if (item.snow) {
            dayMap[day].snow += item.snow['3h'] || 0;
          }
          
          // Update probability of precipitation
          if (item.pop > dayMap[day].pop) {
            dayMap[day].pop = item.pop;
          }
        }
      });
      
      // Create a structure similar to the One Call API
      weatherData = {
        lat: lat,
        lon: lon,
        timezone: weatherResponse.data.city.timezone,
        timezone_offset: 0,
        current: {
          dt: currentWeatherResponse.data.dt,
          sunrise: currentWeatherResponse.data.sys.sunrise,
          sunset: currentWeatherResponse.data.sys.sunset,
          temp: currentWeatherResponse.data.main.temp,
          feels_like: currentWeatherResponse.data.main.feels_like,
          pressure: currentWeatherResponse.data.main.pressure,
          humidity: currentWeatherResponse.data.main.humidity,
          clouds: currentWeatherResponse.data.clouds.all,
          visibility: currentWeatherResponse.data.visibility,
          wind_speed: currentWeatherResponse.data.wind.speed,
          wind_deg: currentWeatherResponse.data.wind.deg,
          weather: currentWeatherResponse.data.weather,
          rain: currentWeatherResponse.data.rain ? currentWeatherResponse.data.rain['1h'] : 0,
          snow: currentWeatherResponse.data.snow ? currentWeatherResponse.data.snow['1h'] : 0
        },
        daily: dailyData
      };
    }
    
    const dailyForecast = weatherData.daily.slice(0, 7); // Get 7 days of forecast
    
    // Analyze snow conditions
    const snowAnalysis = analyzeSnowConditions(dailyForecast);

    return res.render('index', {
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
    
    // If API call fails and we're not already using mock data, try using mock data as fallback
    if (!USE_MOCK_DATA && (error.response?.status === 401 || error.code === 'ERR_BAD_REQUEST')) {
      console.log('API error occurred. Trying mock data as fallback.');
      try {
        const geoData = mockData.getMockGeoData(displayQuery);
        const weatherData = mockData.getMockWeatherData(displayQuery);
        const dailyForecast = weatherData.daily.slice(0, 7);
        const snowAnalysis = analyzeSnowConditions(dailyForecast);
        
        return res.render('index', {
          weather: {
            resort: resort,
            current: weatherData.current,
            daily: dailyForecast,
            snowAnalysis: snowAnalysis
          },
          error: null
        });
      } catch (mockError) {
        console.error('Error using mock data fallback:', mockError);
      }
    }
    
    // Provide specific error message based on the error
    let errorMessage = 'Error fetching weather data. Please try again later.';
    
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Invalid API key. Please check your OpenWeatherMap API key in the .env file.';
      } else if (error.response.status === 404) {
        errorMessage = 'Weather data not found for this location.';
      } else if (error.response.status === 429) {
        errorMessage = 'Too many requests. API rate limit exceeded.';
      }
    } else if (error.request) {
      errorMessage = 'No response from weather service. Please check your internet connection.';
    }
    
    return res.render('index', { 
      weather: null, 
      error: errorMessage
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
const USE_MOCK_DATA = !WEATHER_API_KEY || WEATHER_API_KEY === 'your_openweathermap_api_key_here';

if (USE_MOCK_DATA) {
  console.warn('\x1b[33m%s\x1b[0m', 'Warning: OpenWeatherMap API key is not set or is using the default value.');
  console.warn('\x1b[33m%s\x1b[0m', 'Please set a valid API key in the .env file or as an environment variable.');
  console.warn('\x1b[33m%s\x1b[0m', 'You can get a free API key by signing up at https://openweathermap.org/api');
  console.warn('\x1b[33m%s\x1b[0m', 'Using mock data for demonstration purposes.');
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Also accessible at https://work-1-ouaozggwjxpugtrn.prod-runtime.all-hands.dev`);
});