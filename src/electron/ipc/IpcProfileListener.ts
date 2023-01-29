import { ProfileStorage } from "./../profile/Profile";
import { IpcMainInvokeEvent } from "electron";
import { IpcMainInvokeListener } from "./IpcMainListener";
import * as uuid from "uuid";
export class InvokeGetProfileListener extends IpcMainInvokeListener {
  name: string = "profile:get";
  type = "invoke";
  listen: (event: IpcMainInvokeEvent, ...args: any[]) => any = () => {
    return ProfileStorage.getProfileList();
  };
}

export class InvokeAddProfileListener extends IpcMainInvokeListener {
  name = "profile.add";
  type = "invoke";
  listen: (event: IpcMainInvokeEvent, ...args: any[]) => any = (
    _event,
    args
  ) => {
    const { name, version } = args[0];
    ProfileStorage.createProfile({
      id: uuid.v4(),
      profileName: name,
      versionId: version,
    });

    return ProfileStorage.getProfileList();
  };
}
