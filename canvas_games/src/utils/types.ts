import p5 from "p5";
export type CanvasGame = {
  id: string;
  name: string;
  sketch: (p: p5) => void;
};
export type Point2D = {
  x: number;
  y: number;
};
