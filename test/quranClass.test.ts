import { quranInstance } from "./jest.setup"; // Import shared instance

describe("quranClass Tests", () => {
  beforeAll(() => {
    expect(quranInstance).toBeDefined(); // Ensure instance is valid
  });

  test("should have fetched 114 chapter names", () => {
    expect(quranInstance.chapterNames.length).toEqual(114);
  });

  test("should have fetched 6236 verses", () => {
    expect(quranInstance.absoluteQuran.length).toEqual(6236);
  });

  test("should have fetched more than 1900 roots", () => {
    expect(quranInstance.quranRoots.length).toBeGreaterThan(1900);
  });

  test("getChapterName should return correct value", () => {
    expect(quranInstance.getChapterName(1)).toEqual("الفاتحة");
  });

  test("getVerses should return correct value", () => {
    expect(quranInstance.getVerses(1).length).toEqual(7);
  });

  test("getVerseByKey should return correct value", () => {
    expect(quranInstance.getVerseByKey("1-1")).toEqual(
      quranInstance.getVerses(1)[0]
    );
  });

  test("getVerseTextByKey should return correct value", () => {
    expect(quranInstance.getVerseTextByKey("1-1")).toBe(
      "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ"
    );
  });

  test("getVerseByRank should return correct value", () => {
    expect(quranInstance.getVerseByRank(0)).toEqual(
      quranInstance.getVerses(1)[0]
    );
  });

  test("convertKeyToSuffix should return correct value", () => {
    expect(quranInstance.convertKeyToSuffix("2-1")).toEqual("البقرة:1");
  });

  test("getRootByID should return correct value", () => {
    expect(quranInstance.getRootByID(1)?.name).toEqual("آزر");
  });

  test("getLetterByKey should return correct value", () => {
    expect(quranInstance.getLetterByKey("1-1", "0-0")).toEqual("ب");
  });
});
