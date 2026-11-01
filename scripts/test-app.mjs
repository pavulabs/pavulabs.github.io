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

const betaSource = await readFile(new URL("../beta/app.js", import.meta.url), "utf8");

function startBeta({ saved = null, blocked = false } = {}) {
  const handlers = {};
  const writes = [];
  const element = (name) => ({
    attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    getAttribute(key) { return this.attributes[key] ?? null; },
    addEventListener(key, callback) { handlers[name + ":" + key] = callback; },
    classList: { toggle(key, value) { this[key] = value; } },
    focus() { this.focused = true; },
  });
  const language = element("language");
  const menu = element("menu");
  menu.setAttribute("aria-expanded", "false");
  const navigation = element("navigation");
  const brand = element("brand");
  const copy = { dataset: { en: "English content", zh: "中文内容" } };
  const document = {
    documentElement: {},
    querySelectorAll: () => [copy],
    querySelector: (selector) => ({
      ".language-button": language, ".menu-button": menu, ".brand": brand,
    })[selector],
    getElementById: (id) => id === "primary-navigation" ? navigation : {},
    addEventListener(key, callback) { handlers["document:" + key] = callback; },
  };
  const window = {
    get localStorage() {
      if (blocked) throw new Error("Storage blocked");
      return {
        getItem: () => saved,
        setItem: (key, value) => writes.push([key, value]),
      };
    },
    matchMedia: () => ({
      addEventListener(key, callback) { handlers["viewport:" + key] = callback; },
    }),
  };
  runInNewContext(betaSource, { document, window });
  return { document, language, menu, navigation, brand, copy, writes, handlers };
}

test("Beta preserves and switches language with or without browser storage", () => {
  for (const options of [{}, { saved: "zh" }, { saved: "invalid" }, { blocked: true }]) {
    const page = startBeta(options);
    const initiallyChinese = options.saved === "zh";
    assert.equal(page.document.documentElement.lang, initiallyChinese ? "zh-CN" : "en");
    page.handlers["language:click"]();
    assert.equal(page.document.documentElement.lang, initiallyChinese ? "en" : "zh-CN");
    assert.equal(page.copy.textContent, initiallyChinese ? "English content" : "中文内容");
    assert.equal(page.menu.attributes["aria-label"], initiallyChinese ? "Open navigation" : "打开导航");
    assert.equal(page.brand.attributes["aria-label"], initiallyChinese ? "Pavu home" : "Pavu 首页");
    assert.equal(page.writes.length, options.blocked ? 0 : 1);
  }
});

test("Beta mobile menu closes with Escape and restores focus", () => {
  const page = startBeta();
  page.handlers["menu:click"]();
  assert.equal(page.menu.attributes["aria-expanded"], "true");
  assert.equal(page.navigation.classList["is-open"], true);
  page.handlers["document:keydown"]({ key: "Escape" });
  assert.equal(page.menu.attributes["aria-expanded"], "false");
  assert.equal(page.navigation.classList["is-open"], false);
  assert.equal(page.menu.focused, true);
});

test("Beta mobile menu closes after navigation, outside clicks and desktop resize", () => {
  const page = startBeta();
  for (const close of [
    () => page.handlers["navigation:click"]({ target: { closest: () => ({}) } }),
    () => page.handlers["document:click"]({ target: { closest: () => null } }),
    () => page.handlers["viewport:change"]({ matches: true }),
  ]) {
    page.handlers["menu:click"]();
    assert.equal(page.menu.attributes["aria-expanded"], "true");
    close();
    assert.equal(page.menu.attributes["aria-expanded"], "false");
  }
});

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
