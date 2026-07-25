import { useEffect, useRef } from "react";
import p5 from "p5";
import "./index.css";

export const GRAVITY = 9.8;
export const DRAG_FACTOR = 0.1;

type Point = {
  x: number;
  y: number;
};
type Orb = {
  id: string;
  pos: Point; // position
  vel: Point; // velocity
  radius: number;
  hue: number;
  mass: number;
};

/**
 * Check if a point is on or inside an orb
 * @param point
 * @param orb
 * @returns
 */
function pointInOrb(point: Point, orb: Orb): boolean {
  const dx = point.x - orb.pos.x;
  const dy = point.y - orb.pos.y;
  const distanceSquared = dx * dx + dy * dy;
  return distanceSquared <= orb.radius * orb.radius;
}

export function lineIntersectsOrb(p1: Point, p2: Point, orb: Orb): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const fx = p1.x - orb.pos.x;
  const fy = p1.y - orb.pos.y;

  const a = dx * dx + dy * dy;
  if (a === 0) {
    return pointInOrb(p1, orb);
  }

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - orb.radius * orb.radius;

  let discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return false; // no intersection
  }

  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

function randomSign(): number {
  return Math.random() < 0.5 ? -1 : 1;
}

function createOrb(p: p5, index: number, x = 0, y = 0): Orb {
  return {
    id: crypto.randomUUID(),
    pos: { x, y },
    vel: { x: 0, y: 0 },
    radius: p.random(10, 28),
    hue: index * 360,
    mass: 3,
  };
}

function App() {
  const sketchHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = sketchHostRef.current;
    if (!host) return;

    const sketch = (p: p5) => {
      // generate orbs
      let orbs: Orb[] = [];
      // const orbs = Array.from({ length: orbCount }, (_, index) =>
      //   createOrb(p, index, orbCount),
      // );

      // setup -- runs before first frame
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.colorMode(p.HSB, 360, 100, 100, 100);
        p.noStroke();

        orbs.forEach((orb) => {
          orb.pos.x = p.random(orb.radius, p.width - orb.radius);
          orb.pos.y = p.random(orb.radius, p.height - orb.radius);
        });
      };

      // render loop -- draw the stuff each frame
      p.draw = () => {
        // clear the background
        p.background(220, 30, 8);

        for (const orb of orbs) {
          const wasOnBottom = orb.pos.y >= p.height - orb.radius - 1;

          // update orb position using velocity
          orb.pos.x += orb.vel.x;
          orb.pos.y += orb.vel.y;

          const orbIntersectsBottom = lineIntersectsOrb(
            { x: 0, y: p.height },
            { x: p.width, y: p.height },
            orb,
          );
          const orbIntersectsLeft = lineIntersectsOrb(
            { x: 0, y: 0 },
            { x: 0, y: p.height },
            orb,
          );
          const orbIntersectsRight = lineIntersectsOrb(
            { x: p.width, y: 0 },
            { x: p.width, y: p.height },
            orb,
          );
          // update velocity if orb hits the bottom of the canvas
          if (orbIntersectsBottom) {
            orb.vel.y *= -0.5; // reverse y velocity
            if (!wasOnBottom && Math.abs(orb.vel.x) < 0.02) {
              orb.vel.x += randomSign() * p.random(0, 10); // randomize x velocity once on landing
            }
            orb.pos.y = p.height - orb.radius; // reset position to edge
          }
          // update velocity if orb hits the left or right of the canvas
          if (orbIntersectsLeft || orbIntersectsRight) {
            orb.vel.x *= -0.5; // reverse x velocity
            orb.pos.x = orbIntersectsLeft ? orb.radius : p.width - orb.radius; // reset position to edge
          }
          if (orbIntersectsBottom) {
            orb.vel.x *= 1 - DRAG_FACTOR; // slow x velocity naturally while on the ground
            if (Math.abs(orb.vel.x) < 0.02) orb.vel.x = 0;
          }
          orb.vel.y += orb.mass * GRAVITY * 0.01; // apply gravity to y velocity

          // draw orb
          p.fill(orb.hue, 80, 100, 85);
          p.circle(orb.pos.x, orb.pos.y, orb.radius * 2);
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.mousePressed = () => {
        const mouseOutsideCanvas =
          p.mouseX < 0 ||
          p.mouseX > p.width ||
          p.mouseY < 0 ||
          p.mouseY > p.height;
        const orbsClicked = orbs.filter((orb) =>
          pointInOrb({ x: p.mouseX, y: p.mouseY }, orb),
        );
        if (mouseOutsideCanvas) {
          return;
        } else if (orbsClicked.length > 0) {
          // remove the orb that was clicked
          orbs = orbs.filter((orb) => orbsClicked[0].id !== orb.id);
        } else {
          orbs.push(createOrb(p, orbs.length, p.mouseX, p.mouseY));
        }
      };
    };

    const instance = new p5(sketch, host);

    return () => {
      instance.remove();
    };
  }, []);

  return <div ref={sketchHostRef} className="sketch-host" />;
}

export default App;
