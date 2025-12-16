const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeResortConditions(
  resort,
  weatherData,
  nearbyResorts = [],
) {
  console.log("\n=== Starting resort analysis ===\n");
  try {
    console.log("Initializing Gemini model...");
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    // Calculate some helpful metrics
    const snowDaysCount = weatherData.daily.filter(
      (day) => day.snow > 0,
    ).length;
    const totalSnowfall = weatherData.daily.reduce(
      (sum, day) => sum + (day.snow || 0),
      0,
    );
    const avgTemp =
      weatherData.daily.reduce((sum, day) => sum + day.temp.day, 0) /
      weatherData.daily.length;

    // Create a structured prompt for Gemini
    const prompt = `As a ski resort analyst, analyze the conditions for ${resort} ski resort. Format your response exactly as shown below, keeping the section headers and maintaining clear separation between sections:

# SNOW CONDITIONS
[Analyze the current snow depth (${weatherData.current.snow || 0}mm) and expected snowfall (${totalSnowfall}mm). Describe snow quality and coverage.]

# BEST DAYS
[Based on the forecast data, identify and explain which specific days will be best for skiing.]

# RESORT CHOICE
[Evaluate if skiing is recommended at this resort based on current conditions. If nearby resorts are available and conditions aren't ideal, suggest alternatives. If no alternatives are available but conditions are poor, provide recommendations for when to visit instead or suggest other winter activities that might be possible with current conditions.]

# SKIER ADVICE
[Provide specific equipment recommendations and important safety tips based on conditions.]

Use this weather data for your analysis:
- Current temperature: ${weatherData.current.temp}°C
- Fresh snow: ${weatherData.current.snow || 0}mm
- Wind speed: ${weatherData.current.wind_speed}m/s
- Current weather: ${weatherData.current.weather[0].description}

Week overview:
- Snow days expected: ${snowDaysCount}
- Total snowfall forecast: ${totalSnowfall}mm
- Average temperature: ${avgTemp.toFixed(1)}°C

Daily forecast (next 5 days):
${weatherData.daily
  .slice(0, 5)
  .map(
    (day) =>
      `${new Date(day.dt * 1000).toLocaleDateString()}: ${day.temp.day}°C, Snow: ${day.snow || 0}mm, ${day.weather[0].description}`,
  )
  .join("\n")}

${nearbyResorts.length > 0 ? `Nearby resorts:\n${nearbyResorts.map((resort) => `${resort.name} (${resort.distance}km away)`).join("\n")}` : "No nearby resorts available"}`;

    console.log(
      "API Key length:",
      process.env.GEMINI_API_KEY?.length || "not set",
    );
    console.log("Sending prompt to Gemini for resort:", resort);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    console.log("\n=== Raw AI response start ===\n");
    console.log(analysis);
    console.log("\n=== Raw AI response end ===\n");

    // Updated regex patterns with # headers
    const sections = {
      conditions:
        (analysis.match(/# SNOW CONDITIONS\n([\s\S]*?)(?=# BEST DAYS|$)/) ||
          [])[1] || "",
      bestDays:
        (analysis.match(/# BEST DAYS\n([\s\S]*?)(?=# RESORT CHOICE|$)/) ||
          [])[1] || "",
      alternatives:
        (analysis.match(/# RESORT CHOICE\n([\s\S]*?)(?=# SKIER ADVICE|$)/) ||
          [])[1] || "",
      advice:
        (analysis.match(/# SKIER ADVICE\n([\s\S]*?)(?=$)/) || [])[1] || "",
    };

    // Clean up sections
    Object.keys(sections).forEach((key) => {
      if (sections[key]) {
        sections[key] = sections[key]
          .trim()
          .replace(/^\[|\]$/g, "") // Remove square brackets
          .replace(/^\s*[\r\n]/gm, "")
          .replace(/^[^a-zA-Z0-9]*/, "");
      }
    });

    console.log("Parsed sections:", JSON.stringify(sections, null, 2));

    const hasAllSections = Object.values(sections).every(
      (section) => section.length > 0,
    );

    if (!hasAllSections) {
      console.warn("Missing sections in AI response:", {
        hasConditions: sections.conditions.length > 0,
        hasBestDays: sections.bestDays.length > 0,
        hasAlternatives: sections.alternatives.length > 0,
        hasAdvice: sections.advice.length > 0,
      });
    }

    return {
      analysis,
      structured: {
        snowConditions:
          sections.conditions || "No snow conditions analysis available.",
        bestDays:
          sections.bestDays || "No best days recommendations available.",
        alternativeResorts:
          sections.alternatives ||
          "No alternative resort recommendations available.",
        advice: sections.advice || "No specific skier advice available.",
      },
    };
  } catch (error) {
    console.error("Error in resort analysis:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return null;
  }
}

module.exports = {
  analyzeResortConditions,
};
