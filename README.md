# Package Tracking v2

A fast, lightweight web application for tracking packages across multiple courier services. Built with vanilla HTML, CSS, and JavaScript - no frameworks, no dependencies.

## Features

- **Multi-carrier support**: Track packages from 10+ popular carriers including Australia Post, DHL, FedEx, UPS, TNT, and more
- **Smart shortcuts**: Use prefixes like `ap:123456` to instantly jump to a specific carrier's tracking page
- **Responsive design**: Works seamlessly on desktop and mobile devices
- **SEO optimized**: Includes structured data (JSON-LD) for better search engine visibility
- **Performance focused**: Lazy-loaded images and optimized CSS for fast loading
- **Accessible**: Proper ARIA labels and keyboard navigation support

## Supported Carriers

| Carrier | Shortcut | Logo |
|---------|----------|------|
| Aramex | `ar:` | ![Aramex](images/aramex.webp) |
| Australia Post | `ap:` | ![Australia Post](images/australia_post.webp) |
| Cainiao | `cn:` | ![Cainiao](images/cainiao.webp) |
| DHL | `dhl:` | ![DHL](images/dhl.webp) |
| FedEx | `fedex:` | ![FedEx](images/fedex.webp) |
| Star Track | `st:` | ![Star Track](images/star_track.webp) |
| Team Global Express | `tge:` | ![Team Global Express](images/tge.png) |
| TNT | `tnt:` | ![TNT](images/tnt.webp) |
| Toll | `toll:` | ![Toll](images/toll.webp) |
| UPS | `ups:` | ![UPS](images/ups.webp) |

## How to Use

### Basic Tracking

1. Enter your tracking number in the input field
2. Click on any carrier logo to track your package
3. The app will open the carrier's tracking page with your tracking number

### Using Shortcuts

For faster tracking, use carrier shortcuts:
- Type `ap:123456789` and press Enter to go directly to Australia Post
- Type `fedex:123456789` and press Enter to go directly to FedEx
- Available shortcuts: `ar`, `ap`, `cn`, `dhl`, `fedex`, `st`, `tge`, `tnt`, `toll`, `ups`

### Track Button

When you use a shortcut, a "Track" button appears. Click it to navigate to the selected carrier's tracking page.

## Live Demo

Visit the live site: [https://track.gock.net/](https://track.gock.net/)

## Development

This is a static site with no build process required. Simply open `index.html` in your browser or serve the files with any static server.

### File Structure

```
package-tracking-v2/
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── script.js           # Application logic and interactivity
├── images/             # Carrier logo assets
├── CNAME               # GitHub Pages custom domain
├── robots.txt          # Search engine crawling rules
├── sitemap.xml         # Site structure for search engines
└── favicon.svg         # Site favicon
```

### Key Technologies

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS Variables
- **Vanilla JavaScript**: ES6+ features, DOM manipulation, event handling
- **Inter Font**: Google Fonts for typography
- **WebP Images**: Optimized image format for logos

### Adding New Carriers

To add support for a new carrier:
1. Add the carrier logo to the `images/` folder (preferably WebP format)
2. Add a new `<a>` element in the `#services` section of `index.html`
3. Include `data-url`, `data-shortcut`, and proper `alt` attributes
4. Update this README with the new carrier information

## License

MIT License - see [LICENSE](LICENSE) file for details.

Copyright © Andy Gock
