import { quranInstance } from "./jest.setup"; // Import shared instance

describe("searchByWord Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("searchByWord should return correct value", () => {
    const searchResult = quranInstance.searchByWord("آزر", "all", {
      searchDiacritics: false,
      searchIdentical: true,
      searchStart: false,
    });

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult[0]!.key).toEqual("6-74");
  });

  test("searchByWord should return correct value with searchDiacritics true", () => {
    const searchResult = quranInstance.searchByWord("آزَرَ", "all", {
      searchDiacritics: true,
      searchIdentical: true,
      searchStart: false,
    });

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult[0]!.key).toEqual("6-74");
  });

  test("searchByWord should return correct value with searchIdentical false", () => {
    const searchResult = quranInstance.searchByWord("آزر", "all", {
      searchDiacritics: false,
      searchIdentical: false,
      searchStart: false,
    });

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult[0]!.key).toEqual("6-74");
  });

  test("searchByWord should return correct value with searchStart true", () => {
    const searchResult = quranInstance.searchByWord("آزر", "all", {
      searchDiacritics: false,
      searchIdentical: false,
      searchStart: true,
    });

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult[0]!.key).toEqual("6-74");
  });
});
