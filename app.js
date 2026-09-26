const translatable = document.querySelectorAll("[data-en][data-zh]");
const languageButton = document.querySelector(".language-button");
const preferredLanguage = window.localStorage.getItem("pavu-language");
let language = preferredLanguage === "zh" ? "zh" : "en";

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

const background = document.querySelector(".network-background");
const context = background.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let points = [];
let animationFrame;

function resizeBackground() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;
  background.width = Math.round(width * pixelRatio);
  background.height = Math.round(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const pointCount = Math.min(90, Math.max(28, Math.round((width * height) / 19000)));
  points = Array.from({ length: pointCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.7 + Math.random() * 1.5,
    velocityX: (Math.random() - 0.5) * 0.13,
    velocityY: (Math.random() - 0.5) * 0.13,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawBackground(time = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  context.clearRect(0, 0, width, height);

  points.forEach((point, index) => {
    if (!reduceMotion.matches) {
      point.x = (point.x + point.velocityX + width) % width;
      point.y = (point.y + point.velocityY + height) % height;
    }

    for (let nextIndex = index + 1; nextIndex < points.length; nextIndex += 1) {
      const nextPoint = points[nextIndex];
      const xDistance = nextPoint.x - point.x;
      const yDistance = nextPoint.y - point.y;
      const distance = Math.hypot(xDistance, yDistance);

      if (distance < 118) {
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(nextPoint.x, nextPoint.y);
        context.strokeStyle = `rgba(42, 168, 255, ${0.055 * (1 - distance / 118)})`;
        context.stroke();
      }
    }

    const shimmer = reduceMotion.matches ? 0.52 : 0.42 + Math.sin(time * 0.0007 + point.phase) * 0.16;
    context.beginPath();
    context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(44, 234, 217, ${shimmer})`;
    context.fill();
  });

  if (!reduceMotion.matches && !document.hidden) {
    animationFrame = window.requestAnimationFrame(drawBackground);
  }
}

function restartBackground() {
  window.cancelAnimationFrame(animationFrame);
  drawBackground();
}

window.addEventListener("resize", () => {
  resizeBackground();
  restartBackground();
});
reduceMotion.addEventListener("change", restartBackground);
document.addEventListener("visibilitychange", restartBackground);

resizeBackground();
drawBackground();
