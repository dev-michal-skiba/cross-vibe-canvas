# Project Requirements: Cross-Stitch Pattern Creator

A web application for creating cross-stitching patterns based on an uploaded image.

## Features:

1. The user can upload an image (e.g., JPG, PNG).
2. The user selects the canvas size (number of columns and rows in the grid, e.g., 30x30).
3. A grid with the specified dimensions is displayed over the uploaded image.
4. The user can toggle the visibility of the background image (e.g., "show/hide image").
5. The user can define a custom color palette (e.g., by entering HEX codes or using a color picker).
6. Each grid cell can be manually assigned a color from the palette.
7. The user can draw lines between any corners of any grid cells — each line can also be assigned a color from the palette (useful for outlining shapes).
8. The project can be saved as a `.zip` file containing:
   - the original uploaded image,
   - the color palette (e.g., list of HEX codes or named colors),
   - the grid dimensions,
   - the color assignments for each cell,
   - the drawn lines (positions and colors),
   - all data stored in a JSON file.
9. Project can be load from `.zip` file

## Technical Notes:

- A backend is not required — everything can run in the browser.
- Responsive design and smooth interaction (e.g., when zooming or resizing the grid) are preferred.
- The `.zip` file can be generated using a library like JSZip.
image.png