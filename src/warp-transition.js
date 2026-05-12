/**
 * Warp Transition System — Pure CSS Edition
 * Uses CSS animations instead of Canvas for zero GPU overhead.
 */

const WARP_DURATION = 1200; // ms for warp in
const WARP_EXIT_DURATION = 800; // ms for warp out

function getOverlay() {
  return document.getElementById('warp-overlay');
}

window.triggerWarpTransition = function(callback) {
  const overlay = getOverlay();
  if (!overlay) return callback?.();

  // Stop 3D portals to free GPU
  if (window.stopAllPortals) window.stopAllPortals();

  // Start warp-in
  overlay.className = 'warp-overlay warp-enter';

  setTimeout(() => {
    // At peak warp, fire callback (show modal)
    if (callback) callback();
    
    // Start fading out the warp overlay
    setTimeout(() => {
      overlay.className = 'warp-overlay warp-enter-done';
      setTimeout(() => {
        overlay.className = 'warp-overlay';
      }, 500);
    }, 300);
  }, WARP_DURATION);
};

window.triggerWarpExit = function(callback) {
  const overlay = getOverlay();
  if (!overlay) return callback?.();

  // Start warp-out (reverse)
  overlay.className = 'warp-overlay warp-exit';

  setTimeout(() => {
    if (callback) callback();
    
    // Resume 3D portals
    if (window.startAllPortals) window.startAllPortals();

    setTimeout(() => {
      overlay.className = 'warp-overlay warp-exit-done';
      setTimeout(() => {
        overlay.className = 'warp-overlay';
      }, 500);
    }, 200);
  }, WARP_EXIT_DURATION);
};

export function initWarpTransition() {
  // Nothing heavy to init — it's all CSS!
}
