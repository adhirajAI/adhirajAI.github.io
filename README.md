# Adhiraj Banerjee Research Portfolio

Updated static GitHub Pages landing page with automatic paper and video previews.

## What changed

- Paper cards now render first-page PDF thumbnails using browser-side PDF.js.
- Desktop paper layout is cleaner:
  - left column: venue/meta and links
  - right column: PDF thumbnail + title/overview stacked top-down
- Mobile paper layout keeps thumbnails and collapses cleanly.
- Talks and presentations now render as media cards.
- Direct YouTube video URLs auto-generate thumbnails and play inline on click.
- YouTube playlists and external presentation pages render as preview cards and open in a new tab.

## Files

- `index.html` — landing page with SEO metadata and preview containers
- `styles.css` — responsive paper/media layout
- `script.js` — data-driven paper cards, PDF.js thumbnail rendering, YouTube thumbnail/player logic

## Important notes

PDF thumbnails depend on the PDF host allowing browser access. arXiv usually works well. Some PDF hosts may block client-side rendering because of CORS; when that happens, the card falls back to a clean PDF preview placeholder while still linking to the paper/PDF.

## Deploy on GitHub Pages

1. Copy these files into your `adhirajAI.github.io` repository branch.
2. Commit and push the branch.
3. Test the branch through GitHub Pages or locally.
4. Merge into `main` after review.

## Customize

Edit the `PAPERS` and `MEDIA_ITEMS` arrays in `script.js` to add or change paper links, PDF URLs, code links, video links, and descriptions.
