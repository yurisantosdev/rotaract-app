(function lockMobileZoom() {
  var listenerOptions = { capture: true, passive: false };
  var lastTouchEnd = 0;

  function preventZoom(event) {
    event.preventDefault();
  }

  function preventMultiTouch(event) {
    if (event.touches && event.touches.length > 1) {
      event.preventDefault();
    }
  }

  function preventPinchMove(event) {
    if (
      (event.touches && event.touches.length > 1) ||
      (typeof event.scale === "number" && event.scale !== 1)
    ) {
      event.preventDefault();
    }
  }

  function preventDoubleTapZoom(event) {
    var now = Date.now();
    if (now - lastTouchEnd <= 350) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }

  document.addEventListener("gesturestart", preventZoom, listenerOptions);
  document.addEventListener("gesturechange", preventZoom, listenerOptions);
  document.addEventListener("gestureend", preventZoom, listenerOptions);
  document.addEventListener("touchstart", preventMultiTouch, listenerOptions);
  document.addEventListener("touchmove", preventPinchMove, listenerOptions);
  document.addEventListener("touchend", preventDoubleTapZoom, listenerOptions);
  document.addEventListener("dblclick", preventZoom, listenerOptions);
})();
