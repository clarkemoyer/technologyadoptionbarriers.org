# TABS Presentation

## Overview

The TABS Presentation is an interactive, web-based slideshow that introduces the Technology Adoption Barriers Survey (TABS) project. It provides a comprehensive overview of the project's mission, challenges, solutions, and roadmap.

## Accessing the Presentation

- **Direct URL**: `/tabs-presentation`
- **From Media Page**: Navigate to the Media page and click "View Presentation"

## Features

### Interactive Navigation

- **Mouse/Touch**: Click "Next →" and "← Prev" buttons
- **Keyboard Shortcuts**:
  - `→` (Right Arrow) or `Space`: Next slide
  - `←` (Left Arrow): Previous slide
- **Slide Counter**: Shows current slide number (e.g., "1 / 8")

### Slides

The presentation contains 8 slides:

1. **Title Slide**: Introduction to TABS with contact information
2. **From Obstacle to Opportunity**: The challenge and solution
3. **Adopt or Risk Obsolescence**: Strategic context and market risks
4. **The Data Gap: Paywalls**: Comparison of theory, paywalls, and open-source approach
5. **A Longitudinal Insights Tool**: TABS methodology and purpose
6. **Roadmap to Insight**: Four-phase project timeline
7. **Measuring Leadership Perceptions**: Scope and focus areas
8. **Benchmarking Excellence**: Inspiration from The CMO Survey

### Design Features

- **Professional Tech Theme**: Dark blue background with cyan/blue gradient accents
- **Custom Typography**: Uses Outfit, Plus Jakarta Sans, and Fira Code fonts
- **ASCII Art**: Technical diagrams and illustrations
- **Terminal Windows**: Mock terminal displays for technical aesthetic
- **Timeline Visualization**: Project roadmap with version markers
- **Responsive Layout**: Adapts to different screen sizes

## Technical Implementation

### Architecture

- **Framework**: Next.js 16 with React 19
- **Rendering**: Client-side component (`'use client'`)
- **Layout**: Custom layout without site header/footer
- **Styling**: CSS module with CSS variables for fonts

### Files

```
src/app/tabs-presentation/
├── layout.tsx          # Custom layout (no header/footer)
├── page.tsx            # Main presentation component
└── presentation.css    # Presentation styles
```

### Fonts

Three custom fonts are loaded via Next.js font optimization:

- **Outfit**: Headings (300, 400, 600, 700)
- **Plus Jakarta Sans**: Body text (400, 500, 700)
- **Fira Code**: Code/monospace elements (400, 500)

### External Dependencies

- **Font Awesome 6.5.1**: Icon library (loaded from CDN)

## Development

### Local Testing

```bash
# Development server
npm run dev

# Navigate to http://localhost:3000/tabs-presentation
```

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Navigate to http://localhost:3000/tabs-presentation
```

### Code Quality

The presentation follows all project standards:

- ✅ Prettier formatting
- ✅ ESLint rules
- ✅ TypeScript type safety
- ✅ React hooks best practices
- ✅ Accessibility considerations

## Customization

### Adding Slides

To add a new slide:

1. Update `totalSlides` constant in `page.tsx`
2. Add a new slide container div with appropriate `id`
3. Use conditional rendering based on `currentSlide === [number]`
4. Follow existing slide structure and styling

### Styling

All styles are in `presentation.css`. Key classes:

- `.slide-container`: Main slide wrapper
- `.slide-title`: Slide heading with decorative code tag
- `.two-column`: Two-column layout
- `.ascii-art`: Monospace ASCII diagrams
- `.terminal-window`: Terminal mockup
- `.timeline-layout`: Timeline visualization

## Accessibility

- Keyboard navigation fully supported
- Semantic HTML structure
- ARIA labels on navigation buttons
- Screen reader friendly content
- High contrast text for readability

## Future Enhancements

Potential improvements:

- [ ] Add slide transitions/animations
- [ ] Include presenter notes
- [ ] Add fullscreen mode
- [ ] Export to PDF functionality
- [ ] Auto-advance option
- [ ] Slide thumbnails navigation
- [ ] URL-based slide linking (e.g., `/tabs-presentation#3`)

## Credits

**Content**: Clarke Moyer, Lead Researcher
**Design**: Professional tech presentation aesthetic
**Implementation**: Next.js with modern React patterns

## Contact

For questions or suggestions about the presentation:

- **Email**: cbm6118@psu.edu
- **Phone**: 520-222-8104
- **Website**: [technologyadoptionbarriers.org](https://technologyadoptionbarriers.org)
