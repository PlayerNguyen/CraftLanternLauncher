import { useEffect, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { LauncherLoading } from "./components/LauncherLoading";

import "./index.css";

import "./assets/fonts/PixeloidMono.ttf";
import "./assets/fonts/PixeloidSans.ttf";

export function App() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    launcher.handleInit((listener, ...args) => {
      setLoading(false);
    });
  }, []);
  return isLoading ? (
    <LauncherLoading />
  ) : (
    <MemoryRouter>
      <div className="bg-slate-900">Hello world</div>
    </MemoryRouter>
  );
}
