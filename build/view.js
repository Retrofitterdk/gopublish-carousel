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
  // Target the carousel element using a more specific selector.
  const contextElem = document.querySelector('[data-wp-interactive="squareonesoftware"][data-wp-context]');
  let phpContext = {};
  if (contextElem) {
    const contextData = contextElem.getAttribute('data-wp-context');
    console.log("Raw PHP context attribute:", contextData);
    try {
      phpContext = JSON.parse(contextData);
      console.log("Parsed PHP context:", phpContext);
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
    clonesCount: 0,
    scroll: 1,
    loop: false
  }, phpContext);

  // Initialize the store with our merged state
  const {
    state
  } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('squareonesoftware', {
    actions: {
      moveForward() {
        const total = state.itemsTotal;
        const clones = state.clonesCount;
        const perView = state.itemsPerView;
        const scroll = state.scroll;
        console.log("Before moveForward:", {
          currentIndex: state.currentIndex,
          total,
          clones,
          perView,
          scroll
        });

        // Increase index by scroll amount
        state.currentIndex = state.currentIndex + scroll;
        if (state.loop && state.currentIndex >= total + clones) {
          state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
          updateCarouselTrack();
          const carouselTrack = document.querySelector('.carousel-track');
          carouselTrack.addEventListener('transitionend', function handler() {
            carouselTrack.style.transition = 'none';
            const jumpToIndex = state.currentIndex - total;
            state.currentIndex = jumpToIndex;
            state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
            carouselTrack.style.transform = state.transform;
            // Force reflow
            carouselTrack.offsetHeight;
            carouselTrack.style.transition = '';
            carouselTrack.removeEventListener('transitionend', handler);
            console.log("Looped to corresponding real slide:", {
              jumpedTo: state.currentIndex,
              transform: state.transform
            });
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
        const total = state.itemsTotal;
        const clones = state.clonesCount;
        const perView = state.itemsPerView;
        const scroll = state.scroll;
        console.log("Before moveBack:", {
          currentIndex: state.currentIndex,
          total,
          clones,
          perView,
          scroll
        });

        // Decrease index by scroll amount
        state.currentIndex = state.currentIndex - scroll;
        if (state.loop && state.currentIndex < clones) {
          state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
          updateCarouselTrack();
          const carouselTrack = document.querySelector('.carousel-track');
          carouselTrack.addEventListener('transitionend', function handler() {
            carouselTrack.style.transition = 'none';
            const jumpToIndex = state.currentIndex + total;
            state.currentIndex = jumpToIndex;
            state.transform = `translateX(-${state.currentIndex * (100 / perView)}%)`;
            carouselTrack.style.transform = state.transform;
            // Force reflow
            carouselTrack.offsetHeight;
            carouselTrack.style.transition = '';
            carouselTrack.removeEventListener('transitionend', handler);
            console.log("Looped to corresponding real slide:", {
              jumpedTo: state.currentIndex,
              transform: state.transform
            });
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
    state: initialState
  });

  // Expose state globally for debugging.
  window.carouselState = state;

  // Helper to update the carousel track's transform.
  function updateCarouselTrack() {
    const carouselTrack = document.querySelector('.carousel-track');
    if (carouselTrack) {
      carouselTrack.style.transform = state.transform;
      console.log("Carousel track updated to:", state.transform);
    }
  }

  // Set the initial transform based on the merged state
  const carouselTrack = document.querySelector('.carousel-track');
  if (carouselTrack) {
    if (state.loop) {
      state.currentIndex = state.clonesCount;
    }
    state.transform = `translateX(-${state.currentIndex * (100 / state.itemsPerView)}%)`;
    carouselTrack.style.transform = state.transform;
    console.log("Initial carousel track transform set to:", state.transform, "currentIndex:", state.currentIndex);
  } else {
    console.warn("Carousel track element not found on initial load.");
  }
});
})();


//# sourceMappingURL=view.js.map