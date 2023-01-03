import { useEffect, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { LauncherLoading } from "./components/LauncherLoading";

import "./index.css";

import "./assets/fonts/PixeloidMono.ttf";
import "./assets/fonts/PixeloidSans.ttf";
import {
  Dialog,
  DialogComponent,
  DialogProvider,
  useDialog,
} from "./components/Dialog";
import { IconContext } from "react-icons";

export function App() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    launcher.handleInit((listener, ...args) => {
      setLoading(false);
    });
  }, []);
  return (
    <IconContext.Provider value={{ className: "icon" }}>
      <DialogProvider>
        {isLoading ? (
          <LauncherLoading />
        ) : (
          <MemoryRouter>
            <div className="">Hello world</div>
          </MemoryRouter>
        )}
      </DialogProvider>
      {/* <Dialog.Provider value={dialogValue}>
        <DialogComponent />
      </Dialog.Provider> */}
    </IconContext.Provider>
  );
}
