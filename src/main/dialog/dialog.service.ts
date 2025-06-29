import { dialog } from "electron";

export const open = async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "All Files", extensions: ["*"] }],
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
};
