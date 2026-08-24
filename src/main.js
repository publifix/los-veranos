import "../src/style.css";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const header = document.getElementById("site-header");
const hero = document.getElementById("inicio");
const progressBar = document.getElementById("scroll-progress");
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

/* ---------------- Smooth scroll (Lenis) ---------------- */
let lenis = null;
if (!prefersReducedMotion) {
  lenis = new Lenis({ duration: 1.05, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------------- Header: transparent -> solid, hide/show ---------------- */
let lastY = window.scrollY;
let menuOpen = false;

function updateHeader() {
  const y = window.scrollY;
  const heroBottom = hero ? hero.offsetHeight - header.offsetHeight : 80;
  header.classList.toggle("is-solid", y > heroBottom * 0.72);

  if (!menuOpen) {
    const scrollingDown = y > lastY;
    header.classList.toggle("is-hidden", scrollingDown && y > header.offsetHeight * 1.4);
  }
  lastY = y;
}

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
}

window.addEventListener(
  "scroll",
  () => {
    updateHeader();
    updateProgress();
  },
  { passive: true }
);
updateHeader();
updateProgress();

/* ---------------- Mobile menu ---------------- */
const menuLinks = mobileMenu.querySelectorAll("a");

function openMenu() {
  menuOpen = true;
  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.classList.add("is-active");
  document.documentElement.classList.add("menu-open");
  header.classList.remove("is-hidden");
  window.setTimeout(() => menuLinks[0]?.focus({ preventScroll: true }), 260);
}

function closeMenu() {
  menuOpen = false;
  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.classList.remove("is-active");
  document.documentElement.classList.remove("menu-open");
  menuToggle.focus({ preventScroll: true });
}

menuToggle.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));
menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuOpen) closeMenu();
});

/* ---------------- Anchor smooth-scroll ---------------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -72 });
    } else {
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
  });
});

/* ---------------- Scroll reveals + stagger ---------------- */
if (prefersReducedMotion) {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
} else {
  document.querySelectorAll("[data-reveal]:not([data-stagger] [data-reveal])").forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      }
    );
  });

  document.querySelectorAll("[data-stagger]").forEach((group) => {
    const items = group.querySelectorAll("[data-reveal-item]");
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 32 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.8,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: group, start: "top 82%", once: true },
      }
    );
  });

  /* ---------------- Hero parallax ---------------- */
  const heroBg = document.querySelector("[data-parallax]");
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 14,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    });
  }

  document.querySelectorAll("[data-parallax-soft]").forEach((el) => {
    gsap.to(el, {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

/* ---------------- Cabañas: crossfade del visual sticky ---------------- */
const cabinVisual = document.querySelector("[data-cabin-visual]");
if (cabinVisual && "IntersectionObserver" in window) {
  const images = cabinVisual.querySelectorAll("[data-cabin-image]");
  const panels = document.querySelectorAll("[data-cabin-panel]");
  const setActive = (name) => {
    images.forEach((img) => img.classList.toggle("is-active", img.dataset.cabinImage === name));
  };
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.dataset.cabinPanel);
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  panels.forEach((panel) => io.observe(panel));
}

window.addEventListener("load", () => ScrollTrigger.refresh());
