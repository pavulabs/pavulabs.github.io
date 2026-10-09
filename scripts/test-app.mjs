import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");

function startPage({ saved = null, failure } = {}) {
  const listeners = {};
  const writes = [];
  const copy = { dataset: { en: "English content", zh: "中文内容" } };
  const button = {
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, callback) { listeners[name] = callback; },
  };
  const year = {};
  let frames = 0;
  const canvas = {
    getContext: () => Object.fromEntries(
      ["setTransform", "clearRect", "beginPath", "moveTo", "lineTo", "stroke", "arc", "fill"]
        .map((name) => [name, () => {}]),
    ),
  };
  const document = {
    documentElement: {},
    querySelectorAll: () => [copy],
    querySelector: (selector) => selector === ".language-button" ? button : canvas,
    getElementById: () => year,
    addEventListener() {},
  };
  const blocked = () => { throw Object.assign(new Error("Storage is unavailable"), { name: "SecurityError" }); };
  const window = {
    innerWidth: 800, innerHeight: 600,
    addEventListener() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    cancelAnimationFrame() {},
    requestAnimationFrame() { frames += 1; return frames; },
    get localStorage() {
      if (failure === "access") blocked();
      return {
        getItem(key) {
          assert.equal(key, "pavu-language");
          if (failure === "read") blocked();
          return saved;
        },
        setItem(key, value) {
          if (failure === "write") blocked();
          writes.push([key, value]);
        },
      };
    },
  };
  runInNewContext(source, { document, window });
  assert.equal(year.textContent, new Date().getFullYear());
  assert.equal(frames, 1, "Background initialization must complete");
  return { document, copy, button, writes, click: () => listeners.click() };
}

for (const options of [
  {}, { saved: "zh" }, { saved: "invalid" },
  { failure: "access" }, { failure: "read" }, { failure: "write", saved: "zh" },
]) {
  test(`Language behavior: ${options.failure || options.saved || "default"}`, () => {
    const page = startPage(options);
    const initial = options.saved === "zh" ? "zh" : "en";
    const sequence = [initial, initial === "en" ? "zh" : "en", initial];
    for (const [index, language] of sequence.entries()) {
      if (index) page.click();
      assert.equal(page.document.documentElement.lang, language === "zh" ? "zh-CN" : "en");
      assert.equal(page.document.title, language === "zh" ? "Pavu — 本机优先的应用安全" : "Pavu — Local-first application security");
      assert.equal(page.copy.textContent, page.copy.dataset[language]);
      assert.equal(page.button.textContent, language === "zh" ? "EN" : "中文");
      assert.equal(page.button.attributes["aria-label"], language === "zh" ? "Switch to English" : "切换为中文");
    }
    assert.deepEqual(page.writes, ["access", "write"].includes(options.failure)
      ? [] : sequence.slice(1).map((language) => ["pavu-language", language]));
  });
}
