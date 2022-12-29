import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import "./index.css";

export function App() {
  return (
    <>
      {/* Declare all nested pack here */}
      <MemoryRouter>
        <div className="bg-slate-900">Hello world</div>
      </MemoryRouter>
    </>
  );
}
