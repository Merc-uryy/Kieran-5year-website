/* ================================================================
   POLAROID DRAG + SCATTER
   ================================================================ */

function scatterPolaroids(boardId, folder) {
  const board = document.getElementById(boardId);
  const polaroids = board.querySelectorAll(".polaroid");
  const boardWidth = board.offsetWidth;
  const boardHeight = board.offsetHeight;

  polaroids.forEach((el) => {
    const x = Math.random() * (boardWidth - 160);
    const y = Math.random() * (boardHeight - 200);
    const rotation = Math.random() * 24 - 12;

    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = "rotate(" + rotation + "deg)";

    makeDraggable(el, folder);
  });
}

function makeDraggable(el, folder) {
  let offsetX, offsetY, dragging = false;
  let startX, startY, moved = false;

  el.addEventListener("pointerdown", (e) => {
    dragging = true;
    moved = false;
    startX = e.clientX;
    startY = e.clientY;
    el.setPointerCapture(e.pointerId);
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    el.style.zIndex = 100;
  });

  el.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    if (Math.abs(e.clientX - startX) > 6 || Math.abs(e.clientY - startY) > 6) {
      moved = true;
    }

    const parentRect = el.parentElement.getBoundingClientRect();
    const x = e.clientX - parentRect.left - offsetX;
    const y = e.clientY - parentRect.top - offsetY;
    el.style.left = x + "px";
    el.style.top = y + "px";
  });

  el.addEventListener("pointerup", () => {
    dragging = false;
    if (!moved) {
      const file = el.dataset.file;
      const caption = el.dataset.caption || "";
      openLightbox(folder + "/" + file, caption);
    }
  });

  el.addEventListener("pointercancel", () => { dragging = false; });
}

/* ================================================================
   FILMSTRIP
   ================================================================ */

function isVideoFile(filename) {
  return /\.(mp4|mov|webm)$/i.test(filename);
}

function buildFilmstrip(containerId, folder, photos) {
  const container = document.getElementById(containerId);

  photos.forEach((photo) => {
    const item = document.createElement("div");
    item.className = "filmstrip-item";

    const el = isVideoFile(photo.file)
      ? document.createElement("video")
      : document.createElement("img");
    el.src = folder + "/" + photo.file;

    item.appendChild(el);
    item.addEventListener("click", () => openLightbox(folder + "/" + photo.file, photo.caption || ""));
    container.appendChild(item);
  });
}

/* ================================================================
   MASONRY PHOTO GRID
   ================================================================ */

function buildMasonry(containerId, folder, files) {
  const container = document.getElementById(containerId);

  files.forEach((file, i) => {
    const item = document.createElement("div");
    item.className = "masonry-item";

    const el = isVideoFile(file) ? document.createElement("video") : document.createElement("img");
    el.src = folder + "/" + file;
    if (isVideoFile(file)) el.muted = true;

    item.appendChild(el);
    item.addEventListener("click", () => openLightbox(folder + "/" + file, ""));
    container.appendChild(item);

    setTimeout(() => item.classList.add("show"), i * 80);
  });
}

/* ================================================================
   LIGHTBOX
   Always receives a COMPLETE path already (folder + filename combined
   by whichever function called it) — never adds "photos/" itself.
   ================================================================ */

function openLightbox(filePath, caption) {
  let overlay = document.getElementById("lightboxOverlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "lightbox-overlay";
    overlay.id = "lightboxOverlay";
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">✕</button>
      <div class="lightbox-content" id="lightboxContent"></div>
      <p class="lightbox-caption" id="lightboxCaption"></p>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeLightbox(); });
  }

  const content = document.getElementById("lightboxContent");
  content.innerHTML = "";

  const el = isVideoFile(filePath) ? document.createElement("video") : document.createElement("img");
  el.src = filePath;
  if (isVideoFile(filePath)) el.controls = true;
  content.appendChild(el);

  document.getElementById("lightboxCaption").textContent = caption;
  overlay.classList.add("open");
}

function closeLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  if (overlay) overlay.classList.remove("open");
}

/* ================================================================
   PINNED REWARD PHOTO
   ================================================================ */

function pinRewardPhoto(filePath, caption) {
  if (document.getElementById("pinnedReward")) return;

  const pin = document.createElement("div");
  pin.className = "pinned-reward";
  pin.id = "pinnedReward";

  const img = document.createElement("img");
  img.src = filePath;
  pin.appendChild(img);

  pin.addEventListener("click", () => openLightbox(filePath, caption || ""));

  document.body.appendChild(pin);

  requestAnimationFrame(() => pin.classList.add("show"));
}

/* ================================================================
   CORKBOARD MEMORY WALL
   Builds a tacked-up photo wall with slight random rotation per
   photo and a little pin at the top. Tap any photo to enlarge.

   Example:
   buildCorkboard("cork4", "/photos/Year 4", ["Year4 (1).jpeg", ...]);
   ================================================================ */

function buildCorkboard(containerId, folder, files) {
  const container = document.getElementById(containerId);

  files.forEach((file, i) => {
    const item = document.createElement("div");
    item.className = "cork-photo";

    const rotation = (Math.random() * 16 - 8).toFixed(1);
    item.style.transform = "rotate(" + rotation + "deg)";

    const pin = document.createElement("div");
    pin.className = "cork-pin";
    item.appendChild(pin);

    const el = isVideoFile(file) ? document.createElement("video") : document.createElement("img");
    el.src = folder + "/" + file;
    if (isVideoFile(file)) el.muted = true;
    item.appendChild(el);

    item.addEventListener("click", () => openLightbox(folder + "/" + file, ""));
    container.appendChild(item);

    setTimeout(() => item.classList.add("show"), i * 90);
  });
}
/* ================================================================
   FADE SLIDESHOW
   One photo visible at a time, fades between them. Tap the photo
   itself to open it full-size in the lightbox, or use the arrows
   to move through the set.

   Example:
   buildSlideshow("slideshow5", "/photos/Year 5", ["Year5 (8).jpeg", ...]);
   ================================================================ */

function buildSlideshow(containerId, folder, files) {
  const container = document.getElementById(containerId);
  let current = 0;

  const track = document.createElement("div");
  track.className = "slideshow-track";
  container.appendChild(track);

  files.forEach((file, i) => {
    const slide = document.createElement("div");
    slide.className = "slideshow-slide" + (i === 0 ? " active" : "");

    const el = isVideoFile(file) ? document.createElement("video") : document.createElement("img");
    el.src = folder + "/" + file;
    if (isVideoFile(file)) el.muted = true;
    slide.appendChild(el);

    slide.addEventListener("click", () => openLightbox(folder + "/" + file, ""));
    track.appendChild(slide);
  });

  const controls = document.createElement("div");
  controls.className = "slideshow-controls";
  controls.innerHTML = `
    <button class="slideshow-arrow" aria-label="Previous">◀</button>
    <span class="slideshow-counter">1 / ${files.length}</span>
    <button class="slideshow-arrow" aria-label="Next">▶</button>
  `;
  container.appendChild(controls);

  const slides = track.querySelectorAll(".slideshow-slide");
  const counter = controls.querySelector(".slideshow-counter");
  const [prevBtn, nextBtn] = controls.querySelectorAll(".slideshow-arrow");

  function goTo(index) {
    slides[current].classList.remove("active");
    current = (index + files.length) % files.length;
    slides[current].classList.add("active");
    counter.textContent = (current + 1) + " / " + files.length;
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // auto-advance every 4 seconds, pauses if he's actively clicking through
  let autoTimer = setInterval(() => goTo(current + 1), 4000);
  container.addEventListener("click", () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  });
}