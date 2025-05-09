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

module.exports = { analyzeSnowConditions };