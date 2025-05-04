import psList from "ps-list";
import path from "path";
import { delay, normalizePath } from "./utils";
import log from "electron-log/main";
import treeKill from "tree-kill";
import logger, { LogTag } from "@main/logger";

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
      logger.debug("No processes found to kill", {}, LogTag.TRACKING);
      return { success: true, message: "No processes found" };
    }

    const killPromises = directoryProcesses.map(
      (proc) =>
        new Promise<void>((resolve) => {
          try {
            treeKill(proc.pid, "SIGTERM", (err) => {
              if (err) {
                log.warn(`tree-kill failed for ${proc.pid}, attempting force kill`);
                try {
                  process.kill(proc.pid, "SIGKILL");
                  logger.debug(
                    "Force killed process",
                    {
                      id: proc.pid,
                    },
                    LogTag.TRACKING,
                  );
                } catch (killError) {
                  logger.error(
                    `Failed to force kill process ${proc.pid}:`,
                    {
                      id: proc.pid,
                      error: killError,
                    },
                    LogTag.TRACKING,
                  );
                }
              } else {
                logger.debug("successfully killed process tree", { id: proc.pid }, LogTag.TRACKING);
              }
              resolve();
            });
          } catch (error) {
            logger.error(
              `Error killing process:`,
              {
                id: proc.pid,
                error,
              },
              LogTag.TRACKING,
            );
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
          log.debug(`Force killed remaining process`, { id: proc.pid }, LogTag.TRACKING);
        } catch (error) {
          logger.error(
            `Failed to force kill remaining process:`,
            {
              id: proc.pid,
              error,
            },
            LogTag.TRACKING,
          );
        }
      }
    }

    return {
      success: true,
      message: `Killed ${directoryProcesses.length} processes`,
    };
  } catch (error) {
    logger.error("Error killing processes:", { error }, LogTag.TRACKING);
    return {
      success: false,
      message: `Failed to kill processes: ${error}`,
    };
  }
}

export async function monitorDirectoryProcesses(directoryPath: string): Promise<ProcessInfo> {
  await delay(60000 * 5);
  const startTime = new Date();
  logger.debug(`Monitoring started at: ${startTime}`, {}, LogTag.TRACKING);

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
      return true;
    }

    logger.debug(`\nNo processes found`, { date: new Date() }, LogTag.TRACKING);
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
  logger.debug(
    `Monitoring ended at: ${endTime}`,
    { date: endTime, total: endTime.getTime() - startTime.getTime() },
    LogTag.TRACKING,
  );

  return {
    startTime,
    endTime,
  };
}
