// jest.setup.ts
import { quranClass } from "../src/index";

export let quranInstance: quranClass;

beforeAll(async () => {
  quranInstance = new quranClass();
  await quranInstance.fetchData();
}, 60000);
