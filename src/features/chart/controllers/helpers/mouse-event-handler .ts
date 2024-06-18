import { ChartController } from "../chart-controller";

function getMousePos(canvas: HTMLCanvasElement, event: WheelEvent) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

export class MouseEventHandler {
  private controller: ChartController;
  onMouseMoveHandler: (event: MouseEvent) => void;
  onMouseUpHandler: (event: MouseEvent) => void;

  constructor(controller: ChartController) {
    this.controller = controller;
    this.onMouseMoveHandler = this._onMouseMove.bind(this);
    this.onMouseUpHandler = this._onMouseUp.bind(this);
  }

  initializeEventListeners() {
    this.controller.canvas.addEventListener(
      "mousedown",
      this._grabbingItems.bind(this)
    );

    window.addEventListener("wheel", this._handleWheel.bind(this));
  }

  _grabbingItems(event: MouseEvent) {
    if (!this.controller.canvas) {
      console.error("Canvas is not initialized");
      return;
    }

    const rect = this.controller.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.controller.isDragging = true;
    this.controller.dragStartX = mouseX;
    this.controller.dragStartY = mouseY;

    this.controller.canvas.addEventListener(
      "mousemove",
      this.onMouseMoveHandler
    );
    this.controller.canvas.addEventListener("mouseup", this.onMouseUpHandler);
  }

  _onMouseMove(event: MouseEvent) {
    if (!this.controller.isDragging) return;

    const rect = this.controller.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const dx = mouseX - this.controller.dragStartX;
    const dy = mouseY - this.controller.dragStartY;

    this.controller.translateX += dx;
    this.controller.translateY += dy;

    this.controller.dragStartX = mouseX;
    this.controller.dragStartY = mouseY;

    this.controller.drawChart();
  }

  _onMouseUp() {
    this.controller.isDragging = false;
    this.controller.canvas.removeEventListener(
      "mousemove",
      this.onMouseMoveHandler
    );
    this.controller.canvas.removeEventListener(
      "mouseup",
      this.onMouseUpHandler
    );
  }

  _handleWheel(event: WheelEvent) {
    const deltaY = event.deltaY;
    const { x, y } = getMousePos(this.controller.canvas, event);

    // Calculate the new scale
    let newScale = this.controller.scale + (deltaY < 0 ? 0.1 : -0.1);

    // Clamp the new scale to the defined boundaries
    newScale = Math.min(
      Math.max(newScale, this.controller.minScale),
      this.controller.maxScale
    );

    // Calculate scale factor
    const scaleFactor = newScale / this.controller.scale;

    // Update translations to keep the zoom centered around the mouse pointer
    this.controller.translateX =
      x - scaleFactor * (x - this.controller.translateX);
    this.controller.translateY =
      y - scaleFactor * (y - this.controller.translateY);

    // Apply the new scale
    this.controller.scale = newScale;

    // Redraw the chart with the new scale and origin
    this.controller.drawChart();
  }
}
