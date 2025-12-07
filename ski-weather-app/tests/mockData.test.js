const mockData = require("../mockData");

describe("Mock Data", () => {
  describe("getMockGeoData", () => {
    test('should return Aspen data for "Aspen" query', () => {
      const result = mockData.getMockGeoData("Aspen");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Aspen");
      expect(result[0].lat).toBe(39.1911);
      expect(result[0].lon).toBe(-106.8175);
      expect(result[0].country).toBe("US");
    });

    test("should be case insensitive", () => {
      const result = mockData.getMockGeoData("zermatt");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Zermatt");
    });

    test("should return Aspen as default for unknown resorts", () => {
      const result = mockData.getMockGeoData("Unknown Resort");
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Aspen");
    });
  });

  describe("getMockWeatherData", () => {
    test("should return weather data with the expected structure", () => {
      const result = mockData.getMockWeatherData("Any Resort");
      expect(result).toHaveProperty("lat");
      expect(result).toHaveProperty("lon");
      expect(result).toHaveProperty("current");
      expect(result).toHaveProperty("daily");
      expect(result.daily).toBeInstanceOf(Array);
    });
  });
});
