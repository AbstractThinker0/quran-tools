import { quranInstance } from "./jest.setup"; // Import shared instance

describe("getOccurencesData Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("getOccurencesData should return correct value", () => {
    const searchResult = quranInstance.searchRoots("آزر");

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    const rootTarget = searchResult[0]!;

    expect(rootTarget.name).toEqual("آزر");

    const data = quranInstance.getOccurencesData(rootTarget.occurences);

    expect(data.rootDerivations.length).toBe(1);

    expect(data.rootVerses.length).toBe(1);
  });

  test("getOccurencesData should return correct value", () => {
    const searchResult = quranInstance.searchRoots("آدم");

    expect(searchResult).toBeTruthy(); // Ensure it exists

    // This is here to make typescript happy
    if (!searchResult) throw new Error("searchResult is not initialized");

    const rootTarget = searchResult[0]!;

    expect(rootTarget.name).toEqual("آدم");

    const data = quranInstance.getOccurencesData(rootTarget.occurences);

    expect(data.rootDerivations.length).toBe(25);

    expect(data.rootVerses.length).toBe(25);
  });
});
