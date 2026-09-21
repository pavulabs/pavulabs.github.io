const translatable = document.querySelectorAll("[data-en][data-zh]");
const languageButton = document.querySelector(".language-button");
const preferredLanguage = window.localStorage.getItem("pavu-language");
let language = preferredLanguage || (navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en");

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = language === "zh" ? "Pavu — 本机优先的网络安全" : "Pavu — Local-first network security";

  translatable.forEach((element) => {
    element.textContent = element.dataset[language];
  });

  languageButton.textContent = language === "zh" ? "EN" : "中文";
  languageButton.setAttribute(
    "aria-label",
    language === "zh" ? "Switch to English" : "切换为中文",
  );
}

languageButton.addEventListener("click", () => {
  const nextLanguage = language === "zh" ? "en" : "zh";
  window.localStorage.setItem("pavu-language", nextLanguage);
  applyLanguage(nextLanguage);
});

document.getElementById("year").textContent = new Date().getFullYear();
applyLanguage(language);
