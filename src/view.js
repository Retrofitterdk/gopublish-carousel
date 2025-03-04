import { store } from '@wordpress/interactivity';

document.addEventListener('DOMContentLoaded', () => {
    // Find and parse the carousel context from PHP
    const contextElem = document.querySelector(
        '[data-wp-interactive="squareonesoftware"][data-wp-context]'
    );

    let phpContext = {};
    if (contextElem) {
        try {
            phpContext = JSON.parse(contextElem.getAttribute('data-wp-context'));
        } catch (e) {
            console.error('Error parsing PHP context:', e);
        }
    }

    // Initialize carousel state with default and PHP-provided values
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
            slideWidth: null
        },
        phpContext
    );

    const totalSlides = initialState.itemsTotal + initialState.clonesCount * 2;

    // Adjust initial index for looping
    if (initialState.loop) {
        initialState.currentIndex = initialState.clonesCount;
    }

    // Create interactive store with carousel actions
    const { state, actions } = store('squareonesoftware', {
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

    const carouselTrack = document.querySelector('.carousel-track');
    const carouselContainer = document.querySelector('.carousel-container');

    // Handle seamless looping after transition
    carouselTrack?.addEventListener('transitionend', () => {
        state.isTransitioning = false;

        // Reset position for end of slides
        if (state.currentIndex >= state.itemsTotal + state.clonesCount) {
            carouselTrack.style.transition = 'none';
            state.currentIndex = state.currentIndex - state.itemsTotal;
            doTransform();
            requestAnimationFrame(() => {
                carouselTrack.offsetHeight;
                carouselTrack.style.transition = 'transform 0.3s ease-out';
            });
        }
        // Reset position for start of slides
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

    // Calculate and apply carousel transform
    function doTransform() {
        const isMobile = window.innerWidth <= 760;
        
        if (isMobile) {
            // Mobile view calculations
            const slideWidthPercent = 74.0740740741;
            const offsetPercentage = slideWidthPercent * state.currentIndex;
            
            carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
            carouselContainer.classList.add('mobile-partial-view');
        } else {
            // Desktop view calculations
            const slideWidthPercent = 100 / (state.itemsPerView - 0.3);
            const offsetPercentage = slideWidthPercent * state.currentIndex;
            
            carouselTrack.style.transform = `translateX(-${offsetPercentage}%)`;
            carouselContainer.classList.remove('mobile-partial-view');
        }
    }

    // Initial carousel setup
    if (carouselTrack) {
        carouselTrack.style.transition = 'none';
        doTransform();
        carouselTrack.offsetHeight;
        setTimeout(() => {
            carouselTrack.style.transition = 'transform 0.3s ease-out';
        }, 50);
    }

    // Responsive resize handling
    window.addEventListener('resize', doTransform);

    // Touch swipe navigation
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

    // Mouse drag navigation
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

    carouselTrack.addEventListener('mouseup', (e) => {
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