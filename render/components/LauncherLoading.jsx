import HangLantern from "./../assets/images/hagging_lantern.webp";
import { ProgressBar } from "./ProgressBar";

export function LauncherLoading() {
  return (
    <div className="launcherLoading-wrapper fixed w-full h-full bg-primary-dimmed-white flex justify-center items-center">
      <div className="w-full flex flex-row justify-center mx-16">
        <div className="w-1/3">
          <img src={HangLantern} className="animate-floating w-[128px]" />
        </div>
        <div className="flex flex-col gap-8 w-2/3">
          <div className="text-2xl font-bold animate-pulse">
            Lighting the Lantern Launcher. Thử luôn tiếng Việt cho nó máu
          </div>
          <div>
            <ProgressBar />
          </div>
        </div>
      </div>
    </div>
  );
}
