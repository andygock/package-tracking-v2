(function () {
  function getCarrierAndTrackingNumber() {
    // get tracking number from input#tracking-number
    let trackingNumber = document
      .getElementById("tracking-number")
      .value.trim();

    let carrier;

    // split on the first ':' only — preserve any additional colons in the tracking id
    const idx = trackingNumber.indexOf(":");
    if (idx === -1) {
      // no carrier prefix
    } else {
      carrier = trackingNumber.slice(0, idx).trim();
      trackingNumber = trackingNumber.slice(idx + 1).trim();
    }

    return { carrier, trackingNumber };
  }

  // cached allowed origins derived from configured carrier data-urls
  const _allowedOriginsCache = { set: null };
  function getAllowedOrigins() {
    if (_allowedOriginsCache.set) return _allowedOriginsCache.set;
    const s = new Set();
    document.querySelectorAll("#services img").forEach((img) => {
      try {
        const u = new URL(img.getAttribute("data-url"), location.href);
        s.add(u.origin);
      } catch (e) {
        // ignore
      }
    });
    _allowedOriginsCache.set = s;
    return s;
  }

  // parse a candidate URL and return a URL object only if its origin is allowlisted
  function parseAndAllow(candidate) {
    try {
      const u = new URL(candidate, location.href);
      return getAllowedOrigins().has(u.origin) ? u : null;
    } catch (e) {
      return null;
    }
  }

  // show a transient error message below the input
  function showError(message) {
    let container = document.getElementById("tracking-container");
    if (!container) return;
    let el = document.getElementById("tracking-error");
    if (!el) {
      el = document.createElement("div");
      el.id = "tracking-error";
      el.className = "tracking-error";
      el.setAttribute("role", "alert");
      container.appendChild(el);
    }
    el.textContent = message;
    clearTimeout(el._t);
    el._t = setTimeout(() => {
      try {
        el.textContent = "";
      } catch (e) {}
    }, 4000);
  }

  function update_links() {
    // get tracking number from input#tracking-number
    let { carrier, trackingNumber } = getCarrierAndTrackingNumber();
    // rebuild allowed origins cache and get allowlist
    _allowedOriginsCache.set = null;
    const allowedOrigins = getAllowedOrigins();
    const trackBtn = document.getElementById("track-btn");

    // show Track button only when user provided a carrier prefix and tracking id
    if (carrier && trackingNumber) {
      trackBtn.classList.add("visible");
    } else {
      trackBtn.classList.remove("visible");
    }

    // update <a> links based on the current value of input#tracking-number
    document.querySelectorAll("#services img").forEach(function (img) {
      const raw = img.getAttribute("data-url");
      const replaced = (raw || "").replace("%TRACKING_NUMBER%", trackingNumber);

      const parentLink = img.parentNode;
      const shortcut = img.getAttribute("data-shortcut");
      const alt = img.getAttribute("alt");

      parentLink.title = alt || "";

      // ensure a small monospace overlay showing the prefix (e.g. "ar:")
      try {
        let overlay = parentLink.querySelector(".prefix-overlay");
        if (!overlay) {
          overlay = document.createElement("span");
          overlay.className = "prefix-overlay";
          overlay.setAttribute("aria-hidden", "true");
          // avoid content shift: ensure parent has positioning
          try {
            if (getComputedStyle(parentLink).position === "static") {
              parentLink.style.position = "relative";
            }
          } catch (e) {
            parentLink.style.position = parentLink.style.position || "relative";
          }
          parentLink.appendChild(overlay);
        }
        overlay.textContent = shortcut ? shortcut + ":" : "";
      } catch (e) {
        // non-fatal if overlay can't be added
      }

      try {
        const u = new URL(replaced, location.href);

        // only assign href when the destination origin is allowlisted
        if (allowedOrigins.has(u.origin)) {
          parentLink.href = u.href;
        } else {
          // fall back to carrier origin if available, or make link inert
          try {
            const fallback = new URL(raw, location.href);
            parentLink.href = allowedOrigins.has(fallback.origin)
              ? fallback.origin + "/"
              : "#";
          } catch (e) {
            parentLink.href = "#";
          }
        }

        // ensure external links include noopener/noreferrer for safety
        if (u.origin !== location.origin) {
          const rel = (parentLink.getAttribute("rel") || "")
            .split(/\s+/)
            .filter(Boolean);
          if (!rel.includes("noopener")) rel.push("noopener");
          if (!rel.includes("noreferrer")) rel.push("noreferrer");
          parentLink.setAttribute("rel", rel.join(" "));
        }
      } catch (err) {
        // invalid URL — make link inert
        parentLink.href = "#";
      }

      // Highlight the active carrier
      if (carrier && carrier === shortcut) {
        parentLink.classList.add("active-carrier");
      } else {
        parentLink.classList.remove("active-carrier");
      }
    });
  }

  function generateJsonLd() {
    try {
      const images = Array.from(document.querySelectorAll("#services img"));
      // ensure images are lazy-loaded to improve performance and SEO signals
      images.forEach((img) => {
        try {
          img.loading = "lazy";
        } catch (e) {}
      });
      const items = images.map((img, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: img.getAttribute("alt") || "",
        url: (img.closest("a")
          ? img.closest("a").href
          : img.getAttribute("data-url") || ""
        ).replace("%TRACKING_NUMBER%", "{trackingNumber}"),
      }));

      const ld = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Package Tracking",
        description:
          "Quickly check package status across popular carriers. Use shortcuts like 'ap:123456' to go directly to the carrier tracking page.",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: items,
        },
      };

      let script = document.getElementById("ld-json");
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "ld-json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(ld);
    } catch (err) {
      // fail silently — structured data is best-effort
      console.warn("generateJsonLd error", err);
    }
  }

  // run the script after the page is loaded
  window.onload = function () {
    // focus on input#tracking-number
    const input = document.getElementById("tracking-number");
    const clearBtn = document.getElementById("clear-btn");
    const trackBtn = document.getElementById("track-btn");

    input.focus();

    update_links();
    generateJsonLd();
    clearBtn.style.display = input.value ? "block" : "none";

    // Track button logic — require explicit carrier prefix
    trackBtn.addEventListener("click", function () {
      let { carrier, trackingNumber } = getCarrierAndTrackingNumber();
      if (!carrier) {
        showError(
          'Please include a carrier prefix, e.g. "ap:123456", or click a carrier button below.',
        );
        document.getElementById("tracking-number").focus();
        return;
      }

      const carrierImg = document.querySelector(
        `img[data-shortcut="${carrier}"]`,
      );
      if (!carrierImg) {
        showError("Unknown carrier prefix: " + carrier);
        document.getElementById("tracking-number").focus();
        return;
      }

      if (!trackingNumber) {
        showError("Please enter a tracking number after the prefix");
        document.getElementById("tracking-number").focus();
        return;
      }

      const rawUrl = carrierImg
        .getAttribute("data-url")
        .replace("%TRACKING_NUMBER%", trackingNumber);
      const u = parseAndAllow(rawUrl);
      if (u) {
        window.location.href = u.href;
      } else {
        showError("Navigation blocked: disallowed destination");
      }
    });

    // Clear button logic
    clearBtn.addEventListener("click", function () {
      input.value = "";
      update_links();
      input.focus();
      clearBtn.style.display = "none";
    });

    // listen to Enter via keydown (more reliable than keypress)
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();

        // get carrier and tracking number from input#tracking-number
        let { carrier, trackingNumber } = getCarrierAndTrackingNumber();
        console.log(carrier, trackingNumber);

        // require explicit carrier prefix — do not guess
        if (!carrier) {
          showError(
            'Please include a carrier prefix, e.g. "ap:123456", or click a carrier button below.',
          );
          return;
        }

        const carrierImg = document.querySelector(
          `img[data-shortcut="${carrier}"]`,
        );
        if (!carrierImg) {
          showError("Unknown carrier prefix: " + carrier);
          return;
        }

        if (!trackingNumber) {
          showError("Please enter a tracking number after the prefix");
          return;
        }

        const rawUrl = (carrierImg.getAttribute("data-url") || "").replace(
          "%TRACKING_NUMBER%",
          trackingNumber,
        );
        const u = parseAndAllow(rawUrl);
        if (u) {
          window.location.href = u.href;
        } else {
          showError("Navigation blocked: disallowed destination");
        }
      }
    });

    // listen for user typing in input#tracking-number
    input.addEventListener("input", function (e) {
      update_links();
      clearBtn.style.display = input.value ? "block" : "none";
    });

    // detect click on carrier links
    // if tracking input box is empty at the time, insert carrier name into the input box followed by ':
    document.querySelectorAll("#services img").forEach(function (img) {
      img.parentNode.addEventListener("click", function (e) {
        // user clicked on a carrier link

        // get carrier and tracking number from input#tracking-number
        let { carrier, trackingNumber } = getCarrierAndTrackingNumber();

        if (trackingNumber === "") {
          // add shortcut into input box for user's convenience
          document.getElementById("tracking-number").value =
            img.getAttribute("data-shortcut") + ":";

          update_links();

          // focus back on the input box
          document.getElementById("tracking-number").focus();

          // don't follow link
          e.preventDefault();
        }
      });
    });
  };
})();
