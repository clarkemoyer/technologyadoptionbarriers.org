# Content Extraction Guide

This guide provides step-by-step instructions for extracting content from the live technologyadoptionbarriers.org website and preparing it for migration into this React application.

## Prerequisites

- Access to https://technologyadoptionbarriers.org/
- Web browser with Developer Tools (Chrome, Firefox, or Edge recommended)
- Text editor for documentation
- Image editor (optional, for image optimization)

## Quick Start

### Step 1: Initial Site Assessment

1. Visit https://technologyadoptionbarriers.org/
2. Take full-page screenshots for reference
3. Note the overall structure and layout
4. Identify all major sections
5. Count the number of pages (single-page vs. multi-page)

### Step 2: Extract Page Structure

```bash
# In your browser's Developer Tools Console, run:

// Get all headings
console.log([...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(h => ({
  tag: h.tagName,
  text: h.textContent.trim()
})));

// Get all sections
console.log([...document.querySelectorAll('section')].map((s, i) => ({
  index: i,
  id: s.id,
  class: s.className,
  text: s.textContent.substring(0, 100) + '...'
})));

// Get all images
console.log([...document.querySelectorAll('img')].map(img => ({
  src: img.src,
  alt: img.alt,
  width: img.naturalWidth,
  height: img.naturalHeight
})));

// Get all links
console.log([...document.querySelectorAll('a')].map(a => ({
  text: a.textContent.trim(),
  href: a.href
})));
```

### Step 3: Save Complete Page

**Method 1: Browser Save (Recommended)**
1. Right-click on the page
2. Select "Save As" or "Save Page As"
3. Choose "Web Page, Complete" or "HTML Complete"
4. Save to a folder named `live-site-backup`
5. This saves HTML + all assets in a folder

**Method 2: Using wget (Linux/Mac/WSL)**
```bash
# Install wget if needed
# Ubuntu/Debian: sudo apt-get install wget
# Mac: brew install wget

# Download entire site
wget --mirror --page-requisites --adjust-extension --convert-links \
     --backup-converted --no-parent \
     https://technologyadoptionbarriers.org/

# The site will be saved to ./technologyadoptionbarriers.org/
```

**Method 3: Using HTTrack (Windows/Mac/Linux)**
```bash
# Install HTTrack from https://www.httrack.com/

# Run HTTrack GUI or command line:
httrack https://technologyadoptionbarriers.org/ \
        -O "./live-site-backup" \
        "+*.technologyadoptionbarriers.org/*"
```

### Step 4: Extract Content Section by Section

Create a content inventory file (e.g., `content-inventory.md`) with this structure:

```markdown
# Content Inventory: technologyadoptionbarriers.org

## Hero Section
**Location:** Top of page
**Headline:** [Copy exact text]
**Subheadline:** [Copy exact text]
**CTA Buttons:** 
- Button 1: "[Text]" → [URL]
- Button 2: "[Text]" → [URL]
**Background Image:** [filename if any]
**Hero Image:** [filename]

## Mission/About Section
**Location:** Below hero
**Heading:** [Copy exact text]
**Body Text:**
[Copy complete text]

**Images:**
- Image 1: [filename]

## [Next Section Name]
...continue for each section...
```

### Step 5: Download All Images

**Manual Method:**
1. Right-click on each image
2. Select "Save Image As"
3. Save to `/tmp/extracted-images/`
4. Use descriptive filenames (e.g., `hero-background.jpg`)
5. Document original filenames and alt text

**Automated Method:**
```bash
# In browser Developer Tools Console:
// Get all unique image URLs
const images = [...new Set([...document.querySelectorAll('img')].map(img => img.src))];
console.log(images.join('\n'));

# Then save the list and download with wget:
wget -i image-urls.txt -P /tmp/extracted-images/
```

**Image Processing:**
```bash
# Convert images to WebP for optimization (requires imagemagick)
cd /tmp/extracted-images/
for img in *.jpg *.png; do
  convert "$img" -quality 85 "${img%.*}.webp"
done
```

### Step 6: Extract Metadata

```bash
# In browser Developer Tools Console:

// Get page title
console.log('Title:', document.title);

// Get meta description
console.log('Description:', document.querySelector('meta[name="description"]')?.content);

// Get meta keywords
console.log('Keywords:', document.querySelector('meta[name="keywords"]')?.content);

// Get Open Graph data
console.log('OG Data:', [...document.querySelectorAll('meta[property^="og:"]')].map(m => ({
  property: m.getAttribute('property'),
  content: m.content
})));

// Get all meta tags
console.log([...document.querySelectorAll('meta')].map(m => ({
  name: m.name || m.getAttribute('property'),
  content: m.content
})));
```

Save this information to document the SEO settings.

### Step 7: Extract Structured Data

Check for JSON-LD structured data:

```javascript
// In browser console:
console.log([...document.querySelectorAll('script[type="application/ld+json"]')]
  .map(s => JSON.parse(s.textContent)));
```

### Step 8: Test Extracted Content

1. Open saved HTML file in browser
2. Verify all text is readable
3. Verify all images display
4. Verify all links work (may need adjustment)
5. Take screenshots for comparison

## Content Organization

Organize extracted content into these folders:

```
/tmp/live-site-extraction/
├── html/
│   ├── index.html           # Saved complete page
│   └── assets/              # Associated assets from save
├── images/
│   ├── original/            # Original format images
│   └── optimized/           # WebP optimized images
├── content/
│   ├── content-inventory.md # Complete content documentation
│   ├── hero-section.txt     # Individual section content
│   ├── mission-section.txt
│   └── ...
├── metadata/
│   ├── seo-data.json        # Extracted SEO metadata
│   └── structured-data.json # JSON-LD structured data
└── screenshots/
    ├── full-page.png        # Full page screenshots
    ├── desktop-hero.png     # Section screenshots
    ├── mobile-view.png
    └── ...
```

## Content Documentation Template

For each content section, create a file with this structure:

```markdown
# [Section Name]

**Extracted Date:** YYYY-MM-DD
**Source URL:** https://technologyadoptionbarriers.org/#section-id
**Component Target:** src/components/home-page/[Component]/

## Visual Reference
[Screenshot filename: section-screenshot.png]

## Content

### Heading
[Exact heading text]

### Body Text
[Exact body text, preserving formatting]

### Lists (if any)
- Item 1
- Item 2
- Item 3

### Links
- [Link text](URL) - Description
- [Link text](URL) - Description

### Images
- **hero-image.jpg**
  - Alt text: [alt text]
  - Dimensions: 1200x800
  - Location: Center of section
  - Notes: Main focal point

### Buttons/CTAs
- **Button 1:** "[Text]"
  - Action: [Navigation, Form, External link]
  - Target: [URL or section ID]
  - Style: [Primary, Secondary, etc.]

## Implementation Notes
- [Any special considerations]
- [Layout or positioning requirements]
- [Responsive behavior notes]

## Styling
- Background color: [color code]
- Text color: [color code]
- Font sizes: [list any specific sizes]
- Spacing: [padding/margin notes]
```

## Special Considerations

### Forms
If the site has forms:
1. Document all form fields (name, type, required/optional)
2. Note validation rules
3. Document submission endpoint/action
4. Note any JavaScript validation
5. Test form submission to understand backend

### Dynamic Content
If content loads dynamically:
1. Scroll through entire page to trigger lazy loading
2. Wait for all content to load
3. Use browser Developer Tools → Network tab to identify API endpoints
4. Document API structure for potential future integration

### Videos
1. Identify video hosting platform (YouTube, Vimeo, self-hosted)
2. Document video IDs or URLs
3. Note embed settings (autoplay, controls, etc.)
4. Download thumbnail images
5. For self-hosted videos, may need special permission to download

### Animations
1. Note any animated elements
2. Document animation triggers (scroll, click, hover)
3. Describe animation behavior
4. Consider if animation is essential to user experience

## Quality Checklist

Before considering extraction complete:

- [ ] All text content documented
- [ ] All images downloaded and cataloged
- [ ] All links documented and tested
- [ ] Metadata extracted (title, description, keywords)
- [ ] Color scheme documented
- [ ] Font families identified
- [ ] Responsive breakpoints noted
- [ ] All sections identified and mapped
- [ ] Screenshots taken for reference
- [ ] Content organized in clear folder structure
- [ ] README created explaining extraction process
- [ ] Migration plan updated with findings

## Automation Scripts

### Extract All Text Content

Save as `extract-text.js` and run in browser console:

```javascript
// Extract all visible text by section
function extractTextContent() {
  const sections = document.querySelectorAll('section, article, div[class*="section"]');
  const content = [];
  
  sections.forEach((section, index) => {
    const id = section.id || `section-${index}`;
    const heading = section.querySelector('h1, h2, h3, h4, h5, h6')?.textContent.trim();
    const paragraphs = [...section.querySelectorAll('p')].map(p => p.textContent.trim());
    
    content.push({
      id,
      heading,
      paragraphs,
      html: section.innerHTML
    });
  });
  
  return content;
}

// Run and download as JSON
const siteContent = extractTextContent();
const blob = new Blob([JSON.stringify(siteContent, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'site-content.json';
a.click();
```

### Extract Color Palette

```javascript
// Extract computed colors from all elements
function extractColors() {
  const elements = document.querySelectorAll('*');
  const colors = new Set();
  
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    colors.add(style.backgroundColor);
    colors.add(style.color);
    colors.add(style.borderColor);
  });
  
  return [...colors]
    .filter(c => c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent')
    .sort();
}

console.log('Color Palette:', extractColors());
```

### Extract Font Families

```javascript
// Extract all fonts used
function extractFonts() {
  const elements = document.querySelectorAll('*');
  const fonts = new Set();
  
  elements.forEach(el => {
    const style = window.getComputedStyle(el);
    fonts.add(style.fontFamily);
  });
  
  return [...fonts].sort();
}

console.log('Font Families:', extractFonts());
```

## Next Steps

After content extraction is complete:

1. Update `MIGRATION_STATUS.md` with extraction completion dates
2. Begin mapping content to React components (see migration plan)
3. Create data files from extracted content
4. Update component text and props
5. Add optimized images to `public/Images/`
6. Test migrated content section by section
7. Iterate and refine

## Troubleshooting

### Issue: JavaScript-heavy site, content not visible in saved HTML
**Solution:** Use browser Developer Tools to wait for all content to load, then use "Print to PDF" or screenshot tools.

### Issue: Images have authentication or hotlink protection
**Solution:** Contact site owner for image access, or take screenshots and recreate graphics.

### Issue: Can't access certain pages
**Solution:** Check robots.txt, try Wayback Machine, or contact site administrator.

### Issue: Dynamic content changes on each visit
**Solution:** Document variations, decide on canonical version, may need to note this is dynamic.

## Help & Support

If you encounter issues during content extraction:

1. Check `MIGRATION_STATUS.md` for notes and decisions
2. Review similar extraction examples in repository issues
3. Contact repository maintainers for guidance
4. Open an issue with "content extraction" label

---

**See Also:**
- [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) - Track migration progress
- [README.md](./README.md) - Development setup and commands
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
