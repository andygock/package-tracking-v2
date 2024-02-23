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

    // update <a> links based on the current value of input#tracking-number
    document.querySelectorAll("#services img").forEach(function (img) {
      const url = img
        .getAttribute("data-url")
        .replace("%TRACKING_NUMBER%", trackingNumber);

      if (trackingNumber !== "") {
        img.parentNode.href = url;
      } else {
        // empty tracking number
        img.parentNode.href = new URL(img.getAttribute("data-url")).origin;
      }
    });
  }

  // run the script after the page is loaded
  window.onload = function () {
    // focus on input#tracking-number
    document.getElementById("tracking-number").focus();

    update_links();

    // listen to enter key on input#tracking-number, don't use deprecated event.keyCode
    document
      .getElementById("tracking-number")
      .addEventListener("keypress", function (e) {
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
    document
      .getElementById("tracking-number")
      .addEventListener("input", function (e) {
        update_links();
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
