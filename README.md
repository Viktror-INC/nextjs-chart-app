# Chart Application

This is a TypeScript and Next.js application designed to visualize chart data with interactive capabilities. Users can zoom in and out of the chart and drag it for better navigation.

## Project Structure

The project structure is organized into the following folders:

### `src/features/chart/controllers`

- **ChartController.ts**: Manages the main functionality of the chart, including event handling, drawing, and scaling operations.

#### `src/features/chart/controllers/helpers`

- **mouse-event-handler.ts**: Handles mouse events such as dragging and clicking on the canvas.

### `src/views/`

Contains page views for the application.

## Usage

To run the application locally:

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Start the development server with `npm run dev`.
4. Open the application in your browser at `http://localhost:3000`.

## Technologies Used

- TypeScript
- Next.js
- HTML5 Canvas API