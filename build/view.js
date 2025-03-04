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

document.addEventListener('DOMContentLoaded', function () {
  // Target the carousel element
  const contextElem = document.querySelector('[data-wp-interactive="squareonesoftware"][data-wp-context]');
  let phpContext = {};
  if (contextElem) {
    const contextData = contextElem.getAttribute('data-wp-context');
    try {
      phpContext = JSON.parse(contextData);
    } catch (e) {
      console.error("Error parsing PHP context:", e);
    }
  } else {
    console.warn("No carousel element with data-wp-interactive and data-wp-context found.");
  }

  // Merge PHP context into default state values
  const initialState = Object.assign({
    currentIndex: 0,
    transform: 'translateX(0%)',
    itemsTotal: 0,
    itemsPerView: 3,
    scroll: 1,
    // <— The key property for how many items to move
    isTransitioning: false
  }, phpContext);
  const {
    state
  } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('squareonesoftware', {
    actions: {
      moveForward() {
        if (state.isTransitioning) return;
        const {
          itemsTotal,
          itemsPerView,
          scroll
        } = state;

        // Shift backward by `scroll` items
        state.currentIndex = (state.currentIndex + scroll) % itemsTotal;

        // Translate using itemsPerView to figure out the offset width
        state.transform = `translateX(-${state.currentIndex * (100 / itemsPerView)}%)`;
        updateCarouselTrack();
      },
      moveBack() {
        if (state.isTransitioning) return;
        const {
          itemsTotal,
          itemsPerView,
          scroll
        } = state;

        // Shift forward by `scroll` items
        // add itemsTotal before % to avoid negative modulus
        state.currentIndex = (state.currentIndex - scroll + itemsTotal) % itemsTotal;

        // Translate using itemsPerView for width offset
        state.transform = `translateX(-${state.currentIndex * (100 / itemsPerView)}%)`;
        updateCarouselTrack();
      }
    },
    state: initialState
  });

  // Expose state for debugging
  window.carouselState = state;
  function updateCarouselTrack() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (carouselTrack) {
      carouselTrack.style.transform = state.transform;
      console.log("Carousel track updated to:", state.transform);
    }
  }

  // Initialize the carousel track transform
  const carouselTrack = document.querySelector('.carousel-track');
  if (carouselTrack) {
    // Disable transition on load
    carouselTrack.style.transition = 'none';
    state.transform = `translateX(-${state.currentIndex * (100 / state.itemsPerView)}%)`;
    carouselTrack.style.transform = state.transform;
    carouselTrack.offsetHeight; // Force reflow

    setTimeout(() => {
      carouselTrack.style.transition = 'transform 0.3s ease-out';
    }, 50);
  } else {
    console.warn("Carousel track element not found on initial load.");
  }
});
})();


//# sourceMappingURL=view.js.map