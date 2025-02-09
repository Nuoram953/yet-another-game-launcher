import psList from "ps-list";
import path from "path";
import { delay, normalizePath } from "./utils";
import log from "electron-log/main";
import treeKill from "tree-kill";

interface ProcessInfo {
  startTime: Date;
  endTime: Date | null;
}

export async function killDirectoyProcess(directoryPath: string) {
  try {
    const processes = await psList();
    const resolvedPath = normalizePath(path.resolve(directoryPath));

    const directoryProcesses = processes.filter((proc) => {
      try {
        return (
          (proc.cmd && normalizePath(proc.cmd).includes(resolvedPath)) ||
          (proc.name && /game|unity|unreal|renderer|display/i.test(proc.name))
        );
      } catch (error) {
        return false;
      }
    });

    if (directoryProcesses.length === 0) {
      log.info("No processes found to kill");
      return { success: true, message: "No processes found" };
    }

    const killPromises = directoryProcesses.map(
      (proc) =>
        new Promise<void>((resolve) => {
          try {
            treeKill(proc.pid, "SIGTERM", (err) => {
              if (err) {
                log.warn(
                  `tree-kill failed for ${proc.pid}, attempting force kill`,
                );
                try {
                  process.kill(proc.pid, "SIGKILL");
                  log.info(`Force killed process ${proc.pid}`);
                } catch (killError) {
                  log.error(
                    `Failed to force kill process ${proc.pid}:`,
                    killError,
                  );
                }
              } else {
                log.info(`Successfully killed process tree for ${proc.pid}`);
              }
              resolve();
            });
          } catch (error) {
            log.error(`Error killing process ${proc.pid}:`, error);
            resolve();
          }
        }),
    );

    await Promise.all(killPromises);

    const remainingProcesses = (await psList()).filter((proc) => {
      try {
        return proc.cmd && normalizePath(proc.cmd).includes(resolvedPath);
      } catch (error) {
        return false;
      }
    });

    if (remainingProcesses.length > 0) {
      log.warn(`${remainingProcesses.length} processes still remaining`);
      for (const proc of remainingProcesses) {
        try {
          process.kill(proc.pid, "SIGKILL");
          log.info(`Force killed remaining process ${proc.pid}`);
        } catch (error) {
          log.error(
            `Failed to force kill remaining process ${proc.pid}:`,
            error,
          );
        }
      }
    }

    return {
      success: true,
      message: `Killed ${directoryProcesses.length} processes`,
    };
  } catch (error) {
    log.error("Error killing processes:", error);
    return {
      success: false,
      message: `Failed to kill processes: ${error.message}`,
    };
  }
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
      log.debug(`Found ${directoryProcesses.length}. Continue tracking`);
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
