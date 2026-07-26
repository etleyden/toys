import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import orbs from "./games/Orbs";
import sortSim from "./games/SortSimulator";
import "./index.css";
import {
  Button,
  Label,
  ListBox,
  Popover,
  Select,
  type Key,
} from "@heroui/react";
import type { CanvasGame, GameParams } from "./utils/types";

const games = [orbs, sortSim];

function App() {
  const sketchHostRef = useRef<HTMLDivElement>(null);
  const gameParamsRef = useRef<GameParams>({});
  const [selectedGame, setSelectedGame] = useState<CanvasGame | null>(null);
  const [gameParams, setGameParams] = useState<GameParams>({});

  useEffect(() => {
    gameParamsRef.current = gameParams;
  }, [gameParams]);

  useEffect(() => {
    if (!selectedGame) {
      setGameParams({});
      return;
    }

    setGameParams(selectedGame.createDefaultParams?.() ?? {});
  }, [selectedGame]);

  useEffect(() => {
    const host = sketchHostRef.current;
    if (!host || !selectedGame) return;

    const instance = new p5(
      (p) => selectedGame.sketch(p, () => gameParamsRef.current),
      host,
    );

    return () => {
      instance.remove();
    };
  }, [selectedGame]);

  const handleGameChanged = (value: Key | Key[] | null) => {
    setSelectedGame(games.find((game) => game.id === value) || null);
  };

  return (
    <main className="app-shell">
      <section className="controls-row">
        <div className="controls-row-game-select">
          <Select onChange={handleGameChanged}>
            <Label>Game</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {games.map((game) => (
                  <ListBox.Item id={game.id} textValue={game.name} key={game.id}>
                    {game.name}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
        {selectedGame?.Controls && (
          <Popover>
            <Button variant="secondary">Game Controls</Button>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Dialog>
                <Popover.Heading />
                <selectedGame.Controls
                  params={gameParams}
                  setParams={setGameParams}
                />
              </Popover.Dialog>
            </Popover.Content>
          </Popover>
        )}
      </section>
      <section className="canvas-panel">
        {selectedGame && (
          <>
            <div ref={sketchHostRef} className="sketch-host" />
          </>
        )}
      </section>
    </main>
  );
}

export default App;
