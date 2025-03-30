import { quranInstance } from "./jest.setup"; // Import shared instance

describe("searchByRoot Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("searchByRoot should return correct value", () => {
    const searchResult = quranInstance.searchByRoot("آزر", "all");

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult.matchVerses.length).toBeGreaterThan(0);
  });
});
