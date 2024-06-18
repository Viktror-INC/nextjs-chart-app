import { TBars } from "src/app/page";

function getMousePos(canvas: HTMLCanvasElement, event: WheelEvent) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

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
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private data: TBars;
  private chunkStart: number;
  private scale: number;
  private translateX: number = 800;
  private translateY: number = 20;
  private spacing: number = 40;
  private startY: number = 0;
  private startX: number = 0;
  // dragging
  private isDragging: boolean;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private onMouseMoveHandler: (event: MouseEvent) => void;
  private onMouseUpHandler: (event: MouseEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    data: { ChunkStart: number; Bars: TBars }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.data = data.Bars;
    this.scale = 0.9;
    this.startY = this.canvas.height - 40;
    this.startX = 0;
    this.chunkStart = data.ChunkStart;
    this.isDragging = false;

    this.onMouseMoveHandler = this.onMouseMove.bind(this);
    this.onMouseUpHandler = this.onMouseUp.bind(this);
    this._initializeEventListeners();

    window.addEventListener("wheel", this.handleWheel.bind(this));
  }
  private _initializeEventListeners() {
    this.canvas.addEventListener("mousedown", this._grabbingItems.bind(this));
  }

  private _grabbingItems(event: MouseEvent) {
    if (!this.canvas) {
      console.error("Canvas is not initialized");
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.isDragging = true;
    this.dragStartX = mouseX;
    this.dragStartY = mouseY;

    this.canvas.addEventListener("mousemove", this.onMouseMoveHandler);
    this.canvas.addEventListener("mouseup", this.onMouseUpHandler);
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - this.dragStartX;
    const dy = mouseY - this.dragStartY;

    this.translateX += dx;
    this.translateY += dy;

    this.dragStartX = mouseX;
    this.dragStartY = mouseY;

    this.drawChart();
  }

  private onMouseUp() {
    this.isDragging = false;
    this.canvas.removeEventListener("mousemove", this.onMouseMoveHandler);
    this.canvas.removeEventListener("mouseup", this.onMouseUpHandler);
  }

  private _drawHorizontalLine() {
    const totalWidth = this.startX + this.spacing * this.data.length;

    this.ctx.beginPath();
    this.ctx.moveTo(this.startX, this.startY);
    this.ctx.lineTo(totalWidth, this.startY);
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
  }
  private _addLineItems(y: number = this.startY) {
    const textOffset = 20;
    const spacing = this.spacing; // Fixed spacing between bars
    const textBaseSize = 12; // Base font size for text

    // Calculate the maximum font size based on the spacing between bars
    const maxFontSize = spacing * this.scale; // Adjust as per your scaling needs

    // Adjust font size dynamically based on spacing
    const fontSize = Math.min(textBaseSize, maxFontSize);

    this.ctx.font = `${fontSize}px Arial`;

    this.data.forEach((item, index) => {
      const textX = this.startX + index * spacing;
      const textY = y + textOffset;

      const { hours, minutes } = addSecondsToDate(item.Time, this.chunkStart);

      this.ctx.fillText(`${hours}:${minutes}`, textX, textY);
    });
  }

  private _drawChartItems() {
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
  

  handleWheel(event: WheelEvent) {
    const deltaY = event.deltaY;
    const { x, y } = getMousePos(this.canvas, event);

    // Calculate the new scale
    let newScale = this.scale + (deltaY < 0 ? 0.1 : -0.1);

    // Define the scale boundaries
    const minScale = 0.15;
    const maxScale = 1;

    // Clamp the new scale to the defined boundaries
    newScale = Math.min(Math.max(newScale, minScale), maxScale);

    // Calculate scale factor
    const scaleFactor = newScale / this.scale;

    // Update translations to keep the zoom centered around the mouse pointer
    this.translateX = x - scaleFactor * (x - this.translateX);
    this.translateY = y - scaleFactor * (y - this.translateY);

    // Apply the new scale
    this.scale = newScale;

    // Redraw the chart with the new scale and origin
    this.drawChart();
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
