import p5 from "p5";
import type { ComponentType, Dispatch, SetStateAction } from "react";

export type GameParamValue = string | number | boolean;

export type GameParams = Record<string, GameParamValue>;

export type GameControlsProps = {
  params: GameParams;
  setParams: Dispatch<SetStateAction<GameParams>>;
};

export type CanvasGame = {
  id: string;
  name: string;
  sketch: (p: p5, getParams: () => GameParams) => void;
  createDefaultParams?: () => GameParams;
  Controls?: ComponentType<GameControlsProps>;
};

export type Point2D = {
  x: number;
  y: number;
};

export type KinematicBody2D = {
  pos: Point2D;
  vel: Point2D;
  mass: number;
};
