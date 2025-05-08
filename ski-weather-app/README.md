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
