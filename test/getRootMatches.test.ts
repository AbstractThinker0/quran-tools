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

  test("getRootMatches shouldn't add extra spaces", () => {
    const verseWords =
      "وَكَتَبْنَا عَلَيْهِمْ فِيهَا أَنَّ النَّفْسَ بِالنَّفْسِ وَالْعَيْنَ بِالْعَيْنِ وَالْأَنْفَ بِالْأَنْفِ وَالْأُذُنَ بِالْأُذُنِ وَالسِّنَّ بِالسِّنِّ وَالْجُرُوحَ قِصَاصٌ فَمَنْ تَصَدَّقَ بِهِ فَهُوَ كَفَّارَةٌ لَهُ وَمَنْ لَمْ يَحْكُمْ بِمَا أَنْزَلَ اللَّهُ فَأُولَـٰئِكَ هُمُ الظَّالِمُونَ".split(
        " "
      );

    const wordIndexes = ["11", "12"];

    const result = getRootMatches(verseWords, wordIndexes);
    expect(result).toBeDefined();
    expect(result.length).toBe(5);
    expect(result[0]!.text).toBe(
      "وَكَتَبْنَا عَلَيْهِمْ فِيهَا أَنَّ النَّفْسَ بِالنَّفْسِ وَالْعَيْنَ بِالْعَيْنِ وَالْأَنْفَ بِالْأَنْفِ "
    );
    expect(result[0]!.isMatch).toBe(false);
    expect(result[1]!.text).toBe("وَالْأُذُنَ");
    expect(result[1]!.isMatch).toBe(true);
    expect(result[2]!.text).toBe(" ");
    expect(result[2]!.isMatch).toBe(false);
    expect(result[3]!.text).toBe("بِالْأُذُنِ");
    expect(result[3]!.isMatch).toBe(true);
    expect(result[4]!.text).toBe(
      " وَالسِّنَّ بِالسِّنِّ وَالْجُرُوحَ قِصَاصٌ فَمَنْ تَصَدَّقَ بِهِ فَهُوَ كَفَّارَةٌ لَهُ وَمَنْ لَمْ يَحْكُمْ بِمَا أَنْزَلَ اللَّهُ فَأُولَـٰئِكَ هُمُ الظَّالِمُونَ"
    );
    expect(result[4]!.isMatch).toBe(false);
  });
});
