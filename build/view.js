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
      console.error('Error parsing PHP context:', e);
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
    loop: true,
    slideWidth: null
  }, phpContext);
  const totalSlides = initialState.itemsTotal + initialState.clonesCount * 2;

  // If looping, start in the "first real slide" range
  if (initialState.loop) {
    initialState.currentIndex = initialState.clonesCount;
  }

  // Note we're destructuring both { state, actions }
  const {
    state,
    actions
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
  const carouselTrack = document.querySelector('.carousel-track');
  const carouselContainer = document.querySelector('.carousel-container');
  carouselTrack?.addEventListener('transitionend', () => {
    state.isTransitioning = false;

    // If we've slid to the cloned slides at the end, jump back to real slides
    if (state.currentIndex >= state.itemsTotal + state.clonesCount) {
      carouselTrack.style.transition = 'none';
      state.currentIndex = state.currentIndex - state.itemsTotal;
      doTransform();
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
    // Check if we're in mobile view
    const isMobile = window.innerWidth <= 760;

    // Calculate slide width and offset
    if (isMobile) {
      // Mobile-specific calculations
      const slideWidthPercent = 74.0740740741;
      const offsetPercentage = slideWidthPercent * state.currentIndex;
      carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
      carouselContainer.classList.add('mobile-partial-view');
    } else {
      // Desktop calculations
      const slideWidthPercent = 100 / (state.itemsPerView - 0.3);
      const offsetPercentage = slideWidthPercent * state.currentIndex;
      carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
      carouselContainer.classList.remove('mobile-partial-view');
    }
  }

  // Initial transform and transition setup
  if (carouselTrack) {
    carouselTrack.style.transition = 'none';
    doTransform();
    carouselTrack.offsetHeight;
    setTimeout(() => {
      carouselTrack.style.transition = 'transform 0.3s ease-out';
    }, 50);
  }

  // Resize event
  window.addEventListener('resize', doTransform);

  // -----------------------------------------------
  // TOUCH SWIPE LOGIC
  // -----------------------------------------------
  let startX = 0;
  let currentX = 0;
  let isSwiping = false;
  const swipeThreshold = 50; // Min px distance for valid swipe

  carouselTrack.addEventListener('touchstart', e => {
    if (!e.touches || !e.touches.length) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isSwiping = true;
  });
  carouselTrack.addEventListener('touchmove', e => {
    if (!isSwiping || !e.touches || !e.touches.length) return;
    currentX = e.touches[0].clientX;
    // Optional: real-time drag transform
  });
  carouselTrack.addEventListener('touchend', () => {
    if (!isSwiping) return;
    isSwiping = false;
    const deltaX = currentX - startX;
    if (Math.abs(deltaX) > swipeThreshold) {
      if (deltaX < 0) {
        // Swiped left => move forward
        actions.moveForward();
      } else {
        // Swiped right => move back
        actions.moveBack();
      }
    }
  });

  // -----------------------------------------------
  // MOUSE DRAG SWIPE LOGIC
  // -----------------------------------------------
  let isDragging = false;
  let mouseStartX = 0;
  let mouseCurrentX = 0;
  const dragThreshold = 50;
  carouselTrack.addEventListener('mousedown', e => {
    // Prevent text selection
    e.preventDefault();
    isDragging = true;
    mouseStartX = e.clientX;
    mouseCurrentX = mouseStartX;
  });
  carouselTrack.addEventListener('mousemove', e => {
    if (!isDragging) return;
    mouseCurrentX = e.clientX;
    // Optional: real-time drag transform
  });
  carouselTrack.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const deltaX = mouseCurrentX - mouseStartX;
    if (Math.abs(deltaX) > dragThreshold) {
      if (deltaX < 0) {
        actions.moveForward();
      } else {
        actions.moveBack();
      }
    }
  });
});
})();


//# sourceMappingURL=view.js.map