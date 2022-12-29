import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";

export function App() {
  return (
    <>
      {/* Declare all nested pack here */}
      <MemoryRouter>
        <div>Hello world</div>
      </MemoryRouter>
    </>
  );
}
