import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LauncherLoading } from "./components/LauncherLoading";

import "./index.css";

// import "./assets/fonts/PixeloidMono.ttf";
// import "./assets/fonts/PixeloidSans.ttf";
import { DialogProvider } from "./components/Dialog";
import { IconContext } from "react-icons";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Home } from "./components/Home/Home";
import { RouteWrapper } from "./components/RouteWrapper";
import { DevTools } from "./components/DevTools/DevTools";

export function App() {
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    launcher.handleInit((listener, ...args) => {
      setLoading(false);
    });
    return () => {
      launcher.clearInitChannels();
    };
  }, []);
  return (
    <IconContext.Provider value={{ className: "icon" }}>
      <DialogProvider>
        {isLoading ? (
          <LauncherLoading />
        ) : (
          <MemoryRouter>
            <div className="fixed h-full w-full top-0 left-0 flex flex-row">
              {/* Sidebar */}
              <Sidebar />

              {/* Route switcher */}
              <RouteWrapper>
                <Routes>
                  <Route path="/" element={<Home />}></Route>
                  <Route path="/dev-tools" element={<DevTools />}></Route>
                </Routes>
              </RouteWrapper>
            </div>
          </MemoryRouter>
        )}
      </DialogProvider>
    </IconContext.Provider>
  );
}
