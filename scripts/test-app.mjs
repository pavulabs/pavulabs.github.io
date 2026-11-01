import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";

const sources = [
  ["Home", await readFile(new URL("../app.js", import.meta.url), "utf8")],
  ["Beta", await readFile(new URL("../beta/app.js", import.meta.url), "utf8")],
];

function startPage(source, { saved = null, failure } = {}) {
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
  const firstLink = element("firstLink");
  navigation.querySelector = (selector) => {
    assert.equal(selector, "a");
    return firstLink;
  };
  const brand = element("brand");
  const year = {};
  const copy = { dataset: { en: "English content", zh: "中文内容" } };
  const document = {
    documentElement: {},
    querySelectorAll: () => [copy],
    querySelector: (selector) => ({
      ".language-button": language, ".menu-button": menu, ".brand": brand,
    })[selector],
    getElementById: (id) => id === "primary-navigation" ? navigation : year,
    addEventListener(key, callback) { handlers["document:" + key] = callback; },
  };
  const blocked = () => { throw Object.assign(new Error("Storage unavailable"), { name: "SecurityError" }); };
  const window = {
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
    matchMedia: () => ({
      addEventListener(key, callback) { handlers["viewport:" + key] = callback; },
    }),
  };
  runInNewContext(source, { document, window });
  assert.equal(year.textContent, new Date().getFullYear());
  return { document, language, menu, navigation, firstLink, brand, copy, writes, handlers };
}

for (const [name, source] of sources) {
  for (const options of [
    {}, { saved: "zh" }, { saved: "invalid" },
    { failure: "access" }, { failure: "read" }, { failure: "write", saved: "zh" },
  ]) {
    test(name + " language: " + (options.failure || options.saved || "default"), () => {
      const page = startPage(source, options);
      const initial = options.saved === "zh" ? "zh" : "en";
      const sequence = [initial, initial === "zh" ? "en" : "zh", initial];
      for (const [index, language] of sequence.entries()) {
        if (index) page.handlers["language:click"]();
        const chinese = language === "zh";
        assert.equal(page.document.documentElement.lang, chinese ? "zh-CN" : "en");
        assert.equal(page.document.title, chinese ? "Pavu — 本机优先的应用安全" : "Pavu — Local-first application security");
        assert.equal(page.copy.textContent, page.copy.dataset[language]);
        assert.equal(page.language.textContent, chinese ? "EN" : "中文");
        assert.equal(page.language.attributes["aria-label"], chinese ? "Switch to English" : "切换为中文");
        assert.equal(page.menu.attributes["aria-label"], chinese ? "打开导航" : "Open navigation");
        assert.equal(page.navigation.attributes["aria-label"], chinese ? "主导航" : "Primary navigation");
        assert.equal(page.brand.attributes["aria-label"], chinese ? "Pavu 首页" : "Pavu home");
      }
      assert.deepEqual(page.writes, ["access", "write"].includes(options.failure)
        ? [] : sequence.slice(1).map((language) => ["pavu-language", language]));
    });
  }

  test(name + " menu opens at its first link for forward keyboard navigation", () => {
    const page = startPage(source);
    assert.equal(page.firstLink.focused, undefined);
    page.handlers["menu:click"]();
    assert.equal(page.firstLink.focused, true);
  });

  test(name + " menu closes with Escape and restores focus", () => {
    const page = startPage(source);
    page.handlers["menu:click"]();
    assert.equal(page.menu.attributes["aria-expanded"], "true");
    assert.equal(page.menu.attributes["aria-label"], "Close navigation");
    assert.equal(page.navigation.classList["is-open"], true);
    page.handlers["document:keydown"]({ key: "Escape" });
    assert.equal(page.menu.attributes["aria-expanded"], "false");
    assert.equal(page.navigation.classList["is-open"], false);
    assert.equal(page.menu.focused, true);
  });

  test(name + " menu closes after navigation, outside clicks and desktop resize", () => {
    const page = startPage(source);
    for (const close of [
      () => page.handlers["navigation:click"]({ target: { closest: () => ({}) } }),
      () => page.handlers["document:click"]({ target: { closest: () => null } }),
      () => page.handlers["viewport:change"]({ matches: true }),
    ]) {
      page.handlers["menu:click"]();
      page.handlers["document:click"]({ target: { closest: () => ({}) } });
      assert.equal(page.menu.attributes["aria-expanded"], "true");
      close();
      assert.equal(page.menu.attributes["aria-expanded"], "false");
    }
  });
}
