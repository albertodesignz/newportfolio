// Import utility function for preloading images
import { preloadImages } from './utils.js';

// Register the GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);

// Initialize GSAP's ScrollSmoother for smooth scrolling and scroll-based effects
const smoother = ScrollSmoother.create({
  smooth: 1, // How long (in seconds) it takes to "catch up"
  effects: true, // Enable data-speed and data-lag-based scroll effects
  normalizeScroll: true, // Normalizes scroll behavior across browsers
});

// Reference to the container that wraps all the 3D scene elements
const sceneWrapper = document.querySelector('.scene-wrapper');

// Global flag to prevent multiple animations from overlapping or triggering at once
let isAnimating = false;

// A Map to store SplitText instances keyed by DOM elements (used for animating text characters)
const splitMap = new Map();

/**
 * Returns an array of transform strings to evenly space carousel cells in 3D
 *
 * @param {number} count - Number of carousel cells
 * @param {number} radius - Radius of the circular layout
 * @returns {string[]} Array of transform strings for each cell
 */
const getCarouselCellTransforms = (count, radius) => {
  const angleStep = 360 / count; // Divide 360° by number of cells to get angle step
  return Array.from({ length: count }, (_, i) => {
    const angle = i * angleStep;
    return `rotateY(${angle}deg) translateZ(${radius}px)`; // 3D rotation + translation
  });
};

/**
 * Applies 3D transforms to each cell in a given carousel
 *
 * @param {Element} carousel - DOM element representing the carousel
 * @returns {void}
 */
const setupCarouselCells = (carousel) => {
  const wrapper = carousel.closest('.scene');
  const radius = parseFloat(wrapper.dataset.radius) || 500; // Read radius from data attribute or default to 500
  const cells = carousel.querySelectorAll('.carousel__cell');

  const transforms = getCarouselCellTransforms(cells.length, radius); // Get transform strings
  cells.forEach((cell, i) => {
    cell.style.transform = transforms[i]; // Apply transform to each cell
  });
};

/**
 * Creates a scroll-linked GSAP timeline for a given carousel scene
 *
 * @param {Element} carousel - DOM element of the carousel
 * @returns {GSAPTimeline} Scroll-driven animation timeline
 */
const createScrollAnimation = (carousel) => {
  const wrapper = carousel.closest('.scene');
  const cards = carousel.querySelectorAll('.card');
  const titleSpan = wrapper.querySelector('.scene__title span');
  const split = splitMap.get(titleSpan);
  const chars = split?.chars || [];

  // Create scroll-driven timeline
  carousel._timeline = gsap.timeline({
    defaults: { ease: 'sine.inOut' },
    scrollTrigger: {
      trigger: wrapper,
      start: 'top bottom', // Start when top of wrapper hits bottom of viewport
      end: 'bottom top', // End when bottom of wrapper hits top of viewport
      scrub: true, // Smooth animation based on scroll position
    },
  });

  carousel._timeline
    .fromTo(carousel, { rotationY: 0 }, { rotationY: -180 }, 0) // Rotate carousel horizontally
    .fromTo(
      carousel,
      { rotationZ: 3, rotationX: 3 },
      { rotationZ: -3, rotationX: -3 },
      0
    ) // Subtle 3D tilt
    .fromTo(
      cards,
      { filter: 'brightness(250%)' },
      { filter: 'brightness(80%)', ease: 'power3' },
      0
    ); // Brightness dimming
    // Note: Removed card rotationZ animation to preserve individual card rotations

  // Animate title characters in on scroll
  if (chars.length > 0) {
    animateChars(chars, 'in', {
      scrollTrigger: {
        trigger: wrapper,
        start: 'top center',
        toggleActions: 'play none none reverse',
      },
    });
  }

  return carousel._timeline;
};

/**
 * Initializes SplitText instances on key animated elements
 *
 * @returns {void}
 */
const initTextsSplit = () => {
  document
    .querySelectorAll(
      '.scene__title span, .preview__title span, .preview__close'
    )
    .forEach((span) => {
      const split = SplitText.create(span, {
        type: 'chars', // Split by characters
        charsClass: 'char', // Assign class to each character
        autoSplit: true, // Revert and re-split whenever the fonts finish loading
      });
      splitMap.set(span, split); // Store split instance for reuse
    });
};

/**
 * Returns interpolated rotation values based on scroll progress
 *
 * @param {number} progress - Scroll progress (0 to 1)
 * @returns {Object} Object with interpolated rotationX, rotationY, rotationZ values
 */
const getInterpolatedRotation = (progress) => ({
  rotationY: gsap.utils.interpolate(0, -180, progress), // Horizontal spin from 0° to -180°
  rotationX: gsap.utils.interpolate(3, -3, progress), // Tilt forward/backward
  rotationZ: gsap.utils.interpolate(3, -3, progress), // Z-axis twist
});

/**
 * Animates a single grid item into view with position, scale, and 3D depth
 *
 * @param {Element} el - DOM element to animate
 * @param {number} dx - Horizontal distance from center
 * @param {number} dy - Vertical distance from center
 * @param {number} rotationY - Y-axis rotation direction
 * @param {number} delay - Delay before animation starts
 * @returns {void}
 */
const animateGridItemIn = (el, dx, dy, rotationY, delay) => {
  // Animate 2D transform and opacity
  gsap.fromTo(
    el,
    {
      transformOrigin: `% 50% ${dx > 0 ? -dx * 0.8 : dx * 0.8}px`,
      //x: dx, // Offset based on distance from center
      autoAlpha: 0,
      y: dy * 0.5, // Slight vertical offset
      scale: 0.5, // Scaled down
      rotationY: dx < 0 ? rotationY : rotationY, // Rotate in from left/right
    },
    {
      //x: 0,
      y: 0,
      scale: 1,
      rotationY: 0,
      autoAlpha: 1,
      duration: 0.4,
      ease: 'sine',
      delay: delay + 0.1,
    }
  );

  // Animate z-position separately for 3D pop
  gsap.fromTo(
    el,
    { z: -3500 },
    {
      z: 0,
      duration: 0.3,
      ease: 'expo',
      delay,
    }
  );
};

/**
 * Animates a single grid item out of view with depth and fade
 *
 * @param {Element} el - DOM element to animate
 * @param {number} dx - Horizontal distance from center
 * @param {number} dy - Vertical distance from center
 * @param {number} rotationY - Y-axis rotation direction
 * @param {number} delay - Delay before animation starts
 * @param {boolean} isLast - Whether this is the last item (for onComplete)
 * @param {Function} [onComplete] - Callback when animation finishes
 * @returns {void}
 */
const animateGridItemOut = (
  el,
  dx,
  dy,
  rotationY,
  delay,
  isLast,
  onComplete
) => {
  // Animate 2D transform and opacity
  gsap.to(el, {
    startAt: {
      transformOrigin: `50% 50% ${dx > 0 ? -dx * 0.8 : dx * 0.8}px`,
    },
    //x: dx,
    y: dy * 0.4,
    rotationY: dx < 0 ? rotationY : rotationY,
    scale: 0.4,
    autoAlpha: 0,
    duration: 0.4,
    ease: 'sine.in',
    delay,
  });
  gsap.to(el, {
    z: -3500,
    duration: 0.4,
    ease: 'expo.in',
    delay: delay + 0.9,
    onComplete: isLast ? onComplete : undefined, // Call onComplete only for the last item
  });
};

/**
 * Animates all grid items in or out with a distance-based stagger and easing
 *
 * @param {Object} options
 * @param {NodeList} options.items - Collection of grid item DOM elements
 * @param {number} options.centerX - X-coordinate of the center
 * @param {number} options.centerY - Y-coordinate of the center
 * @param {'in' | 'out'} [options.direction='in'] - Animation direction
 * @param {Function} [options.onComplete] - Callback after all animations complete
 * @returns {void}
 */
const animateGridItems = ({
  items,
  centerX,
  centerY,
  direction = 'in',
  onComplete,
}) => {
  // Measure position of each item and calculate distance from center
  const itemData = Array.from(items).map((el) => {
    const rect = el.getBoundingClientRect();
    const elCenterX = rect.left + rect.width / 2;
    const elCenterY = rect.top + rect.height / 2;
    const dx = centerX - elCenterX;
    const dy = centerY - elCenterY;
    const dist = Math.hypot(dx, dy); // Euclidean distance from center
    const isLeft = elCenterX < centerX;
    return { el, dx, dy, dist, isLeft };
  });

  const maxDist = Math.max(...itemData.map((d) => d.dist)); // Farthest distance
  const totalStagger = 0.025 * (itemData.length - 1); // Total stagger duration

  let latest = { delay: -1, el: null }; // Track latest delay item

  itemData.forEach(({ el, dx, dy, dist, isLeft }) => {
    const norm = maxDist ? dist / maxDist : 0; // Normalize distance
    const exponential = Math.pow(direction === 'in' ? 1 - norm : norm, 1); // Easing
    const delay = exponential * totalStagger;
    const rotationY = isLeft ? 100 : -100; // Directional rotation

    if (direction === 'in') {
      animateGridItemIn(el, dx, dy, rotationY, delay);
    } else {
      if (delay > latest.delay) {
        latest = { delay, el };
      }
      animateGridItemOut(el, dx, dy, rotationY, delay, false, onComplete);
    }
  });

  // Ensure onComplete runs only after the last item finishes
  if (direction === 'out' && latest.el) {
    const { el, dx, dy, isLeft } = itemData.find((d) => d.el === latest.el);
    const rotationY = isLeft ? 100 : -100;
    animateGridItemOut(el, dx, dy, rotationY, latest.delay, true, onComplete);
  }
};

/**
 * Animates all grid items in the preview into view
 *
 * @param {Element} preview - Preview DOM element containing grid items
 * @returns {void}
 */
const animatePreviewGridIn = (preview) => {
  const items = preview.querySelectorAll('.grid__item');
  // Clear any inline styles from previous animations
  gsap.set(items, { clearProps: 'all' });
  // Trigger grid item entrance animation from center of screen
  animateGridItems({
    items,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    direction: 'in',
  });
};

/**
 * Animates all grid items in the preview out of view
 * @param {HTMLElement} preview - The preview container
 */
const animatePreviewGridOut = (preview) => {
  const items = preview.querySelectorAll('.grid__item');
  // Trigger grid item exit animation toward edges
  const onComplete = () =>
    gsap.set(preview, { pointerEvents: 'none', autoAlpha: 0 });
  animateGridItems({
    items,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    direction: 'out',
    onComplete,
  });
};

/**
 * Retrieves relevant DOM elements and text splits from a scene title
 * @param {HTMLElement} titleEl - The `.scene__title` element
 * @returns {Object} wrapper, carousel, cards, span, chars
 */
const getSceneElementsFromTitle = (titleEl) => {
  const wrapper = titleEl.closest('.scene'); // Scene container
  const carousel = wrapper?.querySelector('.carousel'); // Carousel in the scene
  const cards = carousel?.querySelectorAll('.card'); // All card elements
  const span = titleEl.querySelector('span'); // Title span
  const chars = splitMap.get(span)?.chars || []; // SplitText chars
  return { wrapper, carousel, cards, span, chars };
};

/**
 * Retrieves scene-related elements from a preview element
 * @param {HTMLElement} previewEl - The `.preview` element
 * @returns {Object} All scene elements and corresponding titleEl
 */
const getSceneElementsFromPreview = (previewEl) => {
  const previewId = `#${previewEl.id}`;
  const titleLink = document.querySelector(
    `.scene__title a[href="${previewId}"]`
  );
  const titleEl = titleLink?.closest('.scene__title'); // Corresponding title element
  return { ...getSceneElementsFromTitle(titleEl), titleEl };
};

/**
 * Animates SplitText character elements in or out
 *
 * @param {HTMLElement[]} chars - Array of character elements to animate
 * @param {'in' | 'out'} direction - Direction of the animation ('in' for fade in, 'out' for fade out)
 * @param {Object} [opts={}] - Optional GSAP config overrides (e.g. scrollTrigger)
 */
const animateChars = (chars, direction = 'in', opts = {}) => {
  const base = {
    autoAlpha: direction === 'in' ? 1 : 0,
    duration: 0.02,
    ease: 'none',
    stagger: { each: 0.04, from: direction === 'in' ? 'start' : 'end' },
    ...opts,
  };

  gsap.fromTo(chars, { autoAlpha: direction === 'in' ? 0 : 1 }, base);
};

/**
 * Animates title and close button characters in a preview
 *
 * @param {HTMLElement} preview - The preview container
 * @param {'in' | 'out'} direction - Animation direction
 * @param {string} [selector='.preview__title span, .preview__close'] - Selector for elements to animate
 */
const animatePreviewTexts = (
  preview,
  direction = 'in',
  selector = '.preview__title span, .preview__close'
) => {
  preview.querySelectorAll(selector).forEach((el) => {
    const chars = splitMap.get(el)?.chars || [];
    animateChars(chars, direction);
  });
};

/**
 * Handles transition from carousel view to preview grid
 *
 * @param {Event} e - Click event triggered from `.scene__title`
 */
const activatePreviewFromCarousel = (e) => {
  e.preventDefault();
  if (isAnimating) return;
  isAnimating = true;

  const titleEl = e.currentTarget;
  const { wrapper, carousel, cards, chars } =
    getSceneElementsFromTitle(titleEl);

  // Calculate scroll position to center the scene
  const offsetTop = wrapper.getBoundingClientRect().top + window.scrollY;
  const targetY = offsetTop - window.innerHeight / 2 + wrapper.offsetHeight / 2;

  // Temporarily disable scroll-based animations
  ScrollTrigger.getAll().forEach((t) => t.disable(false));

  gsap
    .timeline({
      defaults: { duration: 1.5, ease: 'power2.inOut' },
      onComplete: () => {
        isAnimating = false;
        ScrollTrigger.getAll().forEach((t) => t.enable());
        carousel._timeline.scrollTrigger.scroll(targetY);
      },
    })
    .to(window, {
      onStart: () => {
        lockUserScroll();
      },
      onComplete: () => {
        unlockUserScroll();
        smoother.paused(true);
      },
      scrollTo: { y: targetY, autoKill: true },
    })
    .to(
      chars,
      {
        autoAlpha: 0,
        duration: 0.02,
        ease: 'none',
        stagger: { each: 0.04, from: 'end' },
      },
      0
    )
    .to(carousel, { rotationX: 90, rotationY: -360, z: -2000 }, 0)
    .to(
      carousel,
      {
        duration: 2.5,
        ease: 'power3.inOut',
        z: 1500,
        rotationZ: 270,
        onComplete: () => gsap.set(sceneWrapper, { autoAlpha: 0 }),
      },
      0.7
    )
    .to(cards, { rotationZ: 0 }, 0)
    .add(() => {
      const previewSelector = titleEl.querySelector('a')?.getAttribute('href');
      const preview = document.querySelector(previewSelector);
      gsap.set(preview, { pointerEvents: 'auto', autoAlpha: 1 });
      animatePreviewGridIn(preview);
      animatePreviewTexts(preview, 'in');
    }, '<+=1.9');
};

/**
 * Handles transition from preview grid back to carousel view
 *
 * @param {Event} e - Click event triggered from `.preview__close`
 */
const deactivatePreviewToCarousel = (e) => {
  if (isAnimating) return;
  isAnimating = true;

  const preview = e.currentTarget.closest('.preview');
  if (!preview) return;

  const { carousel, cards, chars } = getSceneElementsFromPreview(preview);

  animatePreviewTexts(preview, 'out');
  animatePreviewGridOut(preview);

  gsap.set(sceneWrapper, { autoAlpha: 1 });

  const progress = 0.5; // halfway
  /*
  BUG: progress should always be 0.5 but for some reason it's 0 sometimes
  const timeline = carousel._timeline;
  const scrollTrigger = timeline?.scrollTrigger;
  const progress = scrollTrigger?.progress ?? 0;
  */

  const { rotationX, rotationY, rotationZ } = getInterpolatedRotation(progress);

  gsap
    .timeline({
      delay: 0.7,
      defaults: { duration: 1.3, ease: 'expo' },
      onComplete: () => {
        smoother.paused(false);
        isAnimating = false;
      },
    })
    .fromTo(
      chars,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.02,
        ease: 'none',
        stagger: { each: 0.04, from: 'start' },
      }
    )
    .fromTo(
      carousel,
      {
        z: -550,
        rotationX,
        rotationY: -720,
        rotationZ,
        yPercent: 300,
      },
      {
        rotationY,
        yPercent: 0,
      },
      0
    )
    .fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.3);
};

/**
 * Adds click event listeners to scene titles and preview close buttons
 *
 * @returns {void}
 */
const initEventListeners = () => {
  // When a scene title is clicked, activate the preview
  document.querySelectorAll('.scene__title').forEach((title) => {
    title.addEventListener('click', activatePreviewFromCarousel);
  });

  // When a preview close button is clicked, deactivate the preview
  document.querySelectorAll('.preview__close').forEach((btn) => {
    btn.addEventListener('click', deactivatePreviewToCarousel);
  });
};

/**
 * Starts auto-rotation for a carousel
 */
const startCarouselAutoRotation = (carousel) => {
  if (!CAROUSEL_AUTO_ROTATION_CONFIG.enabled) return;
  
  carousel._autoRotation = {
    currentRotation: 0,
    isActive: true,
    isPaused: false,
    pauseTimeout: null
  };
  
  const rotateStep = () => {
    if (!carousel._autoRotation?.isActive) return;
    
    if (!carousel._autoRotation.isPaused && !isAnimating) {
      carousel._autoRotation.currentRotation += CAROUSEL_AUTO_ROTATION_CONFIG.speed;
      
      // Apply the rotation while preserving scroll-based rotations
      const scrollProgress = carousel._timeline?.scrollTrigger?.progress || 0;
      const scrollRotation = gsap.utils.interpolate(0, -180, scrollProgress);
      const totalRotation = carousel._autoRotation.currentRotation + scrollRotation;
      
      gsap.set(carousel, { 
        rotationY: totalRotation,
        overwrite: false
      });
    }
    
    if (carousel._autoRotation?.isActive) {
      requestAnimationFrame(rotateStep);
    }
  };
  
  requestAnimationFrame(rotateStep);
};

/**
 * Pauses auto-rotation temporarily
 */
const pauseCarouselAutoRotation = (carousel, duration = CAROUSEL_AUTO_ROTATION_CONFIG.pauseDuration) => {
  if (!carousel._autoRotation) return;
  
  carousel._autoRotation.isPaused = true;
  
  // Clear any existing pause timeout
  if (carousel._autoRotation.pauseTimeout) {
    clearTimeout(carousel._autoRotation.pauseTimeout);
  }
  
  // Resume after specified duration
  carousel._autoRotation.pauseTimeout = setTimeout(() => {
    if (carousel._autoRotation) {
      carousel._autoRotation.isPaused = false;
    }
  }, duration);
};

/**
 * Stops auto-rotation completely
 */
const stopCarouselAutoRotation = (carousel) => {
  if (carousel._autoRotation) {
    carousel._autoRotation.isActive = false;
    if (carousel._autoRotation.pauseTimeout) {
      clearTimeout(carousel._autoRotation.pauseTimeout);
    }
    carousel._autoRotation = null;
  }
};

/**
 * Initializes all carousels on the page
 *
 * @returns {void}
 */
const initCarousels = () => {
  document.querySelectorAll('.carousel').forEach((carousel) => {
    setupCarouselCells(carousel); // Position carousel cells in 3D
    carousel._timeline = createScrollAnimation(carousel); // Attach scroll animation timeline
    
    // Start auto-rotation
    startCarouselAutoRotation(carousel);
    
    // Add hover pause functionality
    if (CAROUSEL_AUTO_ROTATION_CONFIG.pauseOnHover) {
      carousel.addEventListener('mouseenter', () => pauseCarouselAutoRotation(carousel));
    }
    
    // Add interaction pause functionality
    if (CAROUSEL_AUTO_ROTATION_CONFIG.pauseOnInteraction) {
      carousel.addEventListener('click', () => pauseCarouselAutoRotation(carousel));
    }
  });
};

function preventScroll(e) {
  e.preventDefault();
}

function lockUserScroll() {
  window.addEventListener('wheel', preventScroll, { passive: false });
  window.addEventListener('touchmove', preventScroll, { passive: false });
  window.addEventListener('keydown', preventArrowScroll, false);
}

function unlockUserScroll() {
  window.removeEventListener('wheel', preventScroll);
  window.removeEventListener('touchmove', preventScroll);
  window.removeEventListener('keydown', preventArrowScroll);
}

function preventArrowScroll(e) {
  const keys = [
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    'Home',
    'End',
    ' ',
  ];
  if (keys.includes(e.key)) e.preventDefault();
}

// Card rotation configuration
const CARD_ROTATION_CONFIG = {
  enableHover: true,
  rotationDuration: 0.6,
  hoverScale: 1.05,
  easingFunction: "back.out(1.7)",
  autoRotate: false,
  autoRotateInterval: 5000
};

// Carousel auto-rotation configuration
const CAROUSEL_AUTO_ROTATION_CONFIG = {
  enabled: true,
  speed: 0.2, // Degrees per frame (very slow)
  pauseOnHover: true,
  pauseOnInteraction: true,
  pauseDuration: 3000 // How long to pause after interaction (ms)
};

/**
 * Adds click handlers for individual card rotation
 */
const initCardRotation = () => {
  document.querySelectorAll('.card').forEach((card, index) => {
    // Add rotation state tracking
    card._rotationState = {
      isFlipped: false,
      rotationY: 0,
      isAnimating: false
    };
    
    // Add click event listener
    card.addEventListener('click', (e) => handleCardClick(e, card));
    
    // Add hover effects if enabled
    if (CARD_ROTATION_CONFIG.enableHover) {
      card.addEventListener('mouseenter', () => addCardHoverEffect(card));
      card.addEventListener('mouseleave', () => removeCardHoverEffect(card));
    }
    
    // Add keyboard support for accessibility
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', 'Click to rotate card');
    
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(e, card);
      }
    });
  });
};

/**
 * Handles card click for rotation
 */
const handleCardClick = (e, card) => {
  e.stopPropagation(); // Prevent triggering scene navigation
  
  if (card._rotationState.isAnimating || isAnimating) return;
  
  // Get rotation type from data attribute or default to flip
  const rotationType = card.dataset.rotationType || 'flip';
  rotateCard(card, rotationType);
};

/**
 * Rotates individual card with multiple rotation options
 */
const rotateCard = (card, rotationType = 'flip') => {
  const state = card._rotationState;
  if (state.isAnimating) return;
  
  state.isAnimating = true;
  
  const rotations = {
    flip: () => {
      state.isFlipped = !state.isFlipped;
      return state.isFlipped ? 180 : 0;
    },
    spin: () => {
      state.rotationY += 360;
      return state.rotationY;
    },
    wobble: () => {
      // Create wobble effect
      const timeline = gsap.timeline();
      timeline
        .to(card, { rotationY: "+=15", duration: 0.1, ease: "power2.out" })
        .to(card, { rotationY: "-=30", duration: 0.1, ease: "power2.out" })
        .to(card, { rotationY: "+=15", duration: 0.1, ease: "power2.out" });
      return null; // Handled by timeline
    }
  };
  
  if (rotationType === 'wobble') {
    rotations.wobble();
    setTimeout(() => state.isAnimating = false, 300);
    return;
  }
  
  const targetRotation = rotations[rotationType]();
  
  gsap.to(card, {
    rotationY: targetRotation,
    duration: CARD_ROTATION_CONFIG.rotationDuration,
    ease: CARD_ROTATION_CONFIG.easingFunction,
    onComplete: () => {
      state.isAnimating = false;
      // Update aria-label based on flip state
      if (rotationType === 'flip') {
        card.setAttribute('aria-label', 
          state.isFlipped ? 'Card flipped - click to flip back' : 'Card normal - click to flip'
        );
      }
    }
  });
};

/**
 * Add hover effects to cards
 */
const addCardHoverEffect = (card) => {
  if (card._rotationState.isAnimating) return;
  
  gsap.to(card, {
    scale: CARD_ROTATION_CONFIG.hoverScale,
    rotationX: 5,
    duration: 0.3,
    ease: "power2.out"
  });
};

/**
 * Remove hover effects from cards
 */
const removeCardHoverEffect = (card) => {
  if (card._rotationState.isAnimating) return;
  
  gsap.to(card, {
    scale: 1,
    rotationX: 0,
    duration: 0.3,
    ease: "power2.out"
  });
};

/**
 * Initializes text splitting, carousels, and event listeners
 *
 * @returns {void}
 */
const init = () => {
  initTextsSplit(); // Prepare character-level splits for animations
  initCarousels(); // Set up carousels with transforms and scroll triggers
  initCardRotation(); // Initialize card rotation functionality
  initEventListeners(); // Bind all interactive handlers
  window.addEventListener('resize', ScrollTrigger.refresh); // Refresh triggers on resize
};

// Start app once images are preloaded
preloadImages('.grid__item-image').then(() => {
  document.body.classList.remove('loading'); // Remove loading state from body
  init(); // Begin initialization
});

// Make rotateCard function globally available for onclick handlers
window.rotateCard = rotateCard;

// Image Preview Modal Functionality
const initImagePreviewModal = () => {
  const modal = document.getElementById('image-preview-modal');
  const modalImage = document.getElementById('modal-image');
  const modalTitle = document.getElementById('modal-title');
  const modalClose = document.querySelector('.modal-close');
  const gridItems = document.querySelectorAll('.grid__item[data-image]');

  let touchStartY = 0;
  let touchEndY = 0;

  // Open modal
  const openModal = (imageSrc, title) => {
    modalImage.src = imageSrc;
    modalTitle.textContent = title;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scroll
    
    // Add entrance animation
    gsap.fromTo(modal, 
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );
  };

  // Close modal
  const closeModal = () => {
    gsap.to(modal, {
      opacity: 0,
      scale: 0.9,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
      }
    });
  };

  // Event listeners for grid items
  gridItems.forEach(item => {
    // Click event
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const imageSrc = item.dataset.image;
      const title = item.dataset.title;
      openModal(imageSrc, title);
    });

    // Touch events for better mobile interaction
    item.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    item.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      const touchDiff = Math.abs(touchStartY - touchEndY);
      
      // Only open modal if it's a tap (not a swipe)
      if (touchDiff < 10) {
        const imageSrc = item.dataset.image;
        const title = item.dataset.title;
        openModal(imageSrc, title);
      }
    }, { passive: true });
  });

  // Close modal on button click
  modalClose.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  // Close modal on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // Touch events for modal close on swipe down
  modal.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  modal.addEventListener('touchmove', (e) => {
    if (e.target === modal) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartY;
      
      if (diff > 50) { // Swipe down threshold
        closeModal();
      }
    }
  }, { passive: true });

  // Prevent zoom on double tap for images
  modalImage.addEventListener('dblclick', (e) => {
    e.preventDefault();
  });

  // Add haptic feedback for mobile devices
  const addHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Add haptic feedback to grid item clicks
  gridItems.forEach(item => {
    item.addEventListener('click', addHapticFeedback);
    item.addEventListener('touchend', addHapticFeedback);
  });
};

// Initialize image preview modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initImagePreviewModal();
});

// Mobile Menu Functionality
const initMobileMenu = () => {
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavBackdrop = document.getElementById('mobile-nav-backdrop');
  const mobileInfoBtn = document.getElementById('mobile-info-btn');
  const infoBtn = document.getElementById('info-btn');
  const infoModal = document.getElementById('info-modal');
  const closeModal = document.getElementById('close-modal');

  // Check if we're on mobile
  const isMobile = () => window.innerWidth < 768;

  // Open mobile menu
  const openMobileMenu = () => {
    if (!isMobile()) return; // Only work on mobile
    mobileNav.style.display = 'block';
    mobileNavBackdrop.style.display = 'block';
    // Force reflow before adding active class
    mobileNav.offsetHeight;
    mobileNav.classList.add('active');
    mobileNavBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    mobileNav.classList.remove('active');
    mobileNavBackdrop.classList.remove('active');
    // Hide after animation completes
    setTimeout(() => {
      mobileNav.style.display = 'none';
      mobileNavBackdrop.style.display = 'none';
    }, 300);
    document.body.style.overflow = ''; // Restore scroll
  };

  // Event listeners
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMobileMenu();
    });
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
    });
  }

  // Close menu when clicking backdrop
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', (e) => {
      if (e.target === mobileNavBackdrop) {
        closeMobileMenu();
      }
    });
  }

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Close menu on window resize to desktop
  window.addEventListener('resize', () => {
    if (!isMobile() && mobileNav.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Mobile info button functionality
  if (mobileInfoBtn && infoModal) {
    mobileInfoBtn.addEventListener('click', () => {
      closeMobileMenu(); // Close mobile menu first
      infoModal.classList.remove('hidden');
      infoModal.classList.add('flex');
    });
  }

  // Close info modal functionality (if not already implemented)
  if (closeModal && infoModal) {
    closeModal.addEventListener('click', () => {
      infoModal.classList.add('hidden');
      infoModal.classList.remove('flex');
    });
  }

  // Close info modal when clicking outside
  if (infoModal) {
    infoModal.addEventListener('click', (e) => {
      if (e.target === infoModal) {
        infoModal.classList.add('hidden');
        infoModal.classList.remove('flex');
      }
    });
  }

  // Desktop info button functionality (if not already implemented)
  if (infoBtn && infoModal) {
    infoBtn.addEventListener('click', () => {
      infoModal.classList.remove('hidden');
      infoModal.classList.add('flex');
    });
  }
};

// Initialize mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
});
