import { useEffect, useRef, useState } from "react";
import p5 from "p5";
import orbs from "./games/Orbs";
import "./index.css";
import { Label, ListBox, Select, type Key } from "@heroui/react";
import type { CanvasGame } from "./utils/types";

const games = [orbs];

function App() {
  const sketchHostRef = useRef<HTMLDivElement>(null);
  const [selectedGame, setSelectedGame] = useState<CanvasGame | null>(null);

  useEffect(() => {
    const host = sketchHostRef.current;
    if (!host) return;

    const instance = new p5(selectedGame?.sketch, host);

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
      </section>
      <section className="canvas-panel">
        {selectedGame && <div ref={sketchHostRef} className="sketch-host" />}
      </section>
    </main>
  );
}

export default App;
