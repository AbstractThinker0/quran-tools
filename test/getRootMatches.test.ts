import { getRootMatches } from "../src/utils";

describe("getRootMatches Tests", () => {
  test("getRootMatches should return correct matches", () => {
    const verseWords = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَـٰنِ", "ٱلرَّحِيمِ"];
    const wordIndexes = ["2", "4"];
    const result = getRootMatches(verseWords, wordIndexes);
    expect(result).toBeDefined();
    expect(result.length).toBe(4);
    expect(result[0]!.text).toBe("بِسْمِ ");
    expect(result[0]!.isMatch).toBe(false);
    expect(result[1]!.text).toBe("ٱللَّهِ");
    expect(result[1]!.isMatch).toBe(true);
    expect(result[2]!.text).toBe(" ٱلرَّحْمَـٰنِ ");
    expect(result[2]!.isMatch).toBe(false);
    expect(result[3]!.text).toBe("ٱلرَّحِيمِ");
    expect(result[3]!.isMatch).toBe(true);
  });
});
