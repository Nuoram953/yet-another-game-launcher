import psList from "ps-list";
import path from "path";
import { delay, normalizePath } from "./utils";

interface ProcessInfo {
  startTime: Date;
  endTime: Date | null;
}

export async function monitorDirectoryProcesses(
  directoryPath: string,
): Promise<ProcessInfo> {
  await delay(60000);
  const startTime = new Date();
  console.log(`Monitoring started at: ${startTime}`);

  const checkProcesses = async (): Promise<boolean> => {
    const processes = await psList();
    const resolvedPath = normalizePath(path.resolve(directoryPath));

    const directoryProcesses = processes.filter((proc) => {
      try {
        return proc.cmd && normalizePath(proc.cmd).includes(resolvedPath);
      } catch (error) {
        return false;
      }
    });

    if (directoryProcesses.length > 0) {
      console.log(
        `\nFound ${directoryProcesses.length} processes at ${new Date()}:`,
      );
      directoryProcesses.forEach((proc) => {
        console.log(`PID: ${proc.pid}, Name: ${proc.name}`);
      });
      return true;
    }

    console.log(`\nNo processes found at ${new Date()}`);
    return false;
  };

  while (true) {
    const hasProcesses = await checkProcesses();
    if (!hasProcesses) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const endTime = new Date();
  console.log(`\nMonitoring ended at: ${endTime}`);
  console.log(
    `Total monitoring time: ${endTime.getTime() - startTime.getTime()}ms`,
  );

  return {
    startTime,
    endTime,
  };
}
