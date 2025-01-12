const { spawn } = require('child_process');
const { exec } = require('child_process');
const pidtree = require('pidtree');

export async function spawnAndTrackChildren(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { detached: true, stdio: 'ignore', ...options });
    process.unref();

    console.log(`Parent process started with PID: ${process.pid}`);

    // Wait for a short period to allow child processes to start
    setTimeout(() => {
      exec(`ps --ppid ${process.pid} -o pid=`, (err, stdout, stderr) => {
        if (err) {
          return reject(`Error finding child processes: ${stderr}`);
        }

        const childPids = stdout
          .split('\n')
          .filter(Boolean)
          .map(pid => parseInt(pid.trim(), 10));

        resolve({
          parentPid: process.pid,
          childPids,
        });
      });
    }, 10000); // Delay in milliseconds (adjust as needed)
  });
}


// To track and monitor processes
const trackedProcesses = new Set(); // A set to store all tracked PIDs

// Function to recursively track all child processes of a parent PID
export async function trackAllChildProcessesRecursive(pid) {
  console.log(`Tracking child processes for PID: ${pid}`);
  
  try {
    // Get all descendant processes
    const childPids = await pidtree(pid);
    console.log(`Descendant processes of PID ${pid}:`, childPids);
    
    // Add the PID and all child PIDs to the tracked list
    trackedProcesses.add(pid);
    childPids.forEach((childPid) => {
      trackedProcesses.add(childPid);
      trackAllChildProcessesRecursive(childPid); // Recurse for each child process
    });
  } catch (err) {
    console.error(`Error while tracking processes for PID ${pid}: ${err.message}`);
  }
}

// Function to check if a process is still running
function isProcessRunning(pid, callback) {
  exec(`ps -p ${pid} -o pid=`, (err, stdout) => {
    if (err || !stdout.trim()) {
      // If the process doesn't exist, it's not running
      callback(false);
    } else {
      // If the PID exists, the process is running
      callback(true);
    }
  });
}

// Function to check if all processes are terminated
export function checkIfAllProcessesTerminated() {
  let allTerminated = true;

  trackedProcesses.forEach((pid) => {
    isProcessRunning(pid, (isRunning) => {
      if (isRunning) {
        allTerminated = false;
        console.log(`Process ${pid} is still running.`);
      }
    });
  });

  if (allTerminated) {
    console.log("All processes have terminated.");
  } else {
    console.log("Some processes are still running.");
  }
}
