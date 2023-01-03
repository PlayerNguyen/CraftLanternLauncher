import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";

import { Button } from "./Button/Button";

export function Dialog({ visible, message, title, closable, okayButton }) {
  const { close } = useDialog();

  return (
    visible && (
      <div className="dialog-wrapper fixed w-full h-full bg-neutral bg-opacity-60 shadow-base-300 shadow-md">
        <div className="dialog-container w-1/2 mx-auto my-[40vh] bg-base-100 border-2 border-neutral px-4 py-5 flex flex-col gap-3">
          {/* header */}
          <div className="dialog-header flex flex-row items-center">
            <div className="flex-1 font-base-sans-bold text-xl">
              <span>{title || "<Empty title>"}</span>
            </div>
            {closable && (
              <div>
                <Button className="btn btn-primary px-2 bg-primary-black">
                  x
                </Button>
              </div>
            )}
          </div>
          {/* Body */}
          <div>{message || "<Empty msg>"}</div>
          {/* Footer */}
          {okayButton && (
            <div className="flex flex-row-reverse">
              <button
                className="btn btn-primary btn-sm"
                onClick={
                  okayButton
                    ? okayButton.onClick
                    : () => {
                        console.log(`Register default OK`);
                        close();
                      }
                }
              >
                {okayButton ? okayButton.title : "OK"}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export const DialogContext = React.createContext();

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    visible: false,
    message: "Empty message",
    title: "Error",
    closable: false,
    okayButton: {
      onClick: (e) => {
        console.log(e);
      },
      title: "Okay",
    },
  });

  const unsetDialog = useCallback(() => {
    setDialog();
  }, [setDialog]);

  return (
    <DialogContext.Provider value={{ setDialog, unsetDialog }}>
      {children}
      <Dialog
        visible={dialog.visible}
        message={dialog.message}
        title={dialog.title}
        closable={dialog.closable}
        okayButton={dialog.okayButton}
      />
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = React.useContext(DialogContext);
  if (context === undefined) {
    throw new Error("useDialog must be used within a UserProvider");
  }

  const show = (options) => {
    console.log(options, { ...options });
    context.setDialog({
      visible: true,
      ...options,
    });
  };

  const close = () => {
    context.setDialog({
      visible: false,
    });
  };

  return { show, close };
}
