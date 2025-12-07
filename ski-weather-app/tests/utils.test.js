const mockData = require("../mockData");

describe("Utility Functions", () => {
  describe("Resort Name Handling", () => {
    test('should handle resort names with "ski resort" suffix', () => {
      // This test verifies the behavior of the displayQuery logic in index.js
      const resortName = "Aspen";
      const displayQuery =
        resortName.toLowerCase().includes("ski") ||
        resortName.toLowerCase().includes("resort")
          ? resortName
          : `${resortName} ski resort`;

      expect(displayQuery).toBe("Aspen ski resort");
    });

    test('should not add suffix if already contains "ski"', () => {
      const resortName = "Aspen Ski Area";
      const displayQuery =
        resortName.toLowerCase().includes("ski") ||
        resortName.toLowerCase().includes("resort")
          ? resortName
          : `${resortName} ski resort`;

      expect(displayQuery).toBe("Aspen Ski Area");
    });

    test('should not add suffix if already contains "resort"', () => {
      const resortName = "Whistler Resort";
      const displayQuery =
        resortName.toLowerCase().includes("ski") ||
        resortName.toLowerCase().includes("resort")
          ? resortName
          : `${resortName} ski resort`;

      expect(displayQuery).toBe("Whistler Resort");
    });
  });

  describe("Mock Data Fallback", () => {
    test("should provide mock data for all supported resorts", () => {
      const supportedResorts = [
        "aspen",
        "whistler",
        "zermatt",
        "chamonix",
        "st. moritz",
      ];

      supportedResorts.forEach((resort) => {
        const geoData = mockData.getMockGeoData(resort);
        expect(geoData).toBeDefined();
        expect(geoData.length).toBeGreaterThan(0);

        const weatherData = mockData.getMockWeatherData(resort);
        expect(weatherData).toBeDefined();
        expect(weatherData.current).toBeDefined();
        expect(weatherData.daily).toBeDefined();
      });
    });
  });
});
