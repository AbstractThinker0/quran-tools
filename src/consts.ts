const arabicAlpha = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ى",
  "ي",
];

const extraLetters = ["أ", "إ", "آ", "ة", "ء", "ؤ", "ئ"];

const validArabicLetters = arabicAlpha.concat(extraLetters);

export { arabicAlpha, validArabicLetters };
