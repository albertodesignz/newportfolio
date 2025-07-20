# Om-Scroll 3D Carousel

A scroll based 3D carousel animation with a page transition effect.

![Image](https://tympanus.net/codrops/wp-content/uploads/2025/05/scroll3dcarousel_featured_final-1536x1152.jpg)

[Article on Codrops](https://tympanus.net/codrops/?p=93330)

[Demo](https://tympanus.net/Development/3DCarousel/)

## Installation

Run this demo on a [local server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server).

## Credits

- Images generated with [Midjourney](https://midjourney.com)

## Misc

Follow Codrops: [Bluesky](https://bsky.app/profile/codrops.bsky.social), [Facebook](http://www.facebook.com/codrops), [GitHub](https://github.com/codrops), [Instagram](https://www.instagram.com/codropsss/), [X](http://www.x.com/codrops)

## License

[MIT](LICENSE)

# 3D Carousel Portfolio

## Interactive Card Rotation Features

### Overview
This 3D carousel now includes interactive card rotation functionality that allows users to rotate individual cards while preserving the main carousel scroll animations.

### Features
- **Click to Rotate**: Click any card to rotate it based on its rotation type
- **Multiple Rotation Types**:
  - **Flip**: 180° flip to show the back face (default)
  - **Spin**: 360° rotation that returns to the front
  - **Wobble**: Subtle shake animation for feedback
- **Hover Controls**: Hover over cards to reveal rotation control buttons
- **Keyboard Support**: Use Enter or Space keys to rotate focused cards
- **Accessibility**: Full screen reader support and reduced motion compliance

## Auto-Rotation Carousel

### Overview
Each carousel section now features smooth auto-rotation, slowly showcasing all screenshots automatically while users browse.

### Features
- **Continuous Rotation**: Carousels slowly rotate at 0.2 degrees per frame
- **Smart Pausing**: Auto-rotation pauses on hover and user interactions
- **Seamless Integration**: Works perfectly with scroll-based animations
- **User-Friendly**: Automatically resumes after 3 seconds of inactivity

### Configuration
```javascript
const CAROUSEL_AUTO_ROTATION_CONFIG = {
  enabled: true,
  speed: 0.2, // Degrees per frame
  pauseOnHover: true,
  pauseOnInteraction: true,
  pauseDuration: 3000 // Pause duration in ms
};
```

## Frosted Glass Titles

### Overview
Section titles now feature beautiful frosted glass backgrounds that make them stand out while maintaining elegant transparency.

### Features
- **Glass Morphism**: Modern frosted glass effect using backdrop-filter
- **Cross-Browser Support**: Includes webkit prefixes for Safari compatibility
- **Responsive Design**: Adapts padding and blur radius for mobile devices
- **Accessibility**: High contrast mode support and reduced motion compliance
- **Interactive**: Subtle hover effects with gentle lift animation

### Styling Features
- Semi-transparent background with blur effect
- Subtle borders and inset shadows for depth
- Gradient overlays for enhanced glass appearance
- Enhanced text shadows for improved readability
- Smooth transitions for all interactive states

## Usage

### Direct Card Interaction
1. **Direct Click**: Simply click any card to rotate it using its default rotation type
2. **Control Buttons**: Hover over cards to reveal rotation control buttons:
   - **↻ Flip**: Flip the card to show the back
   - **⟲ Spin**: Perform a 360° spin animation
   - **～ Wobble**: Gentle shake for visual feedback

### Auto-Rotation Behavior
- Carousels automatically rotate to showcase all content
- Rotation pauses when you hover over the carousel
- Clicking anywhere on the carousel pauses rotation for 3 seconds
- Rotation seamlessly blends with scroll-triggered animations

### Accessibility
- **Keyboard Navigation**: Use Tab to focus cards, Enter/Space to rotate
- **Screen Readers**: Full ARIA labels and semantic markup
- **Reduced Motion**: Respects user's motion preferences
- **High Contrast**: Enhanced visibility in high contrast mode
- **Focus Indicators**: Clear visual focus indicators for keyboard users

## Performance Optimizations
- **RAF-Based Animation**: Uses requestAnimationFrame for smooth 60fps auto-rotation
- **GPU Acceleration**: All animations use GPU-accelerated transforms
- **Efficient Pausing**: Smart pause/resume system minimizes unnecessary calculations
- **Memory Management**: Proper cleanup of timeouts and animation loops

## Browser Support
- Modern browsers with CSS backdrop-filter support
- Graceful degradation for older browsers
- Mobile-optimized with touch interaction support
- Cross-platform performance optimization

## Implementation Details

### Auto-Rotation System
- Each carousel maintains its own rotation state
- Rotation integrates with existing scroll triggers
- Configurable speed and pause behavior
- Automatic cleanup on component destruction

### Glass Morphism Effects
- Multiple layers for realistic glass appearance
- Careful opacity and blur balance for readability
- Responsive blur intensity based on screen size
- Optimized rendering performance

## Development Notes
- Card rotation state is tracked individually for each card
- The main carousel scroll animation no longer applies Z-rotation to cards, preserving user interactions
- Control buttons are only visible on hover to maintain clean aesthetics
