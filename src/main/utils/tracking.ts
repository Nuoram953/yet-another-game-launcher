const { spawn } = require('child_process');
const { exec } = require('child_process');
import psList from "ps-list"

export async function spawnAndTrackChildren() {
  const processes = await psList()

  for(const process of processes){
    if(process.cmd?.includes("steamapps")){
      console.log(process)
    }
  }

}
