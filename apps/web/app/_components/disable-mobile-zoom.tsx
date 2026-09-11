"use client";

import { useEffect } from "react";

export function DisableMobileZoom() {
  useEffect(() => {
    const listenerOptions: AddEventListenerOptions = { capture: true, passive: false };
    let lastTouchEnd = 0;

    function preventZoom(event: Event) {
      event.preventDefault();
    }

    function preventMultiTouch(event: TouchEvent) {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    }

    function preventPinchMove(event: TouchEvent) {
      if (event.touches.length > 1 || ("scale" in event && event.scale !== 1)) {
        event.preventDefault();
      }
    }

    function preventDoubleTapZoom(event: TouchEvent) {
      const now = Date.now();
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

    return () => {
      document.removeEventListener("gesturestart", preventZoom, listenerOptions);
      document.removeEventListener("gesturechange", preventZoom, listenerOptions);
      document.removeEventListener("gestureend", preventZoom, listenerOptions);
      document.removeEventListener("touchstart", preventMultiTouch, listenerOptions);
      document.removeEventListener("touchmove", preventPinchMove, listenerOptions);
      document.removeEventListener("touchend", preventDoubleTapZoom, listenerOptions);
      document.removeEventListener("dblclick", preventZoom, listenerOptions);
    };
  }, []);

  return null;
}
