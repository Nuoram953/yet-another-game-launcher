import { spawn } from "child_process";

export const run = (id: number) => {
  spawn(
    "gamescope",
    [`-e -W 3840 -H 1600 -r 144 --force-grab-cursor -- steam steam://runappid/${id}`],
    {
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        VKD3D_DISABLE_EXTENSIONS: "VK_KHR_present_wait",
      },
    },
  );
};

export const install = (id: number) => {
  spawn("steam", ["-silent", `steam://install/${id}`], {
    detached: true,
    stdio: "ignore",
  });
};

export const uninstall = (id: number) => {
  spawn("steam", ["-silent", `steam://uninstall/${id}`], {
    detached: true,
    stdio: "ignore",
  });
};
