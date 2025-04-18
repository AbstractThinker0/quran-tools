import { validArabicLetters } from "./consts";
import { IMatch, verseProps } from "./types";

export function normalizeAlif(
  token: string,
  includeHamza = false,
  reverseAlif = false
) {
  if (includeHamza) {
    return token.replace(/(آ|إ|أ|ء)/g, "ا");
  }

  if (reverseAlif) {
    return token.replace(/(آ|إ|ا|ء)/g, "أ");
  }

  return token.replace(/(آ|إ|أ)/g, "ا");
}

export function onlySpaces(str: string) {
  return str.trim().length === 0;
}

export function removeDiacritics(input: string): string {
  return input.replace(/[\u064B-\u0652\u0670\u0640]/g, "");
}

function isValidArabicLetter(char: string) {
  return validArabicLetters.includes(char);
}

export function splitArabicLetters(arabicText: string) {
  const result: string[] = [];

  for (const char of arabicText) {
    if (!onlySpaces(char) && !isValidArabicLetter(char)) {
      result[result.length - 1] += char;
    } else {
      result.push(char);
    }
  }

  return result;
}

/**
 * Escapes special characters in a string to be used as a literal in a regular expression pattern.
 * @param {string} string - The input string to escape.
 * @returns {string} The escaped string with special characters replaced by their escaped versions.
 */
function escapeRegex(string: string): string {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Creates a regular expression that matches the provided term bounded by whitespace characters or start/end.
 * @param term - The term to match.
 * @returns A regular expression that matches the term bounded by whitespace characters or start/end.
 */
function identicalRegex(term: string): RegExp {
  const startBoundary = term.charAt(0) === " " ? "" : "(?<=^|\\s)";
  const endBoundary = term.charAt(term.length - 1) === " " ? "" : "(?=\\s|$)";
  const regexPattern = `(${startBoundary}${escapeRegex(term)}${endBoundary})`;

  return new RegExp(regexPattern);
}

/**
 * Creates a regular expression that matches the provided term started by whitespace characters or start.
 * @param term - The term to match.
 * @returns A regular expression that matches the term started by whitespace characters or start.
 */
function startRegex(term: string): RegExp {
  const startBoundary = term.charAt(0) === " " ? "" : "(?<=^|\\s)";
  const regexPattern = `(${startBoundary}${escapeRegex(term)})`;

  return new RegExp(regexPattern);
}

interface IMatchOptions {
  matchDiacritics?: boolean;
  matchIdentical?: boolean;
  startOnly?: boolean;
}

export function getWordMatches(
  verse: verseProps,
  searchToken: string,
  matchOptions: IMatchOptions
) {
  const text = verse.versetext;

  if (!searchToken.trim() || !text.trim()) {
    return false;
  }

  const {
    matchDiacritics = false,
    matchIdentical = false,
    startOnly = false,
  } = matchOptions; // Destructure options with default values

  const normalizedText = matchDiacritics
    ? text
    : normalizeAlif(removeDiacritics(text));

  // Check whether we can find any matches
  const isTokenFound = matchIdentical
    ? identicalRegex(searchToken).test(normalizedText)
    : startOnly
    ? startRegex(searchToken).test(normalizedText)
    : normalizedText.includes(searchToken);

  if (!isTokenFound) {
    return false;
  }

  // using RegExp with () here because we want to include the searchToken as a separate part in the resulting array.
  const regex = matchIdentical
    ? identicalRegex(searchToken)
    : startOnly
    ? startRegex(searchToken)
    : new RegExp(`(${escapeRegex(searchToken)})`);

  const parts = normalizedText.split(regex).filter((part) => part !== "");

  const splittedLetters = splitArabicLetters(text);

  const traversedLength: [number] = [0];

  const getOriginalPart = (part: string) => {
    const skeletonPart = removeDiacritics(part);

    const indexOfPart = normalizedText.indexOf(
      skeletonPart,
      traversedLength[0]
    );

    traversedLength[0] += skeletonPart.length;

    return splittedLetters
      .slice(indexOfPart, indexOfPart + skeletonPart.length)
      .join("");
  };

  const matchParts: IMatch[] = parts.map((part) => {
    const partText = matchDiacritics ? part : getOriginalPart(part);

    const currentPart: IMatch = {
      text: partText,
      isMatch: part === searchToken,
    };

    return currentPart;
  });

  return {
    key: verse.key,
    suraid: verse.suraid,
    verseid: verse.verseid,
    verseParts: matchParts,
  };
}

export function hasAllLetters(str: string, token: string) {
  const tokenMap = new Map();
  const strMap = new Map();

  for (const char of token) {
    tokenMap.set(char, (tokenMap.get(char) || 0) + 1);
  }

  for (const char of str) {
    strMap.set(char, (strMap.get(char) || 0) + 1);
  }

  for (const [char, count] of tokenMap) {
    if (!strMap.has(char) || strMap.get(char) < count) {
      return false;
    }
  }

  return true;
}

export function getRootMatches(verseWords: string[], wordIndexes: string[]) {
  const verseParts: IMatch[] = [];
  let segment = "";

  for (let i = 0; i < verseWords.length; i++) {
    const isMatch = wordIndexes.includes((i + 1).toString());

    // this word index is a root derivative
    if (isMatch) {
      // If we have built a segment of non-matches push it
      if (segment) {
        verseParts.push({ text: segment, isMatch: false });
        segment = "";
      } else if (verseParts.length) {
        // Two consecutive roots, so add a space so they don't collide
        verseParts.push({ text: " ", isMatch: false });
      }

      // push the actual root match
      verseParts.push({ text: verseWords[i]!, isMatch: true });
    } else {
      // Add current word with leading space if it's not first, and trailing space if not last
      const isFirstWord = i === 0;
      const isLastWord = i === verseWords.length - 1;

      const shouldPrespace = segment.length == 0 && !isFirstWord;

      segment +=
        (shouldPrespace ? " " : "") + verseWords[i]! + (isLastWord ? "" : " ");
    }
  }

  if (segment) {
    verseParts.push({ text: segment, isMatch: false });
  }

  return verseParts;
}

export const getDerivationsInVerse = (
  wordIndexes: string[],
  verse: verseProps,
  chapterName: string
) => {
  const { versetext, key, suraid, verseid } = verse;
  const verseWords = versetext.split(" ");

  const verseParts = getRootMatches(verseWords, wordIndexes);

  const verseDerivations = wordIndexes.map((wordIndex) => ({
    name: verseWords[Number(wordIndex) - 1]!,
    key,
    text: `${chapterName}:${verseid}`,
    wordIndex,
  }));

  const verseResult = { key, suraid, verseid, verseParts };

  return { verseDerivations, verseResult };
};
