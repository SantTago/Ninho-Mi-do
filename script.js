document.documentElement.classList.add("js");

// Cole abaixo o link final do checkout da Kiwify.
// Exemplo: https://pay.kiwify.com.br/AbCd123
const KIWIFY_CHECKOUT_URL = "https://pay.kiwify.com.br/Zte7u1P";

// CONTROLE DA OFERTA DE LANÇAMENTO
// Troque false por true para iniciar a promoção de 4 dias.
const PROMOTION_ENABLED = false;
const PROMOTION_DURATION_DAYS = 4;

// Opcional: preencha para todos os visitantes terminarem juntos.
// Exemplo: "2026-09-20T23:59:59-03:00"
const PROMOTION_FIXED_END_DATE = "";
const PROMOTION_CAMPAIGN_ID = "lancamento-bichinhos-v1";

const PROMOTIONAL_PRICE = "19,90";
const REGULAR_PRICE = "29,90";

const checkoutLinks = document.querySelectorAll(".checkout-link");
const isCheckoutConfigured = !KIWIFY_CHECKOUT_URL.includes("SEU_CHECKOUT");

checkoutLinks.forEach((link) => {
  if (isCheckoutConfigured) {
    link.href = KIWIFY_CHECKOUT_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  } else {
    link.href = "#oferta";
  }
});

const promotionPanel = document.getElementById("promotion-panel");
const offerBadge = document.getElementById("offer-badge");
const regularPriceLabel = document.getElementById("regular-price-label");
const oldPrice = document.getElementById("old-price");
const mobilePriceLabel = document.getElementById("mobile-price-label");
const priceFields = document.querySelectorAll("[data-product-price]");
const countdownFields = {
  days: document.getElementById("count-days"),
  hours: document.getElementById("count-hours"),
  minutes: document.getElementById("count-minutes"),
  seconds: document.getElementById("count-seconds")
};

function updatePriceDisplay(promotionActive) {
  priceFields.forEach((field) => {
    field.textContent = promotionActive ? PROMOTIONAL_PRICE : REGULAR_PRICE;
  });

  if (promotionPanel) promotionPanel.hidden = !promotionActive;
  if (oldPrice) oldPrice.hidden = !promotionActive;
  if (regularPriceLabel) regularPriceLabel.hidden = promotionActive;
  if (offerBadge) offerBadge.textContent = promotionActive ? "OFERTA DE LANÇAMENTO" : "JÁ DISPONÍVEL";
  if (mobilePriceLabel) mobilePriceLabel.textContent = promotionActive ? "OFERTA DE LANÇAMENTO" : "VALOR DO PRODUTO";
}

function getPromotionEndTime() {
  if (PROMOTION_FIXED_END_DATE) {
    const fixedEnd = new Date(PROMOTION_FIXED_END_DATE).getTime();
    return Number.isFinite(fixedEnd) ? fixedEnd : 0;
  }

  const storageKey = `ninho-miudo-${PROMOTION_CAMPAIGN_ID}-fim`;
  try {
    const savedEnd = Number(localStorage.getItem(storageKey));
    if (savedEnd > 0) return savedEnd;

    const newEnd = Date.now() + PROMOTION_DURATION_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(storageKey, String(newEnd));
    return newEnd;
  } catch (error) {
    return Date.now() + PROMOTION_DURATION_DAYS * 24 * 60 * 60 * 1000;
  }
}

function startPromotionCountdown() {
  if (!PROMOTION_ENABLED) {
    updatePriceDisplay(false);
    return;
  }

  const endTime = getPromotionEndTime();
  const pad = (value) => String(value).padStart(2, "0");
  let timerId;

  const renderCountdown = () => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      updatePriceDisplay(false);
      if (timerId) window.clearInterval(timerId);
      return;
    }

    updatePriceDisplay(true);
    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    };

    Object.entries(values).forEach(([key, value]) => {
      if (countdownFields[key]) countdownFields[key].textContent = pad(value);
    });
  };

  renderCountdown();
  timerId = window.setInterval(renderCountdown, 1000);
}

startPromotionCountdown();

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".nav");

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Abrir menu");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.focus();
    }
  });
}

document.querySelectorAll(".faq-item button").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    const willOpen = !item.classList.contains("open");

    document.querySelectorAll(".faq-item").forEach((other) => {
      other.classList.remove("open");
      other.querySelector("button").setAttribute("aria-expanded", "false");
    });

    if (willOpen) {
      item.classList.add("open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  reveals.forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((element) => observer.observe(element));
}

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
