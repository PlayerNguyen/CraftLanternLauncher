import { useEffect } from "react";
import { MemoryRouter } from "react-router-dom";
import useGetConfig from "./hooks/useGetConfig";

export function App() {
  const [v] = useGetConfig("CheckForUpdate");
  useEffect(() => {
    console.log(v);
  }, [v]);
  return (
    <>
      {/* Declare all nested pack here */}
      <MemoryRouter>
        <div>Hello world</div>
      </MemoryRouter>
    </>
  );
}
