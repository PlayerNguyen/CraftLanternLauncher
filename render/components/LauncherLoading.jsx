import { useEffect, useState } from "react";
import HangLantern from "./../assets/images/hagging_lantern.webp";
import { useDialog } from "./Dialog";
import { ProgressBar } from "./ProgressBar";

export function LauncherLoading() {
  const [loadingMessage, setLoadingMessage] = useState("");
  const { show, close } = useDialog();

  useEffect(() => {
    launcher.handleBoot((_listener, args) => {
      const stage = args;

      switch (stage) {
        case "config": {
          setLoadingMessage("Loading configuration...");
          break;
        }
        case "version_manifest": {
          setLoadingMessage("Loading version manifest...");
          break;
        }
        case "profile": {
          setLoadingMessage("Loading profile...");
          break;
        }
      }
    });

    /**
     * Handle any error that appear
     */
    launcher.handleError((_l, args) => {
      console.log(args.message);
      show({
        message: args.stack,
        title: "Error",
        closable: false,
        okayButton: null,
      });
    });

    return () => {
      launcher.clearBootChannel();
      launcher.clearErrorChannels();
      close();
    };
  }, []);
  return (
    <div className="launcherLoading-wrapper fixed w-full h-full bg-base-100 text-base-content flex justify-center items-center">
      <div className="w-full flex flex-row justify-center mx-16">
        <div className="w-1/3">
          <img src={HangLantern} className="animate-floating w-[128px]" />
        </div>
        <div className="flex flex-col gap-8 w-2/3">
          <div className="text-2xl font-bold">
            Lighting the Lantern Launcher.
          </div>
          <div>{loadingMessage}</div>
          <div>
            <ProgressBar value={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
