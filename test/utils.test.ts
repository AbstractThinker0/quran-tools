import {
  removeDiacritics,
  splitArabicLetters,
  normalizeAlif,
  onlySpaces,
  getWordMatches,
  hasAllLetters,
  getDerivationsInVerse,
} from "../src/utils";

describe("utils Tests", () => {
  test("removeDiacritics", () => {
    expect(removeDiacritics("أَمَرَ")).toBe("أمر");
  });

  test("onlySpaces", () => {
    expect(onlySpaces("")).toBe(true);

    expect(onlySpaces(" ")).toBe(true);

    expect(onlySpaces("a")).toBe(false);
  });

  test("normalizeAlif", () => {
    expect(normalizeAlif("أمر")).toBe("امر");

    expect(normalizeAlif("ءمر")).toBe("ءمر");

    expect(normalizeAlif("ءمر", true)).toBe("امر");

    expect(normalizeAlif("ءمر", false, true)).toBe("أمر");
  });

  test("splitArabicLetters", () => {
    let letters = splitArabicLetters("شيء");

    expect(letters[0]).toBe("ش");

    letters = splitArabicLetters("شَيء");

    expect(letters[0]).toBe("شَ");
  });

  test("removeDiacritics with different diacritics", () => {
    expect(removeDiacritics("أَمَرَ")).toBe("أمر");
    expect(removeDiacritics("فَتْحَة")).toBe("فتحة");
    expect(removeDiacritics("ضَمَّة")).toBe("ضمة");
    expect(removeDiacritics("كَسْرَة")).toBe("كسرة");
    expect(removeDiacritics("سُكُون")).toBe("سكون");
    expect(removeDiacritics("تَنْوِين")).toBe("تنوين");
    expect(removeDiacritics("شَدَّة")).toBe("شدة");
  });

  test("splitArabicLetters with different combinations", () => {
    expect(splitArabicLetters("شيء")[0]).toBe("ش");
    expect(splitArabicLetters("شَيء")[0]).toBe("شَ");
    expect(splitArabicLetters("اللَّهِ")[0]).toBe("ا");
    expect(splitArabicLetters("الرَّحْمَـٰنِ")[0]).toBe("ا");
  });

  // Mock verseProps for getWordMatches tests
  const mockVerse = {
    key: "1-1",
    suraid: "1",
    verseid: "1",
    versetext: "بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ",
    rank: 0,
  };

  test("getWordMatches with matchDiacritics true", () => {
    const result = getWordMatches(mockVerse, "الرَّحْمَـٰنِ", {
      matchDiacritics: true,
    });
    expect(result).toBeDefined();
    if (result) {
      expect(result.verseParts.length).toBeGreaterThan(0);
    }
  });

  test("getWordMatches with matchIdentical true", () => {
    const result = getWordMatches(mockVerse, "الرحمن", {
      matchIdentical: true,
    });
    expect(result).toBeDefined();
    if (result) {
      expect(result.verseParts.length).toBeGreaterThan(0);
    }
  });

  test("getWordMatches with startOnly true", () => {
    const result = getWordMatches(mockVerse, "بسم", { startOnly: true });
    expect(result).toBeDefined();
    if (result) {
      expect(result.verseParts.length).toBeGreaterThan(0);
    }
  });

  test("hasAllLetters should return true if all letters are present", () => {
    expect(hasAllLetters("hello world", "world")).toBe(true);
  });

  test("hasAllLetters should return false if not all letters are present", () => {
    expect(hasAllLetters("hello world", "universe")).toBe(false);
  });

  test("getDerivationsInVerse should return correct derivations", () => {
    const verseWords = ["بِسْمِ", "ٱللَّهِ", "ٱلرَّحْمَـٰنِ", "ٱلرَّحِيمِ"];
    const wordIndexes = ["2", "4"];
    const chapterName = "الفاتحة";
    const verse = {
      key: "1-1",
      suraid: "1",
      verseid: "1",
      versetext: verseWords.join(" "),
      rank: 0,
    };
    const { verseDerivations, verseResult } = getDerivationsInVerse(
      wordIndexes,
      verse,
      chapterName
    );
    expect(verseDerivations).toBeDefined();
    expect(verseDerivations.length).toBe(2);
    expect(verseDerivations[0]!.name).toBe("ٱللَّهِ");
    expect(verseDerivations[1]!.name).toBe("ٱلرَّحِيمِ");
    expect(verseResult).toBeDefined();
  });
});
