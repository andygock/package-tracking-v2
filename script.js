(function () {
  function getCarrierAndTrackingNumber() {
    // get tracking number from input#tracking-number
    let trackingNumber = document
      .getElementById("tracking-number")
      .value.trim();

    let carrier;

    // split from first ':'
    let [str1, str2] = trackingNumber.split(":");

    // if no token 1, assume the whole string is tracking number
    if (str2 === undefined) {
      trackingNumber = str1;
    } else {
      // if token 1 is not empty, it must be carrier, and token 2 is tracking number
      carrier = str1.trim();
      trackingNumber = str2.trim();
    }

    return { carrier, trackingNumber };
  }

  function update_links() {
    // get tracking number from input#tracking-number
    let { carrier, trackingNumber } = getCarrierAndTrackingNumber();
    const trackBtn = document.getElementById("track-btn");

    if (carrier && trackingNumber) {
      trackBtn.classList.add("visible");
    } else {
      trackBtn.classList.remove("visible");
    }

    // update <a> links based on the current value of input#tracking-number
    document.querySelectorAll("#services img").forEach(function (img) {
      const url = img
        .getAttribute("data-url")
        .replace("%TRACKING_NUMBER%", trackingNumber);

      const parentLink = img.parentNode;
      const shortcut = img.getAttribute("data-shortcut");
      const alt = img.getAttribute("alt");

      parentLink.title = alt;

      if (trackingNumber !== "") {
        parentLink.href = url;
      } else {
        // empty tracking number
        parentLink.href = new URL(img.getAttribute("data-url")).origin;
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

    // Track button logic
    trackBtn.addEventListener("click", function () {
      let { carrier, trackingNumber } = getCarrierAndTrackingNumber();
      if (carrier && trackingNumber) {
        const carrierImg = document.querySelector(
          `img[data-shortcut="${carrier}"]`,
        );
        if (carrierImg) {
          const url = carrierImg
            .getAttribute("data-url")
            .replace("%TRACKING_NUMBER%", trackingNumber);
          window.location.href = url;
        }
      }
    });

    // Clear button logic
    clearBtn.addEventListener("click", function () {
      input.value = "";
      update_links();
      input.focus();
      clearBtn.style.display = "none";
    });

    // listen to enter key on input#tracking-number, don't use deprecated event.keyCode
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        // prevent the default behavior of the enter key
        e.preventDefault();

        // get carrier and tracking number from input#tracking-number
        let { carrier, trackingNumber } = getCarrierAndTrackingNumber();
        console.log(carrier, trackingNumber);

        if (!carrier) {
          // if carrier is not provided, do nothing, we don't know where to go?!
          return;
        }

        // go to carrier url
        const url = document.querySelector(`img[data-shortcut="${carrier}"]`)
          .parentNode.href;

        // open url in current tab
        window.location.href = url;
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

          // dodn't follow link
          e.preventDefault();
        }
      });
    });
  };
})();
