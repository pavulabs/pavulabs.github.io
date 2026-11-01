// Language preference and accessible navigation for the beta preview.
const translatable = document.querySelectorAll("[data-en][data-zh]");
const languageButton = document.querySelector(".language-button");
const menuButton = document.querySelector(".menu-button");
const navigation = document.getElementById("primary-navigation");
let language = "en";

try {
  if (window.localStorage.getItem("pavu-language") === "zh") language = "zh";
} catch {
  // The language toggle also works when browser storage is unavailable.
}

function applyLanguage() {
  const chinese = language === "zh";
  document.documentElement.lang = chinese ? "zh-CN" : "en";
  document.title = chinese ? "Pavu — 本机优先的应用安全" : "Pavu — Local-first application security";
  translatable.forEach((element) => { element.textContent = element.dataset[language]; });
  languageButton.textContent = chinese ? "EN" : "中文";
  languageButton.setAttribute("aria-label", chinese ? "Switch to English" : "切换为中文");
  navigation.setAttribute("aria-label", chinese ? "主导航" : "Primary navigation");
  document.querySelector(".brand").setAttribute("aria-label", chinese ? "Pavu 首页" : "Pavu home");
  updateMenuLabel();
}

function updateMenuLabel() {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-label", language === "zh"
    ? (expanded ? "关闭导航" : "打开导航")
    : (expanded ? "Close navigation" : "Open navigation"));
}

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
  updateMenuLabel();
  if (open) navigation.querySelector("a")?.focus();
}

languageButton.addEventListener("click", () => {
  language = language === "en" ? "zh" : "en";
  applyLanguage();
  try { window.localStorage.setItem("pavu-language", language); } catch { /* Session-only preference. */ }
});

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) setMenu(false);
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) setMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuButton.focus();
  }
});
window.matchMedia("(min-width: 651px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});
document.getElementById("year").textContent = new Date().getFullYear();
applyLanguage();
