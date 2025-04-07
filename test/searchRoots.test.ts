import { quranInstance } from "./jest.setup"; // Import shared instance

describe("searchRoots Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("searchRoots should return correct value", () => {
    const searchResult = quranInstance.searchRoots("آزر");

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult[0]!.name).toEqual("آزر");
  });
});
