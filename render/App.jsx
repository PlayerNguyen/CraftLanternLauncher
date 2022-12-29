import React, { useEffect } from "react";

export function App() {
  useEffect(() => {
    console.log(versions.chrome());
  }, []);
  return <div>Hi</div>;
}
