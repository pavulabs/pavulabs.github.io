// Language toggle for the license page; shares the stored preference with the home page.
const translatable = document.querySelectorAll("[data-en][data-zh]");
const languageButton = document.querySelector(".language-button");
let language = "en";
try {
  if (window.localStorage.getItem("pavu-language") === "zh") language = "zh";
} catch {
  // Storage may be disabled; English stays the default.
}

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh" ? "Pavu — 许可证" : "Pavu — Licenses";
  translatable.forEach((element) => {
    element.textContent = element.dataset[language];
  });
  languageButton.textContent = language === "zh" ? "EN" : "中文";
  languageButton.setAttribute("aria-label", language === "zh" ? "Switch to English" : "切换为中文");
}

languageButton.addEventListener("click", () => {
  const nextLanguage = language === "zh" ? "en" : "zh";
  applyLanguage(nextLanguage);
  try {
    window.localStorage.setItem("pavu-language", nextLanguage);
  } catch {
    // Keep the selected language for this page even when it cannot be saved.
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
applyLanguage(language);
