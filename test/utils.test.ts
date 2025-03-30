import {
  removeDiacritics,
  //splitArabicLetters,
  normalizeAlif,
  onlySpaces,
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
});
