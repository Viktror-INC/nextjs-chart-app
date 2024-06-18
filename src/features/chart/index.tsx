import { useEffect, useRef } from "react";
import { ChartController } from "./controllers/chart-controller";
import { ChartData } from "src/app/page";

type ChartProps = {
  data: ChartData;
};
const Chart = (props: ChartProps) => {
  const { data } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const chartController = new ChartController(canvas, data[0]);

    const resizeCanvas = () => {
      canvas.width = document.body.clientWidth; //document.width is obsolete
      canvas.height = window.innerHeight; //document.height is obsolete
      chartController.drawChart(); // Redraw the chart after resizing
    };

    resizeCanvas();
    return () => {
      chartController.clearChart();
    };
  }, [data]);

  return (
    <div style={{ overflow: "hidden" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Chart;
