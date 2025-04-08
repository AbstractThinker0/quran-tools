import { quranInstance } from "./jest.setup"; // Import shared instance

describe("hasConjunction Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("hasConjunction should return correct value", () => {
    const word = quranInstance.hasConjunction(0, 1);

    expect(word).toEqual(false);
  });

  test("hasConjunction should return correct value", () => {
    const word = quranInstance.hasConjunction(4, 3);

    expect(word).toEqual(true);
  });

  //270:26
  test("hasConjunction should return correct value", () => {
    const word = quranInstance.hasConjunction(270, 26);

    expect(word).toEqual(false);
  });

  // 6086:1
  test("hasConjunction should return correct value", () => {
    const word = quranInstance.hasConjunction(6086, 1);

    expect(word).toEqual(true);
  });
});
