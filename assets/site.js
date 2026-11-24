/* Portfolio · interactions légères (le site reste utilisable sans JavaScript). */
(function () {
  "use strict";

  /* Filtres des projets ---------------------------------------------------- */
  var group = document.querySelector(".filters");
  if (group) {
    group.hidden = false;
    var cards = document.querySelectorAll(".card[data-cat]");
    group.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-filter]");
      if (!b) return;
      var f = b.getAttribute("data-filter");
      group.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      cards.forEach(function (c) { c.hidden = f !== "all" && c.getAttribute("data-cat") !== f; });
    });
  }

  /* Agrandissement des images ---------------------------------------------- */
  var lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector(".lb-cap");
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a.zoom");
      if (!a || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      lbImg.src = a.getAttribute("href");
      lbImg.alt = a.getAttribute("data-caption") || "";
      lbCap.textContent = a.getAttribute("data-caption") || "";
      lb.showModal();
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target === lbImg) lb.close(); });
    lb.addEventListener("close", function () { lbImg.removeAttribute("src"); });
  }

  /* Visionneuse du poster ---------------------------------------------------- */
  var viewer = document.getElementById("viewer");
  if (viewer) {
    var img = viewer.querySelector("img");
    var tools = document.querySelector(".vt-buttons");
    if (tools) tools.hidden = false;
    var zoom = 1, MAX = 6, fullLoaded = false;

    function apply(z, cx, cy) {
      z = Math.min(MAX, Math.max(1, z));
      var r = viewer.getBoundingClientRect();
      cx = cx == null ? r.width / 2 : cx;
      cy = cy == null ? r.height / 2 : cy;
      var px = (viewer.scrollLeft + cx) / (img.offsetWidth || 1);
      var py = (viewer.scrollTop + cy) / (img.offsetHeight || 1);
      zoom = z;
      img.style.width = (100 * zoom) + "%";
      viewer.scrollLeft = px * img.offsetWidth - cx;
      viewer.scrollTop = py * img.offsetHeight - cy;
      if (zoom > 1.3 && !fullLoaded) {
        fullLoaded = true;
        var hi = new Image();
        hi.onload = function () { img.src = hi.src; };
        hi.src = img.getAttribute("data-full");
      }
    }
    if (tools) tools.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-zoom]");
      if (!b) return;
      var k = b.getAttribute("data-zoom");
      apply(k === "in" ? zoom * 1.5 : k === "out" ? zoom / 1.5 : 1);
    });
    viewer.addEventListener("wheel", function (e) {
      e.preventDefault();
      var r = viewer.getBoundingClientRect();
      apply(zoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    viewer.addEventListener("dblclick", function (e) {
      var r = viewer.getBoundingClientRect();
      apply(zoom > 1.5 ? 1 : 2.5, e.clientX - r.left, e.clientY - r.top);
    });
    var drag = null;
    viewer.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      drag = { x: e.clientX, y: e.clientY, l: viewer.scrollLeft, t: viewer.scrollTop };
      viewer.classList.add("dragging");
      viewer.setPointerCapture(e.pointerId);
    });
    viewer.addEventListener("pointermove", function (e) {
      if (!drag) return;
      viewer.scrollLeft = drag.l - (e.clientX - drag.x);
      viewer.scrollTop = drag.t - (e.clientY - drag.y);
    });
    ["pointerup", "pointercancel"].forEach(function (t) {
      viewer.addEventListener(t, function () { drag = null; viewer.classList.remove("dragging"); });
    });
    viewer.addEventListener("keydown", function (e) {
      if (e.key === "+" || e.key === "=") apply(zoom * 1.5);
      if (e.key === "-") apply(zoom / 1.5);
      if (e.key === "0") apply(1);
    });
  }
})();
