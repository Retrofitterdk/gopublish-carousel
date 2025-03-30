import { store } from '@wordpress/interactivity';

document.addEventListener('DOMContentLoaded', () => {
  // Find all carousel wrappers having our interactive data attributes.
  const wrappers = document.querySelectorAll('[data-wp-interactive="gopublish-carousel"][data-wp-context]');
  // Global registry to store each carousel's store if needed.
  window.carouselStores = {};

  wrappers.forEach((wrapper) => {
    const carouselId = wrapper.getAttribute('id');
    let phpContext = {};
    try {
      phpContext = JSON.parse(wrapper.getAttribute('data-wp-context'));
    } catch (e) {
      console.error(`Error parsing PHP context for carousel ${carouselId}:`, e);
    }

    // Set up initial state merging defaults with PHP provided context.
    const initialState = Object.assign(
      {
        currentIndex: 0,
        transform: 'translateX(0%)',
        isTransitioning: false,
        itemsTotal: 0,
        clonesCount: 0,
        itemsPerView: 3,
        scroll: 1,
        loop: true,
        slideWidth: null,
      },
      phpContext
    );

    // Adjust the initial index if looping.
    if (initialState.loop) {
      initialState.currentIndex = initialState.clonesCount;
    }

    // Create a unique store for this carousel instance.
    const { state, actions } = store('gopublish-carousel-' + carouselId, {
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
        },
      },
      state: initialState,
    });

    // Save the store so we can reference it if needed.
    window.carouselStores[carouselId] = { state, actions };

    // Get the carousel track and container within this wrapper.
    const carouselTrack = wrapper.querySelector('.carousel-track');
    const carouselContainer = wrapper.querySelector('.carousel-container');
    if (!carouselTrack || !carouselContainer) return;

    // Handle seamless looping after transition.
    carouselTrack.addEventListener('transitionend', () => {
      state.isTransitioning = false;
      // If we've reached the end, reset to the proper index.
      if (state.currentIndex >= state.itemsTotal + state.clonesCount) {
        carouselTrack.style.transition = 'none';
        state.currentIndex = state.currentIndex - state.itemsTotal;
        doTransform();
        requestAnimationFrame(() => {
          carouselTrack.offsetHeight; // Force reflow.
          carouselTrack.style.transition = 'transform 0.3s ease-out';
        });
      }
      // If we've reached the beginning, reset to the proper index.
      else if (state.currentIndex < state.clonesCount) {
        carouselTrack.style.transition = 'none';
        state.currentIndex = state.currentIndex + state.itemsTotal;
        doTransform();
        requestAnimationFrame(() => {
          carouselTrack.offsetHeight; // Force reflow.
          carouselTrack.style.transition = 'transform 0.3s ease-out';
        });
      }
    });

    // Function to calculate and apply the transform based on the current index.
    function doTransform() {
      const isMobile = window.innerWidth <= 760;
      if (isMobile) {
        const slideWidthPercent = 74.0740740741;
        const offsetPercentage = slideWidthPercent * state.currentIndex;
        carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
        carouselContainer.classList.add('mobile-partial-view');
      } else {
        const slideWidthPercent = 100 / (state.itemsPerView - 0.3);
        const offsetPercentage = slideWidthPercent * state.currentIndex;
        carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
        carouselContainer.classList.remove('mobile-partial-view');
      }
    }

    // Initial carousel setup.
    carouselTrack.style.transition = 'none';
    doTransform();
    carouselTrack.offsetHeight; // Force reflow.
    setTimeout(() => {
      carouselTrack.style.transition = 'transform 0.3s ease-out';
    }, 50);

    // Responsive resize handling.
    window.addEventListener('resize', doTransform);

    // Touch swipe navigation.
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    const swipeThreshold = 50;

    carouselTrack.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches.length) return;
      startX = e.touches[0].clientX;
      currentX = startX;
      isSwiping = true;
    });

    carouselTrack.addEventListener('touchmove', (e) => {
      if (!isSwiping || !e.touches || !e.touches.length) return;
      currentX = e.touches[0].clientX;
    });

    carouselTrack.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      const deltaX = currentX - startX;
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX < 0) {
          actions.moveForward();
        } else {
          actions.moveBack();
        }
      }
    });

    // Mouse drag navigation.
    let isDragging = false;
    let mouseStartX = 0;
    let mouseCurrentX = 0;
    const dragThreshold = 50;

    carouselTrack.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      mouseStartX = e.clientX;
      mouseCurrentX = mouseStartX;
    });

    carouselTrack.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      mouseCurrentX = e.clientX;
    });

    carouselTrack.addEventListener('mouseup', () => {
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

    // Handle case when mouse leaves the track while dragging.
    carouselTrack.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        const deltaX = mouseCurrentX - mouseStartX;
        if (Math.abs(deltaX) > dragThreshold) {
          if (deltaX < 0) {
            actions.moveForward();
          } else {
            actions.moveBack();
          }
        }
      }
    });

    // Navigation button event bindings (found within the same wrapper).
    const prevButton = wrapper.querySelector('.carousel-prev[data-carousel-id]');
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        actions.moveBack();
      });
    }
    const nextButton = wrapper.querySelector('.carousel-next[data-carousel-id]');
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        actions.moveForward();
      });
    }
  });
});