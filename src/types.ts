export interface chapterProps {
  id: number;
  name: string;
  transliteration: string;
}

export type verseProps = {
  key: string;
  suraid: string;
  verseid: string;
  versetext: string;
  rank: number;
};

export interface quranProps {
  id: number;
  verses: verseProps[];
}

export interface rootProps {
  id: number;
  name: string;
  count: string;
  occurences: string[];
}

export interface IMatch {
  text: string;
  isMatch: boolean;
}

export interface searchIndexProps {
  name: string;
  key: string;
  text: string;
  wordIndex: string;
}

export interface verseMatchResult {
  key: string;
  suraid: string;
  verseid: string;
  verseParts: IMatch[];
}
