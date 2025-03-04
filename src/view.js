import { store } from '@wordpress/interactivity';

document.addEventListener('DOMContentLoaded', () => {
    const contextElem = document.querySelector(
        '[data-wp-interactive="squareonesoftware"][data-wp-context]'
    );

    let phpContext = {};
    
    if (contextElem) {
        try {
            phpContext = JSON.parse(contextElem.getAttribute('data-wp-context'));
        } catch (e) {
            console.error("Error parsing PHP context:", e);
        }
    }

    // We expect: 
    //   itemsTotal = number of *real* slides
    //   clonesCount = number of cloned slides at each end (usually == columns)
    //   loop = true|false
    // etc.
    const initialState = Object.assign(
        {
            currentIndex: 0,
            transform: 'translateX(0%)',
            isTransitioning: false,
            itemsTotal: 0,      // real slides
            clonesCount: 0,     // # of clones on each side
            itemsPerView: 3,
            scroll: 1,
            loop: false
        },
        phpContext
    );

    const totalSlides = initialState.itemsTotal + initialState.clonesCount * 2;

    // If looping, start in the "first real slide" range
    if (initialState.loop) {
        initialState.currentIndex = initialState.clonesCount;
    }

    const { state } = store('squareonesoftware', {
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
        state: initialState
    });

    // Grab the track element
    const carouselTrack = document.querySelector('.carousel-track');

    // Listen for transition end to handle "cloned" slides jump
    carouselTrack?.addEventListener('transitionend', () => {
        state.isTransitioning = false;

        // If we’ve slid to the cloned slides at the end, jump back to real slides
        if (state.currentIndex >= (state.itemsTotal + state.clonesCount)) {
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

        // If we’ve slid to the cloned slides at the start, jump forward
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
        // Wrap index within total slides if you want, but usually we let
        // transitionend do the actual wrap logic
        // e.g. state.currentIndex = Math.max(0, Math.min(state.currentIndex, totalSlides - 1));

        const offsetPercentage = (100 / state.itemsPerView) * state.currentIndex;
        carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
        console.log("Carousel transform:", state.currentIndex, offsetPercentage);
    }

    // Initialize transform without transition
    if (carouselTrack) {
        carouselTrack.style.transition = 'none';
        doTransform();
        carouselTrack.offsetHeight; // Force reflow
        // Re-enable transition
        setTimeout(() => {
            carouselTrack.style.transition = 'transform 0.3s ease-out';
        }, 50);
    }
});