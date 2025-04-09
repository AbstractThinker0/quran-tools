import { quranInstance } from "./jest.setup"; // Import shared instance

describe("searchByRootIDs Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("searchByRootIDs should return correct value", () => {
    const searchResult = quranInstance.searchByRootIDs(["1"]);

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    expect(searchResult[0]!.suraid).toEqual("6");
  });
});
