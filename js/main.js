// main.js

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
    { id: "news",         url: "includes/news.html" },
    { id: "cv",           url: "includes/cv.html" },
    { id: "publications", url: "includes/publications.html" },
    { id: "contact",      url: "includes/contact.html" },
    { id: "hobbies",      url: "includes/hobbies.html" },
    { id: "footer",       url: "includes/footer.html" },
  ];

  // Kick off all fetches in parallel:
  const loadPromises = partialsToLoad.map((p) => loadPartial(p.id, p.url));

  // When every single one is done, call initializeUI:
  Promise.all(loadPromises)
    .then(() => {
      // At this point:
      // - <button id="modeToggle"> and <svg id="modeIcon"> (from nav) exist
      // - <div id="particles-js"> (from hero) exists
      // - <div id="about">, <div id="news">, etc. exist
      // Now we can safely wire up all interactivity without any race conditions.
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
  // ────────────── Dark / Light Toggle ──────────────
  const toggle = document.getElementById("modeToggle");
  const icon   = document.getElementById("modeIcon");
  const root   = document.documentElement;

  if (toggle && icon) {
    function setMode(dark) {
      if (dark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
        icon.innerHTML =
          '<path d="M12 2a1 1 0 0 1 .993.883L13 3v1a1 1 0 0 1-1.993.117L11 4V3a1 1 0 0 1 1-1Zm5.657 3.343a1 1 0 0 1 1.32-.083l.094.083.707.707a1 1 0 0 1-1.32 1.497l-.094-.083-.707-.707a1 1 0 0 1 0-1.414ZM4.343 5.343a1 1 0 0 1 1.32-.083l.094.083.707.707a1 1 0 0 1-1.32 1.497l-.094-.083-.707-.707a1 1 0 0 1 0-1.414ZM12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8 4a1 1 0 0 1 .117 1.993L20 14h-1a1 1 0 0 1-.117-1.993L19 12h1ZM4 12a1 1 0 0 1 .117 1.993L4 14H3a1 1 0 0 1-.117-1.993L3 12h1Zm15.364 4.95a1 1 0 0 1 1.32 1.497l-.094.083-.707.707a1 1 0 0 1-1.497-1.32l.083-.094.707-.707ZM6.343 17.657a1 1 0 0 1 1.32 1.497l-.094.083-.707.707a1 1 0 0 1-1.497-1.32l.083-.094.707-.707ZM12 20a1 1 0 0 1 .993.883L13 21v1a1 1 0 0 1-1.993.117L11 22v-1a1 1 0 0 1 1-1Z"/>';
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
        icon.innerHTML =
          '<path d="M21 12.79A9 9 0 1 1 11.21 3c.09 0 .18 0 .27.01A7 7 0 0 0 21 12.79z"/>';
      }
    }

    // On click: toggle between dark/light
    toggle.addEventListener("click", () => {
      const isDark = root.classList.contains("dark");
      setMode(!isDark);
    });

    // On page load: restore saved mode
    const saved = localStorage.getItem("theme");
    setMode(saved === "dark");
  } else {
    console.warn("Dark/light toggle not found. Did nav.html load correctly?");
  }

  // ────────────── AOS (Animate On Scroll) ──────────────
  if (typeof AOS !== "undefined") {
    AOS.init({
      once: true,
      duration: 900,
      delay:    100,
      easing:   "ease-out-cubic",
    });
  } else {
    console.warn("AOS library not found. Did you include the CDN <script>?");
  }

  // ────────────── ParticlesJS (Background Animation) ──────────────
  const pContainer = document.getElementById("particles-js");
  if (pContainer && typeof particlesJS !== "undefined") {
    particlesJS("particles-js", {
      particles: {
        number: { value: 100, density: { enable: true, value_area: 900 } },
        color: { value: "#4c93ff" },
        shape: {
          type: "circle",
          stroke: { width: 0, color: "#000" },
        },
        opacity: {
          value: 0.45,
          random: true,
          anim: { enable: true, speed: 0.8, opacity_min: 0.3, sync: false },
        },
        size: {
          value: 4.5,
          random: true,
          anim: { enable: true, speed: 2, size_min: 0.5, sync: false },
        },
        line_linked: {
          enable: true,
          distance: 140,
          color: "#4c93ff",
          opacity: 0.3,
          width: 1.5,
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: false, mode: "grab" },
          onclick: { enable: false },
          resize: true,
        },
        modes: {
          grab: { distance: 160, line_linked: { opacity: 0.4 } },
        },
      },
      retina_detect: true,
    });
  } else {
    console.warn("particlesJS container or library missing.");
  }

  // ────────────── Gallery / Hobbies Logic ──────────────
  // (Copy your entire “gallery + pagination” code block here, verbatim,
  //  because now #gallery, #scroll-left, #scroll-right, #toggle-grid, #pagination all exist.)
  const gallery = document.getElementById("gallery");
  const scrollLeftBtn = document.getElementById("scroll-right");
  const scrollRightBtn = document.getElementById("scroll-left");
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
      btn.className = `px-3 py-1 rounded-full transition ${
        isActive
          ? "bg-accent text-white"
          : "bg-white/60 hover:bg-accent hover:text-white"
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

  function renderImages(asGrid = false) {
    gallery.innerHTML = "";

    if (asGrid) {
      gallery.className =
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 px-4 transition-all duration-500 justify-center";
      gallery.style.overflow = "visible";

      const start = (currentPage - 1) * imagesPerPage;
      const paginatedImages = images.slice(start, start + imagesPerPage);
      const fragment = document.createDocumentFragment();

      paginatedImages.forEach((img) => {
        const wrapper = document.createElement("div");
        wrapper.className = "flex flex-col items-center w-80 gap-2";

        const el = document.createElement("img");
        el.src = img.src;
        el.alt = img.alt;
        el.loading = "lazy";
        el.className =
          "h-64 w-full rounded-2xl object-cover shadow hover:scale-105 transition";

        const caption = document.createElement("div");
        caption.className = "text-center";

        const title = document.createElement("p");
        title.className =
          "text-base font-serif font-semibold text-base-800 italic tracking-wide";
        title.textContent = img.caption.split(" (")[0];

        const meta = document.createElement("p");
        meta.className = "text-sm text-gray-500 italic";
        const locationYear = img.caption.match(/\((.*?)\)/)?.[1] || "";
        meta.textContent = locationYear;

        caption.appendChild(title);
        caption.appendChild(meta);
        wrapper.appendChild(el);
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

        const el = document.createElement("img");
        el.src = img.src;
        el.alt = img.alt;
        el.loading = "lazy";
        el.className =
          "h-64 w-full rounded-2xl object-cover shadow hover:scale-105 transition";

        const caption = document.createElement("div");
        caption.className = "text-center";

        const title = document.createElement("p");
        title.className =
          "text-base font-serif font-semibold text-base-800 italic tracking-wide";
        title.textContent = img.caption.split(" (")[0];

        const meta = document.createElement("p");
        meta.className = "text-sm text-gray-500 italic";
        const locationYear = img.caption.match(/\((.*?)\)/)?.[1] || "";
        meta.textContent = locationYear;

        caption.appendChild(title);
        caption.appendChild(meta);
        wrapper.appendChild(el);
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
  fetch("includes/gallery.json", { cache: "no-store" })
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

    currentItems.forEach((pub) => {
      const div = document.createElement("div");
      div.className = "timeline-entry";
      div.innerHTML = `
        <p class="font-medium">${pub.authors}</p>
        <p class="mt-1 text-base leading-relaxed text-base-800">
          <span class="inline-block rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent mr-2">${pub.tag}</span>
          <a href="${pub.link}" target="_blank" rel="noopener" class="text-accent hover:underline">${pub.title}</a>
          <span class="italic text-base-600"> ${pub.note}</span>
        </p>
        <a href="${pub.pdf}" download target="_blank" rel="noopener"
           class="mt-2 inline-block rounded-full border border-accent/70 bg-accent/10 px-3 py-0.5 text-xs font-semibold text-accent hover:bg-accent hover:text-base-50 transition">
          PDF
        </a>`;
      container.appendChild(div);
    });

    const totalPages = Math.ceil(publications.length / itemsPerPage);
    if (totalPages <= 1) return;

    const createBtn = (label, page, disabled = false, active = false) => {
      const btn = document.createElement("button");
      btn.textContent = label;
      btn.className = `w-9 h-9 flex items-center justify-center rounded-full transition font-medium ${
        active
          ? "bg-blue-500 text-white"
          : "bg-white hover:bg-accent hover:text-white text-base-900"
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
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", (event) => {
      const isClickInsideMenu = mobileMenu.contains(event.target);
      const isClickOnToggle = menuToggle.contains(event.target);
      if (!isClickInsideMenu && !isClickOnToggle) {
        mobileMenu.classList.add("hidden");
      }
    });
    document.querySelectorAll("#mobile-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
      });
    });
  }
}
