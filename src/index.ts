import {
  removeDiacritics,
  splitArabicLetters,
  normalizeAlif,
  onlySpaces,
  getWordMatches,
  getDerivationsInVerse,
  hasAllLetters,
  getRootMatches,
} from "./utils";

import {
  chapterProps,
  quranProps,
  rootProps,
  verseProps,
  verseMatchResult,
  searchIndexProps,
  versesObjectType,
} from "./types";

interface ISearchOptions {
  searchDiacritics: boolean;
  searchIdentical: boolean;
  searchStart: boolean;
}

interface ISearchRootOptions {
  normalizeToken: boolean;
  normalizeRoot: boolean;
  searchInclusive: boolean;
}

/**
 * @class quranClass
 * @description This class contains all the methods and properties needed to interact with the Quran data.
 */
class quranClass {
  /**
   * @member chapterNames
   * @description An array of chapter names.
   * @type {chapterProps[]}
   */
  chapterNames: chapterProps[] = [];
  /**
   * @member allQuranText
   * @description An array of Quran text data.
   * @type {quranProps[]}
   */
  allQuranText: quranProps[] = [];
  /**
   * @member quranRoots
   * @description An array of Quran roots data.
   * @type {rootProps[]}
   */
  quranRoots: rootProps[] = [];
  /**
   * @member absoluteQuran
   * @description An array of all verses in the Quran.
   * @type {verseProps[]}
   */
  absoluteQuran: verseProps[] = [];

  /**
   * @member isChaptersDataLoaded
   * @description A boolean indicating whether the chapter names data is loaded.
   * @type {boolean}
   */
  isChaptersDataLoaded = false;
  /**
   * @member isQuranDataLoaded
   * @description A boolean indicating whether the Quran text data is loaded.
   * @type {boolean}
   */
  isQuranDataLoaded = false;
  /**
   * @member isRootsDataLoaded
   * @description A boolean indicating whether the Quran roots data is loaded.
   * @type {boolean}
   */
  isRootsDataLoaded = false;

  /**
   * @async
   * @function fetchData
   * @description Fetches the Quran data from online files.
   * @returns {Promise<void>}
   */
  async fetchData() {
    try {
      const chapterNamesData = await fetch(
        "https://github.com/AbstractThinker0/tadabor/raw/refs/heads/master/public/res/chapters.json"
      );

      const chapterNames = await chapterNamesData.json();

      this.setChapters(chapterNames);

      const quranTextData = await fetch(
        "https://github.com/AbstractThinker0/tadabor/raw/refs/heads/master/public/res/quran_v2.json"
      );

      const quranText = await quranTextData.json();

      this.setQuran(quranText);

      const quranRootsData = await fetch(
        "https://raw.githubusercontent.com/AbstractThinker0/quran-roots/refs/heads/main/quranRoots.json"
      );

      const quranRoot = await quranRootsData.json();

      this.setRoots(quranRoot);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  private onRootsLoadedCallback: (() => void) | null = null;

  // Register the onRootsLoaded event
  /**
   * @function onRootsLoaded
   * @description Registers a callback function to be called when the roots data is loaded.
   * @param {() => void} callback - The callback function to be called.
   */
  onRootsLoaded(callback: () => void) {
    this.onRootsLoadedCallback = callback;
  }

  /**
   * @function setChapters
   * @description Sets the chapter names data.
   * @param {chapterProps[]} chaptersData - The chapter names data.
   */
  setChapters(chaptersData: chapterProps[]) {
    this.chapterNames = chaptersData;

    this.isChaptersDataLoaded = true;
  }

  /**
   * @function setQuran
   * @description Sets the Quran text data.
   * @param {quranProps[]} quranData - The Quran text data.
   */
  setQuran(quranData: quranProps[]) {
    if (!this.allQuranText.length) {
      let rank = 0;
      quranData.forEach((sura, index) => {
        const rankedVerses: verseProps[] = [];
        sura.verses.forEach((verse) => {
          rankedVerses.push({ ...verse, rank });
          rank++;
        });

        this.allQuranText.push({ id: index, verses: rankedVerses });
      });
    }

    if (!this.absoluteQuran.length) {
      this.allQuranText.forEach((sura) => {
        sura.verses.forEach((verse) => {
          this.absoluteQuran.push(verse);
        });
      });
    }

    this.isQuranDataLoaded = true;
  }

  /**
   * @function setRoots
   * @description Sets the Quran roots data.
   * @param {rootProps[]} rootsData - The Quran roots data.
   */
  setRoots(rootsData: rootProps[]) {
    this.quranRoots = rootsData;
    this.isRootsDataLoaded = true;

    if (this.onRootsLoadedCallback) {
      this.onRootsLoadedCallback();
    }
  }

  /**
   * @function getChapterName
   * @description Gets the name of a chapter by its ID.
   * @param {string | number} suraid - The ID of the chapter.
   * @returns {string} The name of the chapter.
   * @throws {Error} If the chapter ID is invalid or chapter names are not loaded.
   */
  getChapterName(suraid: string | number): string {
    const index = Number(suraid) - 1;

    if (isNaN(index) || index < 0 || index > 113) {
      throw new Error("getChapterName: Invalid chapter ID.");
    }

    if (this.chapterNames[index] == undefined) {
      throw new Error("getChapterName: Chapter names not loaded.");
    }

    return this.chapterNames[index].name;
  }

  /**
   * @function getVerses
   * @description Gets the verses of a chapter by its ID.
   * @param {number | string} suraid - The ID of the chapter.
   * @returns {verseProps[]} The verses of the chapter.
   * @throws {Error} If the chapter ID is invalid or Quran text is not loaded.
   */
  getVerses(suraid: number | string) {
    const index = Number(suraid) - 1;

    if (isNaN(index) || index < 0 || index > 113) {
      throw new Error("getVerses: Invalid chapter ID.");
    }

    if (this.allQuranText[index] == undefined) {
      throw new Error("getVerses: Quran text not loaded.");
    }

    return this.allQuranText[index].verses;
  }

  /**
   * @function getVerseByKey
   * @description Gets a verse by its key.
   * @param {string} key - The key of the verse.
   * @returns {verseProps} The verse.
   * @throws {Error} If the key is invalid.
   */
  getVerseByKey(key: string) {
    const info = key.split("-");

    if (info[0] == undefined || info[1] == undefined) {
      throw new Error("getVerseByKey: Invalid key.");
    }

    const verse = this.getVerses(info[0])[Number(info[1]) - 1];

    if (verse === undefined) {
      throw new Error("getVerseByKey: Invalid key (2).");
    }

    return verse;
  }

  /**
   * @function getVerseTextByKey
   * @description Gets the text of a verse by its key.
   * @param {string} key - The key of the verse.
   * @returns {string} The text of the verse.
   * @throws {Error} If the key is invalid.
   */
  getVerseTextByKey(key: string) {
    const verse = this.getVerseByKey(key);

    if (verse == undefined) {
      throw new Error("getVerseTextByKey: Invalid key.");
    }

    return verse.versetext;
  }

  /**
   * @function getVerseByRank
   * @description Gets a verse by its rank.
   * @param {string | number} rank - The rank of the verse.
   * @returns {verseProps} The verse.
   */
  getVerseByRank(rank: string | number) {
    return this.absoluteQuran[Number(rank)];
  }

  /**
   * @function convertKeyToSuffix
   * @description Converts a verse key to a suffix string.
   * @param {string} key - The key of the verse.
   * @returns {string} The suffix string.
   * @throws {Error} If the key is invalid.
   */
  convertKeyToSuffix(key: string): string {
    const info = key.split("-");

    if (info[0] == undefined || info[1] == undefined) {
      throw new Error("convertKeyToSuffix: Invalid key.");
    }

    return `${this.getChapterName(info[0])}:${info[1]}`;
  }

  /**
   * @function getRootByID
   * @description Gets a root by its ID.
   * @param {string | number} rootID - The ID of the root.
   * @returns {rootProps | undefined} The root.
   */
  getRootByID = (rootID: string | number) => {
    const root = this.quranRoots.find((root) => root.id === Number(rootID));
    return root;
  };

  /**
   * @function getRootNameByID
   * @description Gets the name of a root by its ID.
   * @param {string | number} rootID - The ID of the root.
   * @returns {string | undefined} The name of the root.
   */
  getRootNameByID = (rootID: string | number) => {
    return this.getRootByID(rootID)?.name;
  };

  /**
   * @function getRootByName
   * @description Gets a root by its name.
   * @param {string} rootName - The name of the root.
   * @returns {rootProps | undefined} The root.
   */
  getRootByName = (rootName: string) => {
    const root = this.quranRoots.find((root) => root.name === rootName);
    return root;
  };

  /**
   * @function getLetterByKey
   * @description Gets a letter by its key.
   * @param {string} verseKey - The key of the verse.
   * @param {string} letterKey - The key of the letter.
   * @returns {string} The letter.
   * @throws {Error} If the key is invalid.
   */
  getLetterByKey = (verseKey: string, letterKey: string) => {
    const verse = this.getVerseByKey(verseKey);

    if (verse == undefined) {
      throw new Error("getLetterByKey: Invalid key (verse not found).");
    }

    const verseText = verse.versetext;
    const verseWords = verseText.split(" ");

    const [wordIndex, letterIndex] = letterKey.split("-");

    const letterWord = verseWords[Number(wordIndex)];

    if (letterWord == undefined) {
      throw new Error("getLetterByKey: Invalid key (word not found).");
    }

    const letterSplit = splitArabicLetters(letterWord)[Number(letterIndex)];

    if (letterSplit == undefined) {
      throw new Error("getLetterByKey: Invalid key (letter not found).");
    }

    return removeDiacritics(letterSplit);
  };

  /**
   * @function searchByWord
   * @description Searches for a word in the Quran.
   * @param {string} word - The word to search for.
   * @param {string[] | "all"} searchChapters - The chapters to search in.
   * @param {ISearchOptions} searchOptions - The search options.
   * @returns {verseMatchResult[] | false} The verses that match the search.
   */
  searchByWord = (
    word: string,
    searchChapters: string[] | "all",
    searchOptions: ISearchOptions
  ) => {
    // Check if we are search with diacrtics or they should be stripped off
    const normalizedToken = searchOptions.searchDiacritics
      ? word
      : normalizeAlif(removeDiacritics(word));

    // If an empty search token don't initiate a search
    if (onlySpaces(normalizedToken)) {
      return false;
    }

    const matchVerses: verseMatchResult[] = [];

    const searchVerseInList = (verses: verseProps[]) => {
      verses.forEach((verse) => {
        const result = getWordMatches(verse, normalizedToken, {
          matchIdentical: searchOptions.searchIdentical,
          matchDiacritics: searchOptions.searchDiacritics,
          startOnly: searchOptions.searchStart,
        });

        if (result) {
          matchVerses.push(result);
        }
      });
    };

    if (searchChapters === "all" || searchChapters.length === 114) {
      searchVerseInList(this.absoluteQuran);
    } else {
      searchChapters.forEach((chapter) => {
        searchVerseInList(this.getVerses(chapter));
      });
    }

    if (matchVerses.length === 0) {
      return false;
    }

    return matchVerses;
  };

  /**
   * @function searchByRoot
   * @description Searches for a root in the Quran.
   * @param {string} root - The root to search for.
   * @param {string[] | "all"} searchChapters - The chapters to search in.
   * @returns {{ matchVerses: verseMatchResult[]; derivations: searchIndexProps[]; } | false} The verses that match the search.
   */
  searchByRoot = (root: string, searchChapters: string[] | "all") => {
    if (onlySpaces(root)) {
      return false;
    }

    const rootTarget = this.getRootByName(root);

    if (rootTarget === undefined) {
      return false;
    }

    const occurencesArray = rootTarget.occurences;

    const matchVerses: verseMatchResult[] = [];
    const derivations: searchIndexProps[] = [];

    if (searchChapters) {
      occurencesArray.forEach((item) => {
        const [verseRank, wordIndexes] = item.split(":");

        if (!verseRank || !wordIndexes) return;

        const currentVerse = this.getVerseByRank(verseRank);
        if (!currentVerse) return;

        if (
          searchChapters === "all" ||
          searchChapters.includes(currentVerse.suraid)
        ) {
          const wordIndexesArray = wordIndexes.split(",");

          const chapterName = this.getChapterName(currentVerse!.suraid);

          const { verseDerivations, verseResult } = getDerivationsInVerse(
            wordIndexesArray,
            currentVerse!,
            chapterName
          );

          derivations.push(...verseDerivations);
          matchVerses.push(verseResult);
        }
      });
    }

    if (matchVerses.length === 0) {
      return false;
    } else {
      return { matchVerses, derivations };
    }
  };

  /**
   * @function searchRoots
   * @description Searches for roots in the Quran.
   * @param {string} searchString - The string to search for.
   * @param {ISearchRootOptions} searchOptions - The search options.
   * @returns {rootProps[]} The roots that match the search.
   */
  searchRoots = (searchString: string, searchOptions?: ISearchRootOptions) => {
    if (onlySpaces(searchString)) return this.quranRoots;

    const { normalizeToken, normalizeRoot, searchInclusive } =
      searchOptions || {};

    const processedToken = normalizeToken
      ? normalizeAlif(searchString, true)
      : searchString;

    return this.quranRoots.filter(({ name }) => {
      const processedRoot = normalizeRoot ? normalizeAlif(name, true) : name;

      return (
        processedRoot.startsWith(processedToken) ||
        (normalizeRoot && name.startsWith(processedToken)) ||
        (searchInclusive && hasAllLetters(processedRoot, processedToken))
      );
    });
  };

  /**
   * @function getWordRoots
   * @description Gets the roots of a word in a verse.
   * @param {number} verseRank - The rank of the verse.
   * @param {number} wordIndex - The index of the word in the verse.
   * @returns {rootProps[]} The roots of the word.
   */
  getWordRoots = (verseRank: number, wordIndex: number) => {
    return this.quranRoots.filter((root) =>
      root.occurences.find((occ) => {
        const [verseRankIndex, wordIndexes] = occ.split(":");

        if (verseRankIndex !== verseRank.toString()) return false;

        const wordIndexesArray = wordIndexes!.split(",");

        return wordIndexesArray.includes(wordIndex.toString());
      })
    );
  };

  /**
   * @function hasConjunction
   * @description Checks if a word in a verse has a conjunction.
   * @param {number} verseRank - The rank of the verse.
   * @param {number} wordIndex - The index of the word in the verse.
   * @returns {boolean} True if the word has a conjunction, false otherwise.
   */
  hasConjunction = (verseRank: number, wordIndex: number) => {
    const conjunctions = this.quranRoots.find(
      (root) => root.name === "و"
    )!.occurences;

    const test = conjunctions.findIndex((occ) => {
      const [verseRankIndex, wordIndexes] = occ.split(":");

      if (verseRankIndex !== verseRank.toString()) return false;

      const wordIndexesArray = wordIndexes!.split(",");

      return wordIndexesArray.includes(wordIndex.toString());
    });

    return test != -1;
  };

  /**
   * @function getOccurencesData
   * @description Converts root occurrences into derivations and verses.
   * @param {string[]} rootOccurences - The root occurrences.
   * @returns {{ rootDerivations: searchIndexProps[]; rootVerses: verseMatchResult[]; }} The root derivations and verses.
   */
  getOccurencesData = (rootOccurences: string[]) => {
    const localDer: searchIndexProps[] = [];
    const localVerses: verseMatchResult[] = [];

    rootOccurences.forEach((occ) => {
      const [verseRankIndex, wordIndexes] = occ.split(":");

      const verse = this.getVerseByRank(verseRankIndex!);

      if (!verse) {
        throw new Error(`Couldn't retrieve verse by rank: ${verseRankIndex}`);
      }

      const wordIndexesArray = wordIndexes!.split(",");
      const verseWords = verse.versetext.split(" ");

      const chapterName = this.getChapterName(verse.suraid);
      const verseDerivations = wordIndexesArray.map((wordIndex) => ({
        name: verseWords[Number(wordIndex) - 1]!,
        key: verse.key,
        text: `${chapterName}:${verse.verseid}`,
        wordIndex,
      }));

      localDer.push(...verseDerivations);

      const verseParts = getRootMatches(verseWords, wordIndexesArray);

      localVerses.push({
        verseParts,
        key: verse.key,
        suraid: verse.suraid,
        verseid: verse.verseid,
      });
    });

    return { rootDerivations: localDer, rootVerses: localVerses };
  };

  /**
   * @function searchByRootIDs
   * @description Searches for verses containing any of the specified root IDs.
   * @param {string[]} rootsArray - An array of root IDs to search for.
   * @param {boolean} [sortVerses=true] - Whether to sort the verses by chapter and verse ID.
   * @returns {verseMatchResult[]} An array of verses that match the search.
   */
  searchByRootIDs = (rootsArray: string[], sortVerses: boolean = true) => {
    const matchVerses: verseMatchResult[] = [];
    const versesObject: versesObjectType = {};

    rootsArray.forEach((root_id) => {
      const rootTarget = this.getRootByID(root_id);

      if (!rootTarget) return;

      rootTarget.occurences.forEach((item) => {
        const [verseRank, wordIndexes] = item.split(":");

        // between 0 .. 6235
        if (!verseRank) return;

        const currentVerse = this.getVerseByRank(verseRank);
        if (!currentVerse) return;

        if (!wordIndexes) return;
        const wordIndexesArray = wordIndexes.split(",");

        if (versesObject[currentVerse.key]) {
          versesObject[currentVerse.key]!.wordIndexes = Array.from(
            new Set([
              ...versesObject[currentVerse.key]!.wordIndexes,
              ...wordIndexes,
            ])
          );
        } else {
          versesObject[currentVerse.key] = {
            verse: currentVerse,
            wordIndexes: wordIndexesArray,
          };
        }
      });
    });

    Object.keys(versesObject).forEach((verseKey) => {
      const currentVerse = versesObject[verseKey]!.verse;
      const chapterName = this.getChapterName(currentVerse.suraid);

      const { verseResult } = getDerivationsInVerse(
        versesObject[verseKey]!.wordIndexes,
        currentVerse,
        chapterName
      );

      matchVerses.push(verseResult);
    });

    if (!sortVerses) return matchVerses;

    return matchVerses.sort((verseA, verseB) => {
      const infoA = verseA.key.split("-");
      const infoB = verseB.key.split("-");
      if (Number(infoA[0]) !== Number(infoB[0]))
        return Number(infoA[0]) - Number(infoB[0]);
      else return Number(infoA[1]) - Number(infoB[1]);
    });
  };
}

export { quranClass };

export * from "./types";

export * from "./utils";

export * from "./consts";
