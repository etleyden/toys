/**
 * Template for a new canvas game
 */
import p5 from "p5";
import {
  Button,
  Label,
  ListBox,
  Select,
  Slider,
  type Key,
} from "@heroui/react";
import {
  type CanvasGame,
  type GameControlsProps,
  type GameParams,
} from "../utils/types";
import { getHostSize } from "../utils/Canvas";

type SortAlgs = "bubble" | "selection" | "insertion" | "merge" | "quick";

type SortStep = {
  array: number[];
  activeIndex: number | null;
};

const DEFAULT_PARAMS: GameParams = {
  count: 50,
  algorithm: "bubble" as SortAlgs,
  speed: 12,
  start: false,
};

function SortSimControls({ params, setParams }: GameControlsProps) {
  const count = Number(params.count ?? DEFAULT_PARAMS.count);
  const speed = Number(params.speed ?? DEFAULT_PARAMS.speed);
  const isRunning = Boolean(params.start);

  const handleAlgorithmChange = (value: Key | Key[] | null) => {
    if (typeof value !== "string") return;

    setParams((prev) => ({
      ...prev,
      algorithm: value as SortAlgs,
      start: false,
    }));
  };

  return (
    <div className="game-controls">
      <div className="game-controls-item">
        <Slider
          minValue={0}
          maxValue={100}
          step={1}
          value={count}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              count: Array.isArray(value) ? value[0] : value,
              start: false,
            }))
          }
        >
          <Label>Count</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </div>
      <div className="game-controls-item">
        <Select
          onChange={handleAlgorithmChange}
          selectedKey={String(params.algorithm ?? DEFAULT_PARAMS.algorithm)}
        >
          <Label>Algorithm</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              <ListBox.Item id="bubble" textValue="Bubble">
                Bubble
              </ListBox.Item>
              <ListBox.Item id="selection" textValue="Selection">
                Selection
              </ListBox.Item>
              <ListBox.Item id="insertion" textValue="Insertion">
                Insertion
              </ListBox.Item>
              <ListBox.Item id="merge" textValue="Merge">
                Merge
              </ListBox.Item>
              <ListBox.Item id="quick" textValue="Quick">
                Quick
              </ListBox.Item>
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
      <div className="game-controls-item">
        <Slider
          minValue={1}
          maxValue={60}
          step={1}
          value={speed}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              speed: Array.isArray(value) ? value[0] : value,
            }))
          }
        >
          <Label>Speed</Label>
          <Slider.Output />
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider>
      </div>
      <div className="game-controls-item">
        <Button
          onClick={() => {
            setParams((prev) => ({
              ...prev,
              start: !Boolean(prev.start),
            }));
          }}
        >
          {isRunning ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}

const generateRandomArray = (count: number): number[] => {
  const size = Math.max(0, Math.floor(count));
  const arr = Array.from({ length: size }, (_, index) => index + 1);

  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }

  return arr;
};

const cloneStep = (arr: number[], activeIndex: number | null): SortStep => ({
  array: [...arr],
  activeIndex,
});

const buildBubbleSteps = (input: number[]): SortStep[] => {
  const arr = [...input];
  const steps: SortStep[] = [cloneStep(arr, null)];

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
      steps.push(cloneStep(arr, j));
    }
  }

  steps.push(cloneStep(arr, null));
  return steps;
};

const buildSelectionSteps = (input: number[]): SortStep[] => {
  const arr = [...input];
  const steps: SortStep[] = [cloneStep(arr, null)];

  for (let i = 0; i < arr.length; i++) {
    let minIndex = i;

    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
      steps.push(cloneStep(arr, j));
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
    }
    steps.push(cloneStep(arr, i));
  }

  steps.push(cloneStep(arr, null));
  return steps;
};

const buildInsertionSteps = (input: number[]): SortStep[] => {
  const arr = [...input];
  const steps: SortStep[] = [cloneStep(arr, null)];

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push(cloneStep(arr, j));
      j--;
    }

    arr[j + 1] = key;
    steps.push(cloneStep(arr, j + 1));
  }

  steps.push(cloneStep(arr, null));
  return steps;
};

const buildMergeSteps = (input: number[]): SortStep[] => {
  const arr = [...input];
  const steps: SortStep[] = [cloneStep(arr, null)];

  const merge = (left: number, mid: number, right: number) => {
    const leftPart = arr.slice(left, mid + 1);
    const rightPart = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftPart.length && j < rightPart.length) {
      if (leftPart[i] <= rightPart[j]) {
        arr[k] = leftPart[i];
        i++;
      } else {
        arr[k] = rightPart[j];
        j++;
      }
      steps.push(cloneStep(arr, k));
      k++;
    }

    while (i < leftPart.length) {
      arr[k] = leftPart[i];
      steps.push(cloneStep(arr, k));
      i++;
      k++;
    }

    while (j < rightPart.length) {
      arr[k] = rightPart[j];
      steps.push(cloneStep(arr, k));
      j++;
      k++;
    }
  };

  const sort = (left: number, right: number) => {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  };

  sort(0, arr.length - 1);
  steps.push(cloneStep(arr, null));
  return steps;
};

const buildQuickSteps = (input: number[]): SortStep[] => {
  const arr = [...input];
  const steps: SortStep[] = [cloneStep(arr, null)];

  const partition = (low: number, high: number) => {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push(cloneStep(arr, j));
      } else {
        steps.push(cloneStep(arr, j));
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push(cloneStep(arr, i + 1));
    return i + 1;
  };

  const sort = (low: number, high: number) => {
    if (low >= high) return;
    const pivotIndex = partition(low, high);
    sort(low, pivotIndex - 1);
    sort(pivotIndex + 1, high);
  };

  sort(0, arr.length - 1);
  steps.push(cloneStep(arr, null));
  return steps;
};

const buildSortSteps = (arr: number[], algorithm: SortAlgs): SortStep[] => {
  switch (algorithm) {
    case "bubble":
      return buildBubbleSteps(arr);
    case "selection":
      return buildSelectionSteps(arr);
    case "insertion":
      return buildInsertionSteps(arr);
    case "merge":
      return buildMergeSteps(arr);
    case "quick":
      return buildQuickSteps(arr);
    default:
      return [cloneStep(arr, null)];
  }
};

const sketch = (p: p5, getParams: () => GameParams) => {
  let arr: number[] = [];
  let steps: SortStep[] = [];
  let currentStep = 0;
  let activeIndex: number | null = null;
  let isAnimating = false;
  let previousCount = Number(DEFAULT_PARAMS.count);
  let previousAlgorithm = String(DEFAULT_PARAMS.algorithm);
  let previousStart = Boolean(DEFAULT_PARAMS.start);
  let lastUpdated = 0;
  let audioContext: AudioContext | null = null;
  let oscillator: OscillatorNode | null = null;
  let gainNode: GainNode | null = null;

  const ensureAudio = () => {
    if (!audioContext) {
      audioContext = new AudioContext();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 220;
      gainNode.gain.value = 0;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
    }

    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
  };

  const muteAudio = () => {
    if (!audioContext || !gainNode) {
      return;
    }

    gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.01);
  };

  const playValueFrequency = (value: number, maxValue: number) => {
    if (!audioContext || !oscillator || !gainNode) {
      return;
    }

    const minFrequency = 140;
    const maxFrequency = 1200;
    const normalized = maxValue <= 1 ? 0 : (value - 1) / (maxValue - 1);
    const frequency = minFrequency + normalized * (maxFrequency - minFrequency);

    oscillator.frequency.setTargetAtTime(
      frequency,
      audioContext.currentTime,
      0.01,
    );
    gainNode.gain.setTargetAtTime(0.06, audioContext.currentTime, 0.005);
  };

  const stopAnimation = () => {
    isAnimating = false;
    steps = [];
    currentStep = 0;
    activeIndex = null;
    muteAudio();
  };

  const startAnimation = (algorithm: SortAlgs) => {
    steps = buildSortSteps(arr, algorithm);
    currentStep = 0;
    isAnimating = true;
    lastUpdated = p.millis();
  };

  // setup the canvas -- runs before first frame
  p.setup = () => {
    const { width, height } = getHostSize(p);
    p.createCanvas(width, height);
    p.noStroke();
    p.colorMode(p.HSB, 360, 100, 100, 100);
    const {
      count = DEFAULT_PARAMS.count,
      algorithm = DEFAULT_PARAMS.algorithm,
      start = DEFAULT_PARAMS.start,
    } = getParams();

    previousCount = Number(count);
    previousAlgorithm = String(algorithm);
    previousStart = Boolean(start);
    arr = generateRandomArray(previousCount);
  };
  // render loop -- draw the stuff each frame
  p.draw = () => {
    const {
      count = DEFAULT_PARAMS.count,
      algorithm = DEFAULT_PARAMS.algorithm,
      speed = DEFAULT_PARAMS.speed,
      start = DEFAULT_PARAMS.start,
    } = getParams();

    const currentCount = Number(count);
    const currentAlgorithm = String(algorithm) as SortAlgs;
    const currentStart = Boolean(start);
    const stepsPerSecond = Math.max(1, Number(speed));

    if (currentCount !== previousCount) {
      previousCount = currentCount;
      arr = generateRandomArray(currentCount);
      stopAnimation();
    }

    if (currentAlgorithm !== previousAlgorithm) {
      previousAlgorithm = currentAlgorithm;
      arr = generateRandomArray(currentCount);
      stopAnimation();
    }

    if (!currentStart && previousStart) {
      stopAnimation();
    }

    if (currentStart && !previousStart) {
      ensureAudio();
      startAnimation(currentAlgorithm);
    }

    previousStart = currentStart;

    if (isAnimating && p.millis() - lastUpdated >= 1000 / stepsPerSecond) {
      lastUpdated = p.millis();

      if (currentStep >= steps.length) {
        stopAnimation();
      } else {
        arr = steps[currentStep].array;
        activeIndex = steps[currentStep].activeIndex;
        currentStep += 1;
      }
    }

    // clear the background
    p.background(220, 30, 8);

    if (arr.length === 0) {
      muteAudio();
      return;
    }

    if (isAnimating && activeIndex !== null) {
      playValueFrequency(arr[activeIndex], arr.length);
    } else {
      muteAudio();
    }

    for (let i = 0; i < arr.length; i++) {
      const barWidth = p.width / arr.length;
      const barHeight = (arr[i] / arr.length) * p.height;
      if (i === activeIndex) {
        p.fill(0, 0, 100);
      } else {
        const hue = (arr[i] / arr.length) * 360;
        p.fill(hue, 100, 100);
      }
      p.rect(i * barWidth, p.height - barHeight, barWidth, barHeight);
    }
  };
  // handle mouse pressed events
  p.mousePressed = () => {};
  p.windowResized = () => {
    const { width, height } = getHostSize(p);
    p.resizeCanvas(width, height);
  };
};

const sortSim: CanvasGame = {
  id: "sort",
  name: "Sort Simulator",
  sketch,
  createDefaultParams: () => ({ ...DEFAULT_PARAMS }),
  Controls: SortSimControls,
};

export default sortSim;
