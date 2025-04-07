import { quranInstance } from "./jest.setup"; // Import shared instance

describe("getWordRoots Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("getWordRoots should return correct value", () => {
    const searchResult = quranInstance.getWordRoots(0, 1);

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("getWordRoots is not initialized");

    expect(searchResult[0]!.name).toEqual("ب");
  });
});
