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

document.addEventListener('DOMContentLoaded', () => {
  const contextElem = document.querySelector('[data-wp-interactive="squareonesoftware"][data-wp-context]');
  let phpContext = {};
  if (contextElem) {
    try {
      phpContext = JSON.parse(contextElem.getAttribute('data-wp-context'));
    } catch (e) {
      console.error("Error parsing PHP context:", e);
    }
  }
  const initialState = Object.assign({
    currentIndex: 0,
    transform: 'translateX(0%)',
    isTransitioning: false,
    itemsTotal: 0,
    clonesCount: 0,
    itemsPerView: 3,
    scroll: 1,
    loop: false,
    slideWidth: null
  }, phpContext);
  const totalSlides = initialState.itemsTotal + initialState.clonesCount * 2;

  // If looping, start in the "first real slide" range
  if (initialState.loop) {
    initialState.currentIndex = initialState.clonesCount;
  }
  const {
    state
  } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('squareonesoftware', {
    actions: {
      moveForward() {
        if (state.isTransitioning) return;
        state.isTransitioning = true;
        state.currentIndex += state.scroll;
        doTransform();
      },
      moveBack() {
        if (state.isTransitioning) return;
        state.isTransitioning = true;
        state.currentIndex -= state.scroll;
        doTransform();
      }
    },
    state: initialState
  });

  // Grab the track element
  const carouselTrack = document.querySelector('.carousel-track');

  // Listen for transition end to handle "cloned" slides jump
  carouselTrack?.addEventListener('transitionend', () => {
    state.isTransitioning = false;

    // If we've slid to the cloned slides at the end, jump back to real slides
    if (state.currentIndex >= state.itemsTotal + state.clonesCount) {
      // Instant jump, no transition
      carouselTrack.style.transition = 'none';

      // E.g. if currentIndex = itemsTotal + clonesCount, 
      // we move back to clonesCount
      state.currentIndex = state.currentIndex - state.itemsTotal;
      doTransform();

      // Force reflow, then restore smooth transition
      requestAnimationFrame(() => {
        carouselTrack.offsetHeight;
        carouselTrack.style.transition = 'transform 0.3s ease-out';
      });
    }

    // If we've slid to the cloned slides at the start, jump forward
    else if (state.currentIndex < state.clonesCount) {
      carouselTrack.style.transition = 'none';
      state.currentIndex = state.currentIndex + state.itemsTotal;
      doTransform();
      requestAnimationFrame(() => {
        carouselTrack.offsetHeight;
        carouselTrack.style.transition = 'transform 0.3s ease-out';
      });
    }
  });
  function doTransform() {
    // Calculate offset to ensure left slide always aligns
    const slideWidthPercent = state.slideWidth ? parseFloat(state.slideWidth) : 100 / state.itemsPerView;
    const offsetPercentage = slideWidthPercent * state.currentIndex;
    carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
    console.log("Carousel transform:", state.currentIndex, offsetPercentage);
  }
  if (carouselTrack) {
    carouselTrack.style.transition = 'none';
    doTransform();
    carouselTrack.offsetHeight;
    setTimeout(() => {
      carouselTrack.style.transition = 'transform 0.3s ease-out';
    }, 50);
  }
});
})();


//# sourceMappingURL=view.js.map