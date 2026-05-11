if (window.location.hostname === "t-449.github.io") {
  window.location.replace("https://t-449-github-io.onrender.com/");
}

// --------------------------------------------------------
// 1) A generic helper that returns a Promise which resolves
//    only after ‘url’ is fetched and its contents are inserted
//    into <div id="id">…</div> in index.html.
// --------------------------------------------------------
function loadPartial(id, url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`Could not load ${url} (status ${res.status})`);
      return res.text();
    })
    .then((html) => {
      // Insert the fetched HTML into the placeholder <div id="{id}"></div>
      const container = document.getElementById(id);
      if (!container) {
        throw new Error(`No element with id="${id}" found in index.html`);
      }
      container.innerHTML = html;
    });
}

// --------------------------------------------------------
// 2) Once the DOM is ready, fetch ALL partials in parallel,
//    then call initializeUI() after they’ve all loaded.
// --------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // List of sections you want to load. Make sure each ID matches
  // the <div id="…"></div> placeholder in index.html exactly,
  // and each URL points to the correct file path.
  const partialsToLoad = [
    { id: "nav",          url: "includes/nav.html" },
    { id: "hero",         url: "includes/hero.html" },
    { id: "quote",        url: "includes/quote.html" },
    { id: "about",        url: "includes/about.html" },
    { id: "research",     url: "includes/research.html" },
    { id: "news",         url: "includes/news.html" },
    { id: "cv",           url: "includes/cv.html" },
    { id: "publications", url: "includes/publications.html" },
    { id: "talks",        url: "includes/talks.html" },
    { id: "exposure",     url: "includes/exposure.html" },
    { id: "contact",      url: "includes/contact.html" },
    { id: "hobbies",      url: "includes/hobbies.html" },
    { id: "footer",       url: "includes/footer.html" },
  ];

  // Kick off all fetches in parallel:
  const loadPromises = partialsToLoad.map((p) => loadPartial(p.id, p.url));

  // When every single one is done, call initializeUI:
  Promise.all(loadPromises)
    .then(() => {
      initializeUI();
    })
    .catch((err) => {
      console.error("Error loading one or more partials:", err);
    });
});

// --------------------------------------------------------
// 3) initializeUI: runs only after ALL partials have finished.
//    Inside here, wire up dark/light toggle, ParticlesJS, AOS,
//    gallery logic, publication pagination, back-to-top button, etc.
// --------------------------------------------------------
function initializeUI() {
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.add(
      "relative",
      "before:absolute",
      "before:inset-x-0",
      "before:-bottom-1",
      "before:h-[2px]",
      "before:scale-x-0",
      "before:bg-accent",
      "before:transition-transform",
      "before:duration-370",   
      "before:origin-left",
      "hover:before:scale-x-100"
    );
  });

  // ────────────── Dark / Light Toggle ──────────────
  const toggle = document.getElementById("modeToggle");
  const icon   = document.getElementById("modeIcon");
  const root   = document.documentElement;

  if (toggle && icon) {
    function setMode(dark) {
      if (dark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
        toggle.setAttribute("aria-pressed", "true");
        icon.innerHTML =
          '<path d="M12 2a1 1 0 0 1 .993.883L13 3v1a1 1 0 0 1-1.993.117L11 4V3a1 1 0 0 1 1-1Zm5.657 3.343a1 1 0 0 1 1.32-.083l.094.083.707.707a1 1 0 0 1-1.32 1.497l-.094-.083-.707-.707a1 1 0 0 1 0-1.414ZM4.343 5.343a1 1 0 0 1 1.32-.083l.094.083.707.707a1 1 0 0 1-1.32 1.497l-.094-.083-.707-.707a1 1 0 0 1 0-1.414ZM12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4a1 1 0 0 1 .117 1.993L20 14h-1a1 1 0 0 1-.117-1.993L19 12h1ZM4 12a1 1 0 0 1 .117 1.993L4 14H3a1 1 0 0 1-.117-1.993L3 12h1Zm15.364 4.95a1 1 0 0 1 1.32 1.497l-.094.083-.707.707a1 1 0 0 1-1.497-1.32l.083-.094.707-.707ZM6.343 17.657a1 1 0 0 1 1.32 1.497l-.094.083-.707.707a1 1 0 0 1-1.497-1.32l.083-.094.707-.707ZM12 20a1 1 0 0 1 .993.883L13 21v1a1 1 0 0 1-1.993.117L11 22v-1a1 1 0 0 1 1-1Z"/>';
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
        toggle.setAttribute("aria-pressed", "false");
        icon.innerHTML =
          '<path d="M21 12.79A9 9 0 1 1 11.21 3c.09 0 .18 0 .27.01A7 7 0 0 0 21 12.79z"/>';
      }
    }

    toggle.addEventListener("click", () => {
      const isDark = root.classList.contains("dark");
      setMode(!isDark);
    });

    // First-load: explicit user choice wins, else fall back to system preference
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      setMode(saved === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark);
    }
  } else {
    console.warn("Dark/light toggle not found. Did nav.html load correctly?");
  }

  // ────────────── AOS (Animate On Scroll) ──────────────
  if (typeof AOS !== "undefined") {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      once: true,
      duration: reduceMotion ? 0 : 900,
      delay:    reduceMotion ? 0 : 100,
      disable:  reduceMotion,
      easing:   "ease-out-cubic",
    });
  } else {
    console.warn("AOS library not found. Did you include the CDN <script>?");
  }

  // ────────────── Scroll-spy: highlight nav link for the section in view ──────────────
  const spyLinks = document.querySelectorAll('nav .nav-link[href^="#"]');
  const spyTargets = Array.from(spyLinks)
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (spyTargets.length) {
    const setActive = (id) => {
      spyLinks.forEach((link) =>
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + id)
      );
    };

    const spyObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    spyTargets.forEach((t) => spyObserver.observe(t));
  }

  // ────────────── Gallery / Hobbies Logic ──────────────

  const gallery = document.getElementById("gallery");
  // Button position matches id: #scroll-left is on the left and goes to the previous
  // page; #scroll-right is on the right and advances. Keep them aligned.
  const scrollLeftBtn = document.getElementById("scroll-left");
  const scrollRightBtn = document.getElementById("scroll-right");
  const toggleGridBtn = document.getElementById("toggle-grid");

  let images = [];
  let currentPage = 1;
  const imagesPerPage = 9;
  let isGrid = false;
  let currentCarouselPage = 0;

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function renderPagination(totalPages) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    const maxVisible = 5;
    const createButton = (text, page, isActive = false, isDisabled = false) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.className = `pagination-btn px-3 py-1 rounded-full transition ${
        isActive ? "is-active" : ""
      } ${isDisabled ? "opacity-50 cursor-default" : ""}`;
      if (!isDisabled) {
        btn.onclick = () => {
          currentPage = page;
          renderImages(true);
        };
      }
      return btn;
    };

    // ◀ Prev
    pagination.appendChild(
      createButton("◀", currentPage - 1, false, currentPage === 1)
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      const isFirst = i === 1;
      const isLast = i === totalPages;
      const isNearCurrent = Math.abs(i - currentPage) <= 1;
      const isEdgeGroup = i <= 2 || i >= totalPages - 1;
      if (
        isFirst ||
        isLast ||
        isNearCurrent ||
        (currentPage <= 3 && i <= maxVisible) ||
        (currentPage >= totalPages - 2 && i >= totalPages - maxVisible + 1)
      ) {
        pagination.appendChild(createButton(i, i, currentPage === i));
      } else if (
        pagination.lastChild &&
        pagination.lastChild.textContent !== "…"
      ) {
        const dots = document.createElement("span");
        dots.textContent = "…";
        dots.className = "px-2 text-base-600";
        pagination.appendChild(dots);
      }
    }

    // ▶ Next
    pagination.appendChild(
      createButton("▶", currentPage + 1, false, currentPage === totalPages)
    );
  }

  // Build a <picture> with webp source + jpg fallback.
  function makeThumb(img, absoluteIndex, eager) {
    const picture = document.createElement("picture");
    const webpSrc = img.src.replace(/\.(jpe?g|png)$/i, ".webp");
    const source = document.createElement("source");
    source.type = "image/webp";
    source.srcset = webpSrc;
    picture.appendChild(source);

    const el = document.createElement("img");
    el.dataset.galleryIndex = String(absoluteIndex);
    el.width = 320;
    el.height = 256;
    el.src = img.src;
    el.alt = img.alt || "";
    el.loading = eager ? "eager" : "lazy";
    el.decoding = "async";
    if (eager) el.fetchPriority = "high";
    el.className =
      "h-64 w-full rounded-2xl object-cover shadow hover:scale-[1.03] transition cursor-zoom-in bg-base-100/40";
    picture.appendChild(el);
    return picture;
  }

  function renderImages(asGrid = false) {
    gallery.innerHTML = "";

    if (asGrid) {
      gallery.className =
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 px-4 transition-all duration-500 justify-center";
      gallery.style.overflow = "visible";

      const start = (currentPage - 1) * imagesPerPage;
      const paginatedImages = images.slice(start, start + imagesPerPage);
      const fragment = document.createDocumentFragment();

      paginatedImages.forEach((img, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "flex flex-col items-center w-80 gap-2";

        const absoluteIndex = start + index;
        const picture = makeThumb(img, absoluteIndex, index < 3);

        const caption = document.createElement("div");
        caption.className = "text-center";

        const title = document.createElement("p");
        title.className =
          "text-base font-serif font-semibold text-base-800 dark:text-base-50 italic tracking-wide";
        title.textContent = img.caption.split(" (")[0];

        const meta = document.createElement("p");
        meta.className = "text-sm text-gray-500 italic";
        const locationYear = img.caption.match(/\((.*?)\)/)?.[1] || "";
        meta.textContent = locationYear;

        caption.appendChild(title);
        caption.appendChild(meta);
        wrapper.appendChild(picture);
        wrapper.appendChild(caption);
        fragment.appendChild(wrapper);
      });

      gallery.appendChild(fragment);
      renderPagination(Math.ceil(images.length / imagesPerPage));
      scrollLeftBtn.style.display = "none";
      scrollRightBtn.style.display = "none";
    } else {
      gallery.className =
        "flex flex-nowrap gap-6 mt-8 px-4 transition-all duration-500 justify-center";
      gallery.style.overflow = "hidden";

      const fragment = document.createDocumentFragment();
      let pageWrapper = null;

      images.forEach((img, index) => {
        if (index % 3 === 0) {
          pageWrapper = document.createElement("div");
          pageWrapper.className =
            "flex flex-shrink-0 gap-6 w-full justify-center";
          fragment.appendChild(pageWrapper);
        }

        const wrapper = document.createElement("div");
        wrapper.className = "flex flex-col items-center w-80 gap-2";

        const picture = makeThumb(img, index, index < 3);

        const caption = document.createElement("div");
        caption.className = "text-center";

        const title = document.createElement("p");
        title.className =
          "text-base font-serif font-semibold text-base-800 dark:text-base-50 italic tracking-wide";
        title.textContent = img.caption.split(" (")[0];

        const meta = document.createElement("p");
        meta.className = "text-sm text-gray-500 italic";
        const locationYear = img.caption.match(/\((.*?)\)/)?.[1] || "";
        meta.textContent = locationYear;

        caption.appendChild(title);
        caption.appendChild(meta);
        wrapper.appendChild(picture);
        wrapper.appendChild(caption);
        pageWrapper.appendChild(wrapper);
      });

      gallery.appendChild(fragment);
      updateCarouselPage();

      if (currentCarouselPage === 0) {
        scrollLeftBtn.style.display = "none";
      }

      document.getElementById("pagination").innerHTML = "";
    }
  }

  function updateCarouselPage() {
    const pages = Array.from(gallery.children);
    pages.forEach((page, i) => {
      page.style.display = i === currentCarouselPage ? "flex" : "none";
    });

    const totalPages = Math.ceil(images.length / 3);
    scrollLeftBtn.style.display =
      currentCarouselPage > 0 ? "block" : "none";
    scrollRightBtn.style.display =
      currentCarouselPage < totalPages - 1 ? "block" : "none";
  }

  scrollRightBtn.onclick = () => {
    const totalPages = Math.ceil(images.length / 3);
    if (currentCarouselPage < totalPages - 1) {
      currentCarouselPage++;
      updateCarouselPage();
    }
  };

  scrollLeftBtn.onclick = () => {
    if (currentCarouselPage > 0) {
      currentCarouselPage--;
      updateCarouselPage();
    }
  };

  toggleGridBtn.onclick = () => {
    isGrid = !isGrid;
    if (isGrid) currentPage = 1;
    renderImages(isGrid);
  };

  // Fetch the gallery JSON (adjust the path if needed)
  fetch("includes/gallery.json", { cache: "force-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Gallery JSON not found");
      return response.json();
    })
    .then((data) => {
      images = data;
      shuffleArray(images);
      renderImages();
      if (!isGrid && currentCarouselPage === 0) {
        scrollLeftBtn.style.display = "none";
      }
    })
    .catch((err) => console.error("Error loading gallery:", err));
  
  // ───────── Swipe support for mobile on the carousel ─────────

  // Only attach swipe handlers when we’re in “carousel” mode (i.e. not grid)
  let touchStartX = 0;
  let touchEndX   = 0;

  // Helper to handle swipe direction
  function handleSwipe() {
    // threshold of ~50px to avoid accidental taps
    const deltaX = touchEndX - touchStartX;
    if (deltaX > 50) {
      // swiped right → show previous page
      if (currentCarouselPage > 0) {
        currentCarouselPage--;
        updateCarouselPage();
      }
    } else if (deltaX < -50) {
      // swiped left → show next page
      const totalPages = Math.ceil(images.length / 3);
      if (currentCarouselPage < totalPages - 1) {
        currentCarouselPage++;
        updateCarouselPage();
      }
    }
  }

  // Listen for touchstart/touchend on the gallery container
  gallery.addEventListener("touchstart", (e) => {
    if (!isGrid) {
      touchStartX = e.changedTouches[0].screenX;
    }
  });
  gallery.addEventListener("touchend", (e) => {
    if (!isGrid) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }
  });


  // ────────────── ** LIGHTBOX / MODAL LOGIC ** ──────────────

  // 1) Select all modal‐related elements now that #gallery (and #image-modal) exist:
  const modal            = document.getElementById("image-modal");
  const modalImg         = document.getElementById("modal-img");
  const modalCaption     = document.getElementById("modal-caption");
  const modalDescription = document.getElementById("modal-description");
  const prevBtn          = document.getElementById("modal-prev");
  const nextBtn          = document.getElementById("modal-next");
  const closeBtn         = document.getElementById("close-modal");

  // Safety check: if the modal doesn’t exist, skip wiring it up
  if (gallery && modal && modalImg && modalCaption && modalDescription && prevBtn && nextBtn && closeBtn) {
    let currentIndex = -1;
    let lastFocused = null;

    const showImageAt = (idx) => {
      currentIndex = (idx + images.length) % images.length;
      const image = images[currentIndex];
      // Match real src (post lazy-swap) OR data-src (pre-swap)
      modalImg.src           = image.src;
      modalImg.alt           = image.alt || image.caption || "";
      modalCaption.textContent     = image.caption  || "";
      modalDescription.textContent = image.description || "";
    };

    const openModal = (image) => {
      lastFocused = document.activeElement;
      showImageAt(images.indexOf(image));
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    };

    const closeModal = () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    };

    // 2) Open via thumbnail click — resolve image via stored data-index when present,
    //    fall back to src matching (works for lazy-loaded thumbs once swapped).
    gallery.addEventListener("click", function (e) {
      if (e.target.tagName !== "IMG") return;
      const idxAttr = e.target.dataset.galleryIndex;
      let image;
      if (idxAttr !== undefined) {
        image = images[Number(idxAttr)];
      } else {
        const clickedSrc = e.target.src;
        image = images.find((imgObj) => clickedSrc.includes(imgObj.src));
      }
      if (image) openModal(image);
    });

    // 3) Close on × or backdrop:
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // 4) Prev / Next:
    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentIndex > -1) showImageAt(currentIndex - 1);
    });
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (currentIndex > -1) showImageAt(currentIndex + 1);
    });

    // 5) Keyboard nav + simple focus trap (Esc / ←/→ / Tab loops inside)
    document.addEventListener("keydown", (e) => {
      if (modal.classList.contains("hidden")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      } else if (e.key === "ArrowRight") {
        showImageAt(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        showImageAt(currentIndex - 1);
      } else if (e.key === "Tab") {
        const focusables = [prevBtn, nextBtn, closeBtn];
        const idx = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const next = e.shiftKey
          ? focusables[(idx - 1 + focusables.length) % focusables.length]
          : focusables[(idx + 1) % focusables.length];
        next.focus();
      }
    });
  } else {
    console.warn("Lightbox modal elements not found—did hobbies.html include the modal markup?");
  }

  // ────────────── Publication Pagination Logic ──────────────
  const itemsPerPage = 4;
  let currentPubPage = 1;
  let publications = [];

  function renderPublications() {
    const container = document.getElementById("publications-container");
    const pagination = document.getElementById("publication-pagination");
    container.innerHTML = "";
    pagination.innerHTML = "";

    const start = (currentPubPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentItems = publications.slice(start, end);

    const tagClass = (tag) => {
      const t = (tag || "").toLowerCase();
      if (t.includes("ndss"))   return "tag--ndss";
      if (t.includes("sacmat")) return "tag--sacmat";
      if (t.includes("arxiv"))  return "tag--arxiv";
      if (t.includes("icc"))    return "tag--icc";
      if (t.includes("communications") || t.includes("journal")) return "tag--journal";
      return "tag--default";
    };

    currentItems.forEach((pub) => {
      const div = document.createElement("div");
      div.className = "entry-card";
      div.innerHTML = `
        <div class="mb-2"><span class="tag ${tagClass(pub.tag)}">${pub.tag}</span></div>
        <h4 class="font-semibold leading-snug">
          <a href="${pub.link}" target="_blank" rel="noopener" class="text-accent hover:underline">${pub.title}</a>
        </h4>
        <p class="mt-1.5 text-sm text-base-700 leading-relaxed">${pub.authors}</p>
        ${pub.note ? `<p class="mt-1 text-xs italic text-base-600">${pub.note}</p>` : ""}
        <a href="${pub.pdf}" target="_blank" rel="noopener"
           class="mt-3 inline-flex items-center gap-1 rounded-full border border-accent/70 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent hover:bg-accent hover:text-base-50 transition">
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3a1 1 0 0 1 1 1v8.6l2.3-2.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L11 12.6V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 2 0v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-1Z"/>
          </svg>
          PDF
        </a>`;
      container.appendChild(div);
    });

    const totalPages = Math.ceil(publications.length / itemsPerPage);
    if (totalPages <= 1) return;

    const createBtn = (label, page, disabled = false, active = false) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = `pagination-btn w-9 h-9 flex items-center justify-center rounded-full transition font-medium ${
        active ? "is-active" : ""
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`;
      if (!disabled) {
        btn.onclick = () => {
          currentPubPage = page;
          renderPublications();
        };
      }
      return btn;
    };

    pagination.appendChild(
      createBtn("◀", currentPubPage - 1, currentPubPage === 1)
    );

    for (let i = 1; i <= totalPages; i++) {
      pagination.appendChild(
        createBtn(i, i, false, i === currentPubPage)
      );
    }

    pagination.appendChild(
      createBtn("▶", currentPubPage + 1, currentPubPage === totalPages)
    );
  }

  fetch("includes/publications.json")
    .then((res) => {
      if (!res.ok) throw new Error("publications.json not found");
      return res.json();
    })
    .then((data) => {
      publications = data;
      renderPublications();
    })
    .catch((err) => console.error("Failed to load publications:", err));

  // ────────────── Footer year ──────────────
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ────────────── “Back to Top” Button Logic ──────────────
  const backBtn = document.getElementById("backToTop");
  if (backBtn) {
    window.addEventListener("scroll", () => {
      backBtn.classList.toggle("hidden", window.scrollY < 600);
    });
    backBtn.onclick = () =>
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ────────────── Mobile Menu Toggle (NAV) ──────────────
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    const syncAria = () => {
      const open = !mobileMenu.classList.contains("hidden");
      menuToggle.setAttribute("aria-expanded", String(open));
    };
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("hidden");
      syncAria();
    });
    document.addEventListener("click", (event) => {
      const isClickInsideMenu = mobileMenu.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);
      if (!isClickInsideMenu && !isClickOnToggle) {
        mobileMenu.classList.add("hidden");
        syncAria();
      }
    });
    document.querySelectorAll("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        syncAria();
      });
    });
    syncAria();
  }

  // ────────────── Contact Envelope Toggle ──────────────
  const mailToggleBtn = document.querySelector("#contact button[aria-label='Compose Email']");
  const mailForm = document.getElementById("mailForm");
  const iconClosed = document.getElementById("iconClosed");
  const iconOpen = document.getElementById("iconOpen");

  if (mailToggleBtn && mailForm && iconClosed && iconOpen) {
    mailToggleBtn.addEventListener("click", () => {
      const isHidden = mailForm.classList.contains("hidden");

      mailForm.classList.toggle("hidden");
      iconClosed.classList.toggle("hidden", !isHidden);
      iconOpen.classList.toggle("hidden", isHidden);
    });
  } else {
    console.warn("Contact envelope toggle elements not found. Check contact.html or ID mismatches.");
  }

  // ────────────── Send Mail using Default App ──────────────

  const sendBtn = document.getElementById("mailSend");
  const messageInput = document.getElementById("mailMessage");

  if (sendBtn && messageInput) {
    sendBtn.addEventListener("click", () => {
      const msg = messageInput.value.trim();
      if (msg !== "") {
        const mailtoLink = `mailto:mallick.tu@northeastern.edu?subject=Message from Website&body=${encodeURIComponent(msg)}`;
        window.location.href = mailtoLink;

        // Delay hiding the form so mail client can open first
        setTimeout(() => {
          mailForm.classList.add("hidden");
          iconOpen.classList.remove("hidden");
          iconClosed.classList.add("hidden");
          messageInput.value = ""; // Optional: clear the input
        }, 500);
      } else {
        alert("Please write a message before sending.");
      }
    });
  } else {
    console.warn("Send button or message input not found.");
  }


}
