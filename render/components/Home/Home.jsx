import "./Home.css";
import { HiPlay } from "react-icons/hi2";
import { ProgressBar } from "../ProgressBar";
import { InputSelection } from "../InputSelection/InputSelection";

function PlayButton() {
  return (
    <button
      className="btn btn-primary btn-lg flex flex-row gap-3 items-center shadow-md"
      disabled
    >
      <span>
        <HiPlay />
      </span>
      <span>Play</span>
    </button>
  );
}

export function Home() {
  return (
    <div className="home-wrapper">
      <div className="home-header bg-base-200 w-full h-[180px] px-4"></div>
      <div className="bg-base-100 px-6 py-2 flex flex-col gap-2">
        <div className="flex flex-row gap-3">
          <div className="flex-1">
            <input
              className="input input-primary input-lg w-full"
              placeholder="Enter"
            />
          </div>
          <div className="flex-1">
            <InputSelection />
          </div>
          <div>
            <PlayButton />
          </div>
        </div>
        <div>
          <ProgressBar value={50} />
        </div>
      </div>
    </div>
  );
}
