const root = document.documentElement;

// ────────────── Dark / Light Toggle ──────────────
// The initial theme is applied by the inline script in <head>.
const modeToggle = document.getElementById("modeToggle");
const modeIcon = document.getElementById("modeIcon");
const SUN_ICON =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
const MOON_ICON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';

function renderModeIcon() {
  const dark = root.classList.contains("dark");
  modeToggle.setAttribute("aria-pressed", String(dark));
  modeIcon.innerHTML = dark ? SUN_ICON : MOON_ICON;
}

modeToggle.addEventListener("click", () => {
  const dark = root.classList.toggle("dark");
  localStorage.setItem("theme", dark ? "dark" : "light");
  renderModeIcon();
});
renderModeIcon();

// ────────────── Reveal sections as they scroll into view ──────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -10% 0px" }
);
document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));

// ────────────── Scroll-spy: highlight nav link for the section in view ──────────────
const spyLinks = document.querySelectorAll('nav .nav-link[href^="#"]');
const spyObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((e) => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    spyLinks.forEach((link) =>
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + visible.target.id)
    );
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
);
new Set(Array.from(spyLinks, (a) => a.getAttribute("href"))).forEach((href) => {
  const target = document.querySelector(href);
  if (target) spyObserver.observe(target);
});

// ────────────── Pagination (shared by gallery grid and publications) ──────────────
// `current` is 0-based; `onSelect` receives the chosen page index.
function renderPager(container, current, total, onSelect) {
  container.innerHTML = "";
  if (total <= 1) return;

  const addButton = (label, page, { active = false, disabled = false } = {}) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.className =
      "pagination-btn w-9 h-9 flex items-center justify-center rounded-full transition font-medium" +
      (active ? " is-active" : "") +
      (disabled ? " opacity-40 cursor-not-allowed" : "");
    btn.disabled = disabled;
    btn.addEventListener("click", () => onSelect(page));
    container.appendChild(btn);
  };

  addButton("‹", current - 1, { disabled: current === 0 });
  for (let i = 0; i < total; i++) addButton(i + 1, i, { active: i === current });
  addButton("›", current + 1, { disabled: current === total - 1 });
}

// ────────────── Gallery ──────────────
const gallery = document.getElementById("gallery");
const galleryPager = document.getElementById("pagination");
const scrollLeftBtn = document.getElementById("scroll-left");
const scrollRightBtn = document.getElementById("scroll-right");

const CAROUSEL_CLASSES = "flex flex-nowrap gap-6 mt-8 px-4 justify-center overflow-hidden";
const GRID_CLASSES =
  "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 px-4 justify-center";

let images = [];
let isGrid = false;
let galleryPage = 0;

// Carousel shows 1 card on phones, 2 on tablets, 3 on wide screens.
const wideMq = matchMedia("(min-width: 1100px)");
const tabletMq = matchMedia("(min-width: 640px)");
const perPage = () => (isGrid ? 9 : wideMq.matches ? 3 : tabletMq.matches ? 2 : 1);
const pageCount = () => Math.ceil(images.length / perPage());
// Thumbnails are 640px-wide copies of each image (see images/thumbs/).
const thumbOf = (src) => src.replace("images/", "images/thumbs/");

function galleryCard(img, index) {
  const title = img.caption.split(" (")[0];
  const meta = img.caption.match(/\((.*?)\)/)?.[1] || "";
  return `
    <div class="flex flex-col items-center w-64 sm:w-80 gap-2">
      <img src="${thumbOf(img.src)}" alt="${img.alt}" data-index="${index}"
           width="320" height="256" loading="lazy" decoding="async"
           class="h-52 sm:h-64 w-full rounded-2xl object-cover shadow hover:scale-[1.03] transition cursor-zoom-in bg-base-100/40" />
      <div class="text-center">
        <p class="text-lg font-serif italic text-base-800 dark:text-base-50">${title}</p>
        <p class="text-sm text-gray-500 italic">${meta}</p>
      </div>
    </div>`;
}

function renderGallery() {
  const start = galleryPage * perPage();
  gallery.className = isGrid ? GRID_CLASSES : CAROUSEL_CLASSES;
  gallery.innerHTML = images
    .slice(start, start + perPage())
    .map((img, i) => galleryCard(img, start + i))
    .join("");

  scrollLeftBtn.classList.toggle("hidden", isGrid || galleryPage === 0);
  scrollRightBtn.classList.toggle("hidden", isGrid || galleryPage >= pageCount() - 1);

  if (isGrid) {
    renderPager(galleryPager, galleryPage, pageCount(), (page) => {
      galleryPage = page;
      renderGallery();
    });
  } else {
    galleryPager.innerHTML = "";
  }
}

function moveCarousel(step) {
  const next = galleryPage + step;
  if (isGrid || next < 0 || next >= pageCount()) return;
  galleryPage = next;
  renderGallery();
}

for (const mq of [wideMq, tabletMq]) {
  mq.addEventListener("change", () => {
    galleryPage = 0;
    renderGallery();
  });
}

scrollLeftBtn.addEventListener("click", () => moveCarousel(-1));
scrollRightBtn.addEventListener("click", () => moveCarousel(1));
document.getElementById("toggle-grid").addEventListener("click", () => {
  isGrid = !isGrid;
  galleryPage = 0;
  renderGallery();
});

// Swipe on touch screens (50px threshold avoids triggering on taps).
let touchStartX = 0;
gallery.addEventListener("touchstart", (e) => (touchStartX = e.changedTouches[0].screenX), { passive: true });
gallery.addEventListener("touchend", (e) => {
  const deltaX = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(deltaX) > 50) moveCarousel(deltaX > 0 ? -1 : 1);
});

fetch("includes/gallery.json")
  .then((res) => {
    if (!res.ok) throw new Error("gallery.json not found");
    return res.json();
  })
  .then((data) => {
    images = data;
    // Shuffle so visitors see a different first page each time.
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }
    renderGallery();
  })
  .catch((err) => console.error("Error loading gallery:", err));

// ────────────── Lightbox ──────────────
const modal = document.getElementById("image-modal");
const modalImg = document.getElementById("modal-img");
const modalCaption = document.getElementById("modal-caption");
const modalDescription = document.getElementById("modal-description");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");
const modalClose = document.getElementById("close-modal");
let modalIndex = 0;
let lastFocused = null;

function showImage(index) {
  modalIndex = (index + images.length) % images.length;
  const image = images[modalIndex];
  modalImg.src = image.src;
  modalImg.alt = image.alt || image.caption || "";
  modalCaption.textContent = image.caption || "";
  modalDescription.textContent = image.description || "";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
  lastFocused?.focus();
}

gallery.addEventListener("click", (e) => {
  if (e.target.tagName !== "IMG") return;
  lastFocused = document.activeElement;
  showImage(Number(e.target.dataset.index));
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  modalClose.focus();
});

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
modalPrev.addEventListener("click", () => showImage(modalIndex - 1));
modalNext.addEventListener("click", () => showImage(modalIndex + 1));

// Keyboard nav + focus trap while the lightbox is open.
document.addEventListener("keydown", (e) => {
  if (modal.classList.contains("hidden")) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeModal();
  } else if (e.key === "ArrowRight") {
    showImage(modalIndex + 1);
  } else if (e.key === "ArrowLeft") {
    showImage(modalIndex - 1);
  } else if (e.key === "Tab") {
    e.preventDefault();
    const focusables = [modalPrev, modalNext, modalClose];
    const step = e.shiftKey ? -1 : 1;
    const idx = focusables.indexOf(document.activeElement);
    focusables[(idx + step + focusables.length) % focusables.length].focus();
  }
});

// ────────────── Publications ──────────────
const PUBS_PER_PAGE = 4;
const pubContainer = document.getElementById("publications-container");
const pubPager = document.getElementById("publication-pagination");
let publications = [];

function tagClass(tag) {
  const t = (tag || "").toLowerCase();
  if (t.includes("ndss")) return "tag--ndss";
  if (t.includes("sacmat")) return "tag--sacmat";
  if (t.includes("arxiv")) return "tag--arxiv";
  if (t.includes("icc")) return "tag--icc";
  if (t.includes("communications") || t.includes("journal")) return "tag--journal";
  return "tag--default";
}

function renderPublications(page) {
  const start = page * PUBS_PER_PAGE;
  pubContainer.innerHTML = publications
    .slice(start, start + PUBS_PER_PAGE)
    .map(
      (pub) => `
      <div class="entry-card">
        <div class="mb-2"><span class="tag ${tagClass(pub.tag)}">${pub.tag}</span></div>
        <h4 class="font-semibold leading-snug">
          <a href="${pub.link}" target="_blank" rel="noopener" class="text-accent hover:underline">${pub.title}</a>
        </h4>
        <p class="mt-1.5 text-sm text-base-700 leading-relaxed">${pub.authors}</p>
        ${pub.note ? `<p class="mt-1 text-xs italic text-base-600">${pub.note}</p>` : ""}
        <a href="${pub.pdf}" target="_blank" rel="noopener"
           class="mt-3 inline-flex items-center gap-1 rounded-full border border-accent/70 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent hover:bg-accent hover:text-base-50 transition">
          <svg class="icon h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M7 10l5 5 5-5M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
          PDF
        </a>
      </div>`
    )
    .join("");
  renderPager(pubPager, page, Math.ceil(publications.length / PUBS_PER_PAGE), renderPublications);
}

fetch("includes/publications.json")
  .then((res) => {
    if (!res.ok) throw new Error("publications.json not found");
    return res.json();
  })
  .then((data) => {
    publications = data;
    renderPublications(0);
  })
  .catch((err) => console.error("Failed to load publications:", err));

// ────────────── Footer year ──────────────
document.getElementById("year").textContent = new Date().getFullYear();

// ────────────── Back to Top ──────────────
const backBtn = document.getElementById("backToTop");
window.addEventListener("scroll", () => backBtn.classList.toggle("hidden", window.scrollY < 600), {
  passive: true,
});
backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ────────────── Mobile Menu ──────────────
const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

function setMenuOpen(open) {
  mobileMenu.classList.toggle("hidden", !open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenuOpen(mobileMenu.classList.contains("hidden"));
});
// Close on any click outside the menu, or on a link inside it.
document.addEventListener("click", (e) => {
  if (!mobileMenu.contains(e.target) || e.target.closest("a")) setMenuOpen(false);
});
