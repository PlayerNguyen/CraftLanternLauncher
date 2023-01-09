import { useRef, useState } from "react";
import { useOnClickOutside } from "../../hooks/useClickOutside";

export function InputSelection({ placeholder }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useOnClickOutside(ref, () => {
    setVisible(false);
  });

  const handleClick = () => {
    setVisible(true);
  };

  return (
    <div
      className="inputSelection-wrapper border-2 border-primary cursor-pointer relative py-3 selection:bg-transparent"
      onClick={handleClick}
      ref={ref}
    >
      <span className="mx-4">Latest</span>
      {visible && (
        <div
          className={`
        absolute bg-base-100 w-full px-2 py-1 z-50 top-0 mt-12 border-2 border-primary flex flex-col

        `}
        >
          {["a", "b", "c", "d"].map((item, idx) => {
            return (
              <div
                key={idx}
                className="hover:bg-base-300 px-2 py-1 ease-in-out transition-colors"
              >
                item {item} with {idx}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
