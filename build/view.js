import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity":
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");

console.log("Inside view.js");

// Create the store with our context values.
const {
  state
} = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('squareonesoftware', {
  actions: {
    moveForward() {
      const total = state.itemsTotal; // Real slides count
      const clones = state.clonesCount; // Clones count
      const perView = state.itemsPerView;
      const scroll = state.scroll; // Number of slides to scroll per click
      const virtualTotal = total + clones; // Total virtual slides

      console.log("Before moveForward:", {
        currentIndex: state.currentIndex,
        total,
        clones,
        perView,
        scroll,
        virtualTotal
      });

      // Increase index by state.scroll instead of perView.
      state.currentIndex = state.currentIndex + scroll;

      // If looping and we've reached or exceeded the virtual total, jump back.
      if (state.loop && state.currentIndex >= virtualTotal) {
        updateCarouselTrack();
        const carouselTrack = document.querySelector('.carousel-track');
        carouselTrack.addEventListener('transitionend', function handler() {
          carouselTrack.style.transition = 'none';
          // Jump back to the real first slide (index 0)
          state.currentIndex = 0;
          state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
          carouselTrack.style.transform = state.transform;
          carouselTrack.offsetHeight; // force reflow
          carouselTrack.style.transition = '';
          carouselTrack.removeEventListener('transitionend', handler);
          console.log("Looped forward to start:", state.transform);
        });
      } else {
        state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
        updateCarouselTrack();
      }
      console.log("After moveForward:", {
        currentIndex: state.currentIndex,
        transform: state.transform
      });
    },
    moveBack() {
      const total = state.itemsTotal; // Real slides count
      const clones = state.clonesCount; // Clones count
      const perView = state.itemsPerView;
      const scroll = state.scroll; // Number of slides to scroll per click
      const virtualTotal = total + clones; // Total virtual slides

      console.log("Before moveBack:", {
        currentIndex: state.currentIndex,
        total,
        clones,
        perView,
        scroll,
        virtualTotal
      });

      // Decrease index by state.scroll.
      state.currentIndex = state.currentIndex - scroll;

      // If looping and we've moved before the beginning, jump to the last full group.
      if (state.loop && state.currentIndex < 0) {
        updateCarouselTrack();
        const carouselTrack = document.querySelector('.carousel-track');
        carouselTrack.addEventListener('transitionend', function handler() {
          carouselTrack.style.transition = 'none';
          // Jump to the last group: virtual index = virtualTotal - perView
          state.currentIndex = virtualTotal - perView;
          state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
          carouselTrack.style.transform = state.transform;
          carouselTrack.offsetHeight; // force reflow
          carouselTrack.style.transition = '';
          carouselTrack.removeEventListener('transitionend', handler);
          console.log("Looped back to:", state.transform);
        });
      } else {
        state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
        updateCarouselTrack();
      }
      console.log("After moveBack:", {
        currentIndex: state.currentIndex,
        transform: state.transform
      });
    }
  },
  // Initialize the store state with values coming from the PHP context.
  state: {
    currentIndex: 0,
    transform: 'translateX(0%)',
    itemsTotal: 5,
    // Real slides count (from PHP)
    itemsPerView: 3,
    // Columns (from PHP)
    clonesCount: 1,
    // Clones count (calculated in PHP)
    scroll: 1,
    // Number of slides to scroll per click (from PHP; default is 1)
    loop: true // Loop enabled (from PHP)
  }
});

// Expose state globally for debugging.
window.carouselState = state;

// Helper function to update the carousel track’s transform.
function updateCarouselTrack() {
  const carouselTrack = document.querySelector('.carousel-track');
  if (carouselTrack) {
    carouselTrack.style.transform = state.transform;
    console.log("Carousel track updated to:", state.transform);
  }
}

// Set the initial transform on load.
const carouselTrack = document.querySelector('.carousel-track');
if (carouselTrack) {
  carouselTrack.style.transform = state.transform;
  console.log("Initial carousel track transform set to:", carouselTrack.style.transform);
} else {
  console.warn("Carousel track element not found on initial load.");
}
})();


//# sourceMappingURL=view.js.map