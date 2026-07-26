/**
 * Template for a new canvas game
 */
import p5 from "p5";
import { type CanvasGame } from "../utils/types";
import { getHostSize } from "../utils/Canvas";

const sketch = (p: p5) => {
  // setup the canvas -- runs before first frame
  p.setup = () => {
    const { width, height } = getHostSize(p);
    p.createCanvas(width, height);
    p.noStroke();
  };
  // render loop -- draw the stuff each frame
  p.draw = () => {
    // clear the background
    p.background(0);
  };
  // handle mouse pressed events
  p.mousePressed = () => {};
  p.windowResized = () => {
    const { width, height } = getHostSize(p);
    p.resizeCanvas(width, height);
  };
};
const game: CanvasGame = {
  id: "id",
  name: "Game Name Here",
  sketch,
};

export default game;
