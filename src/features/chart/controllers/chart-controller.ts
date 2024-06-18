import { TBars } from "src/app/page";
import { MouseEventHandler } from "./helpers/mouse-event-handler ";


function addSecondsToDate(secondsToAdd: number, chunkStart: number) {
  // Calculate new date by adding seconds to the chunk start time
  const newDate = new Date(chunkStart * 1000 + secondsToAdd * 1000); // Convert seconds to milliseconds

  // Extract hours, minutes, and seconds from the new date
  const hours = newDate.getHours();
  const minutes = newDate.getMinutes();
  const seconds = newDate.getSeconds();

  // Return formatted time
  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds,
  };
}

export class ChartController {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  data: TBars;
  chunkStart: number;
  scale: number;
  translateX: number = 800;
  translateY: number = 20;
  spacing: number = 40;
  startY: number = 0;
  startX: number = 0;
  textOffset: number = 20;
  textBaseSize: number = 12;
  //scale
  minScale: number = 0.15;
  maxScale: number = 1;
  // dragging
  isDragging: boolean;
  dragStartX: number = 0;
  dragStartY: number = 0;
  private eventHandler: MouseEventHandler;

  constructor(
    canvas: HTMLCanvasElement,
    data: { ChunkStart: number; Bars: TBars }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.data = data.Bars;
    this.scale = 0.7;
    this.startY = this.canvas.height - 40;
    this.startX = this.canvas.width - this.spacing * this.data.length;
    this.chunkStart = data.ChunkStart;
    this.isDragging = false;

    this.eventHandler = new MouseEventHandler(this);
    this.eventHandler.initializeEventListeners();
  }

  _drawHorizontalLine() {
    const totalWidth = this.startX + this.spacing * this.data.length;

    this.ctx.beginPath();
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(totalWidth, this.startY);
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
  }
  _addLineItems(y: number = this.startY) {
    const spacing = this.spacing; // Fixed spacing between bars

    // Calculate the maximum font size based on the spacing between bars
    const maxFontSize = spacing * this.scale; // Adjust as per your scaling needs

    // Adjust font size dynamically based on spacing
    const fontSize = Math.min(this.textBaseSize, maxFontSize);

    this.ctx.font = `${fontSize}px Arial`;

    this.data.forEach((item, index) => {
      const textX = this.startX + index * spacing;
      const textY = y + this.textOffset;

      const { hours, minutes } = addSecondsToDate(item.Time, this.chunkStart);

      this.ctx.fillText(`${hours}:${minutes}`, textX, textY);
    });
  }

  _drawChartItems() {
    const maxValue = Math.max(
      ...this.data.map((item) => Math.max(item.High, item.Low))
    );
    const minValue = Math.min(
      ...this.data.map((item) => Math.min(item.High, item.Low))
    );
    const valueRange = maxValue - minValue;
    const canvasHeight = this.canvas.height - this.startY;

    const rectWidth = 8; // Adjust the width of the rectangles
    const rectOffset = rectWidth / 2; // Adjust offset to center the rectangles
    const rectHeightFactor = 8; // Adjust this factor to increase the height

    this.data.forEach((item, index) => {
      const currentPos = this.startX + this.spacing * index;

      // Calculate the scaled positions
      const scaledLow =
        this.startY - ((item.Low - minValue) / valueRange) * canvasHeight;
      const scaledHigh =
        this.startY - ((item.High - minValue) / valueRange) * canvasHeight;

      // Calculate the height of the rectangle with increased height
      let rectHeight = (scaledHigh - scaledLow) * rectHeightFactor;

      // Adjust for the bottom boundary of the chart
      if (scaledLow + rectHeight > this.canvas.height - 40) {
        rectHeight = this.canvas.height - 40 - scaledLow;
      }

      // Draw the vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(currentPos, this.startY);
      this.ctx.lineTo(currentPos, canvasHeight);
      this.ctx.strokeStyle = "black";
      this.ctx.stroke();

      // Draw the tick mark (rectangle) for High and Low values
      this.ctx.fillStyle = "blue";
      this.ctx.fillRect(
        currentPos - rectOffset, // Adjust to center the rectangle
        scaledLow, // Use scaledLow as the y-coordinate
        rectWidth, // Width of the rectangle
        rectHeight // Height of the rectangle
      );
    });
  }


  drawChart() {
    const { ctx, scale, translateX, translateY } = this;

    // Clear previous content
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save the current state
    ctx.save();

    // Apply transformations
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);

    // Draw the rectangle (or other shapes)
    this._drawChartItems();
    this._addLineItems();
    this._drawHorizontalLine();

    // Restore the original state
    ctx.restore();
  }

  clearChart() {
    // Clear the canvas completely
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
