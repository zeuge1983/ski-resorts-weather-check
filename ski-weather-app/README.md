# Ski Resort Weather Checker

A Node.js application that provides weather forecasts and snow condition analysis for ski resorts.

## Features

- Search for any ski resort by name
- View a 7-day weather forecast for the selected resort
- Get an analysis of snow conditions based on the forecast
- Responsive design that works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenWeatherMap API key

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/ski-resort-weather-checker.git
   cd ski-resort-weather-checker
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your OpenWeatherMap API key:

   ```
   WEATHER_API_KEY=your_api_key_here
   ```

   You can get a free API key by signing up at [OpenWeatherMap](https://openweathermap.org/api).

   **Important**: The application will use mock data if no valid API key is provided. To get real weather data, you must use a valid OpenWeatherMap API key.

## Usage

1. Start the application:

   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:12000`

3. Enter the name of a ski resort in the search field and click "Check Weather"

4. View the 7-day forecast and snow condition analysis

## How It Works

1. The application uses the OpenWeatherMap Geocoding API to convert the ski resort name into latitude and longitude coordinates.

2. It then uses the OpenWeatherMap One Call API to get the current weather and 7-day forecast for those coordinates.

3. The application analyzes the forecast data to provide insights about snow conditions, including:
   - Expected snow days
   - Total expected snowfall
   - Temperature range
   - Overall snow condition assessment


## 1. Architecture Overview

The application follows a simple MVC (Model-View-Controller) pattern:

**Model**: Weather data fetched from OpenWeatherMap APIs
**View**: EJS templates that render the UI
**Controller**: Express.js routes that handle requests and responses

## 2. Server Setup and Configuration

The application uses:

- SExpress.js as the web framework
- SEJS as the templating engine
- SAxios for making HTTP requests to the weather APIs
- Sdotenv for managing environment variables
- SThe server is configured to:

   - SServe static files from the public directory
   - SParse form data
   - SUse EJS templates from the views directory
   - SRun on port 12000

## 3. Weather Data Fetching Process

When a user searches for a ski resort, the following happens:

**Step 1**: Process the Search Query

- The user enters a resort name (e.g., "Aspen")
- The application creates two versions of the query:
   - searchQuery: Just the resort name (e.g., "Aspen") - used for API calls
   - displayQuery: Resort name with "ski resort" suffix if not already included (e.g., "Aspen ski resort") - used for display and mock data

**Step 2**: Geocoding

- The application uses OpenWeatherMap's Geocoding API to convert the resort name to latitude and longitude coordinates
- API endpoint: https://api.openweathermap.org/geo/1.0/direct
- This step is crucial because weather data is location-based, not name-based

**Step 3**: Current Weather Data

- Once we have the coordinates, we fetch the current weather conditions
- API endpoint: https://api.openweathermap.org/data/2.5/weather
- This provides data like current temperature, humidity, wind, etc.

**Step 4**: Forecast Data

- We also fetch the 5-day forecast data (with 3-hour intervals)
- API endpoint: https://api.openweathermap.org/data/2.5/forecast
- This gives us weather predictions for the next 5 days

**Step 5**: Data Processing

*-* The 5-day/3-hour forecast data is processed to create a daily forecast format
For each day, we:
   - Group all forecasts for the same day
   - Calculate min/max temperatures
   - Accumulate precipitation (rain and snow)
   - Determine the highest probability of precipitation
   - This processed data is structured to match the format our templates expect

**Step 6**: Snow Condition Analysis

*-* The analyzeSnowConditions function examines the forecast data to:
   - Count expected snow days
   - Calculate total expected snowfall
   - Determine temperature ranges
   - Provide an overall assessment of snow conditions
   - The analysis considers factors like:
   - Amount of snowfall
   - Temperature (to determine snow quality)
   - Wind conditions
   - Probability of precipitation

## 4. Fallback Mechanism
*-* The application includes a robust fallback system:

   - If the API key is missing or invalid, it uses mock data
   - If the API calls fail for any reason, it attempts to use mock data as a fallback
   - The mock data system provides realistic weather data for popular ski resorts

## 5. User Interface
*-* The UI is designed to be clean and responsive:

   - A search form at the top allows users to enter a ski resort name
   - When results are displayed, they include:
   - Current weather conditions with temperature, humidity, wind, etc.
   - A 7-day forecast showing daily weather conditions
   - A snow condition analysis with an overall assessment
   - Weather icons visually represent different weather conditions
   - Temperature is displayed in Celsius
   - The design is responsive and works on both desktop and mobile devices

## 6. Error Handling
*-* The application includes comprehensive error handling:

   - If a resort is not found, it displays a specific error message
   - If there's an API error, it provides a detailed error message based on the error type
   - If all else fails, it falls back to mock data to ensure the user gets some response

## 7. Technical Implementation Details
*-* API Integration:
   - The application uses free tier OpenWeatherMap APIs
   - It combines multiple API calls to create a comprehensive weather report
   - All API calls include proper error handling and response validation

*-* Data Transformation:
   - The application transforms the raw API data into a format suitable for display
   - It calculates additional metrics like snow condition assessments
   - It handles unit conversions (e.g., Kelvin to Celsius) where needed

*-* Caching and Performance:
   - The application doesn't implement caching yet, but this could be added to reduce API calls
   - API responses are processed efficiently to minimize memory usage

## 8. Future Enhancements
*-* The application could be enhanced with:

   - User accounts to save favorite ski resorts
   - Historical weather data comparison
   - Snow depth reports from additional data sources
   - Trail status information
   - Integration with ski resort APIs for lift status
   - Caching to reduce API calls and improve performance
   - This detailed explanation covers how the application works from the user's search input all the way to displaying the weather forecast and snow condition analysis.
