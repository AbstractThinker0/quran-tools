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

class quranClass {
  chapterNames: chapterProps[] = [];
  allQuranText: quranProps[] = [];
  quranRoots: rootProps[] = [];
  absoluteQuran: verseProps[] = [];

  isChaptersDataLoaded = false;
  isQuranDataLoaded = false;
  isRootsDataLoaded = false;

  async fetchData() {
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
      "https://github.com/AbstractThinker0/tadabor/raw/refs/heads/master/public/res/quranRoots-0.0.10.json"
    );

    const quranRoot = await quranRootsData.json();

    this.setRoots(quranRoot);
  }

  private onRootsLoadedCallback: (() => void) | null = null;

  // Register the onRootsLoaded event
  onRootsLoaded(callback: () => void) {
    this.onRootsLoadedCallback = callback;
  }

  setChapters(chaptersData: chapterProps[]) {
    this.chapterNames = chaptersData;

    this.isChaptersDataLoaded = true;
  }

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

  setRoots(rootsData: rootProps[]) {
    this.quranRoots = rootsData;
    this.isRootsDataLoaded = true;

    if (this.onRootsLoadedCallback) {
      this.onRootsLoadedCallback();
    }
  }

  getChapterName(suraid: string | number): string {
    const index = Number(suraid) - 1;

    if (this.chapterNames[index] == undefined) {
      throw new Error("getChapterName: Chapter names not loaded.");
    }

    return this.chapterNames[index].name;
  }

  getVerses(suraid: number | string) {
    const index = Number(suraid) - 1;

    if (this.allQuranText[index] == undefined) {
      throw new Error("getVerses: Quran text not loaded.");
    }

    return this.allQuranText[index].verses;
  }

  getVerseByKey(key: string) {
    const info = key.split("-");

    if (info[0] == undefined || info[1] == undefined) {
      throw new Error("getVerseByKey: Invalid key.");
    }

    return this.getVerses(info[0])[Number(info[1]) - 1];
  }

  getVerseTextByKey(key: string) {
    const verse = this.getVerseByKey(key);

    if (verse == undefined) {
      throw new Error("getVerseTextByKey: Invalid key.");
    }

    return verse.versetext;
  }

  getVerseByRank(rank: string | number) {
    return this.absoluteQuran[Number(rank)];
  }

  convertKeyToSuffix(key: string): string {
    const info = key.split("-");

    if (info[0] == undefined || info[1] == undefined) {
      throw new Error("convertKeyToSuffix: Invalid key.");
    }

    return `${this.getChapterName(info[0])}:${info[1]}`;
  }

  getRootByID = (rootID: string | number) => {
    const root = this.quranRoots.find((root) => root.id === Number(rootID));
    return root;
  };

  getRootNameByID = (rootID: string | number) => {
    return this.getRootByID(rootID)?.name;
  };

  getRootByName = (rootName: string) => {
    const root = this.quranRoots.find((root) => root.name === rootName);
    return root;
  };

  getLetterByKey = (verseKey: string, letterKey: string) => {
    const verse = this.getVerseByKey(verseKey);

    if (verse == undefined) {
      throw new Error("getLetterByKey: Invalid key (verse not found).");
    }

    const verseText = verse.versetext;
    const verseWords = verseText.split(" ");
    const letterIndexes = letterKey.split("-");

    const letterWord = verseWords[Number(letterIndexes[0])];

    if (letterWord == undefined) {
      throw new Error("getLetterByKey: Invalid key (word not found).");
    }

    const letterSplit =
      splitArabicLetters(letterWord)[Number(letterIndexes[1])];

    if (letterSplit == undefined) {
      throw new Error("getLetterByKey: Invalid key (letter not found).");
    }

    return removeDiacritics(letterSplit);
  };

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
        const info = item.split(":");

        const currentVerse = this.getVerseByRank(info[0]!);

        if (
          searchChapters === "all" ||
          searchChapters.includes(currentVerse!.suraid)
        ) {
          const wordIndexes = info[1]!.split(",");

          const chapterName = this.getChapterName(currentVerse!.suraid);

          const { verseDerivations, verseResult } = getDerivationsInVerse(
            wordIndexes,
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

  getWordRoots = (verseRank: number, wordIndex: number) => {
    return this.quranRoots.filter((root) =>
      root.occurences.find((occ) => {
        const rootData = occ.split(":");

        if (rootData[0] !== verseRank.toString()) return false;

        const wordIndexes = rootData[1]!.split(",");

        return wordIndexes.includes(wordIndex.toString());
      })
    );
  };

  // 0:1
  hasConjunction = (verseRank: number, wordIndex: number) => {
    const conjunctions = this.quranRoots.find(
      (root) => root.name === "و"
    )!.occurences;

    const test = conjunctions.findIndex((occ) => {
      const rootData = occ.split(":");

      if (rootData[0] !== verseRank.toString()) return false;

      const wordIndexes = rootData[1]!.split(",");

      return wordIndexes.includes(wordIndex.toString());
    });

    return test != -1;
  };

  // convert root occurences into derivations and verses
  getOccurencesData = (rootOccurences: string[]) => {
    const localDer: searchIndexProps[] = [];
    const localVerses: verseMatchResult[] = [];

    rootOccurences.forEach((occ) => {
      const occData = occ.split(":");
      const verse = this.getVerseByRank(occData[0]!);

      if (!verse) {
        throw new Error(`Couldn't retrieve verse by rank: ${occData[0]}`);
      }

      const wordIndexes = occData[1]!.split(",");
      const verseWords = verse.versetext.split(" ");

      const chapterName = this.getChapterName(verse.suraid);
      const verseDerivations = wordIndexes.map((wordIndex) => ({
        name: verseWords[Number(wordIndex) - 1]!,
        key: verse.key,
        text: `${chapterName}:${verse.verseid}`,
        wordIndex,
      }));

      localDer.push(...verseDerivations);

      const verseParts = getRootMatches(verseWords, wordIndexes);

      localVerses.push({
        verseParts,
        key: verse.key,
        suraid: verse.suraid,
        verseid: verse.verseid,
      });
    });

    return { rootDerivations: localDer, rootVerses: localVerses };
  };

  searchByRootIDs = (rootsArray: string[], sortVerses: boolean = true) => {
    const matchVerses: verseMatchResult[] = [];
    const versesObject: versesObjectType = {};

    rootsArray.forEach((root_id) => {
      const rootTarget = this.getRootByID(root_id);

      if (!rootTarget) return;

      rootTarget.occurences.forEach((item) => {
        const info = item.split(":");

        // between 0 .. 6235
        const verseRank = info[0]!;

        const currentVerse = this.getVerseByRank(verseRank)!;

        const wordIndexes = info[1]!.split(",");

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
            wordIndexes: wordIndexes,
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
