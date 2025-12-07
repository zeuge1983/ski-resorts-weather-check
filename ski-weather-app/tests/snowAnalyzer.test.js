const { analyzeSnowConditions } = require("../snowAnalyzer");

describe("Snow Analyzer", () => {
  describe("analyzeSnowConditions", () => {
    test("should correctly identify multiple snow days", () => {
      // Arrange
      const forecast = [
        createForecastDay(-5, 0, "Snow", 2.5),
        createForecastDay(-3, 1, "Snow", 1.8),
        createForecastDay(-4, -1, "Snow", 3.2),
        createForecastDay(-2, 2, "Clouds", 0),
      ];

      // Act
      const result = analyzeSnowConditions(forecast);

      // Assert
      expect(result.snowDays).toBe(3);
      expect(result.totalSnow).toBe(7.5);
      expect(result.lowestTemp).toBe(-5);
      expect(result.highestTemp).toBe(2);
      expect(result.analysis).toBe(
        "Great news! Fresh powder expected with multiple snow days in the forecast.",
      );
    });

    test("should correctly identify a single snow day", () => {
      // Arrange
      const forecast = [
        createForecastDay(-2, 3, "Snow", 1.5),
        createForecastDay(-1, 4, "Clouds", 0),
        createForecastDay(0, 5, "Clear", 0),
      ];

      // Act
      const result = analyzeSnowConditions(forecast);

      // Assert
      expect(result.snowDays).toBe(1);
      expect(result.totalSnow).toBe(1.5);
      expect(result.lowestTemp).toBe(-2);
      expect(result.highestTemp).toBe(5);
      expect(result.analysis).toBe(
        "Some fresh snow expected with 1 snow day(s) in the forecast.",
      );
    });

    test("should correctly identify cold conditions with no snow", () => {
      // Arrange
      const forecast = [
        createForecastDay(-3, 2, "Clouds", 0),
        createForecastDay(-2, 3, "Clear", 0),
        createForecastDay(-1, 4, "Clouds", 0),
      ];

      // Act
      const result = analyzeSnowConditions(forecast);

      // Assert
      expect(result.snowDays).toBe(0);
      expect(result.totalSnow).toBe(0);
      expect(result.lowestTemp).toBe(-3);
      expect(result.highestTemp).toBe(4);
      expect(result.analysis).toBe(
        "No fresh snow expected, but temperatures will be cold enough to preserve existing snow.",
      );
    });

    test("should correctly identify cool conditions with no snow", () => {
      // Arrange
      const forecast = [
        createForecastDay(2, 8, "Clouds", 0),
        createForecastDay(3, 10, "Clear", 0),
        createForecastDay(4, 12, "Clouds", 0),
      ];

      // Act
      const result = analyzeSnowConditions(forecast);

      // Assert
      expect(result.snowDays).toBe(0);
      expect(result.totalSnow).toBe(0);
      expect(result.lowestTemp).toBe(2);
      expect(result.highestTemp).toBe(12);
      expect(result.analysis).toBe(
        "No fresh snow expected. Cool temperatures may help maintain snow conditions.",
      );
    });

    test("should correctly identify warm conditions with no snow", () => {
      // Arrange
      const forecast = [
        createForecastDay(6, 12, "Clouds", 0),
        createForecastDay(8, 15, "Clear", 0),
        createForecastDay(7, 14, "Clouds", 0),
      ];

      // Act
      const result = analyzeSnowConditions(forecast);

      // Assert
      expect(result.snowDays).toBe(0);
      expect(result.totalSnow).toBe(0);
      expect(result.lowestTemp).toBe(6);
      expect(result.highestTemp).toBe(15);
      expect(result.analysis).toBe(
        "No fresh snow expected and temperatures are relatively warm. Snow conditions may deteriorate.",
      );
    });

    test("should handle empty forecast array", () => {
      // Act
      const result = analyzeSnowConditions([]);

      // Assert
      expect(result.snowDays).toBe(0);
      expect(result.totalSnow).toBe(0);
      expect(result.lowestTemp).toBe(100);
      expect(result.highestTemp).toBe(-100);
      // The analysis will be based on the default values
      expect(result.analysis).toBe(
        "No fresh snow expected and temperatures are relatively warm. Snow conditions may deteriorate.",
      );
    });
  });
});

// Helper function to create a forecast day object
function createForecastDay(minTemp, maxTemp, weatherMain, snowAmount = 0) {
  return {
    temp: {
      min: minTemp,
      max: maxTemp,
      day: (minTemp + maxTemp) / 2, // Average for day temp
    },
    weather: [
      {
        main: weatherMain,
        description: weatherMain.toLowerCase(),
        icon: "01d",
      },
    ],
    snow: snowAmount,
  };
}
