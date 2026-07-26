import type { KinematicBody2D } from "./types";

const GRAVITY = 9.81;

export function applyVelocity(body: KinematicBody2D) {
  body.pos.x += body.vel.x;
  body.pos.y += body.vel.y;
}

export function applyGravity(body: KinematicBody2D): KinematicBody2D {
  body.vel.y += body.mass * GRAVITY * 0.01;
  return body;
}
