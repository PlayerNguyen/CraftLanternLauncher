import { useRef } from "react";

export default function useDevelopment() {
  const ref = useRef(environments.isDevelopment);

  return ref.current;
}
