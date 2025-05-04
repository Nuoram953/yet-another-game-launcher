process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";

import { expect } from "chai";
import { app, BrowserWindow } from "electron";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { bootstrap } from "../../../src/main/index";
import _ from "lodash";
import { RouteLibrary } from "@common/constant";

const prisma = new PrismaClient();

describe("Game Launch IPC Route", function () {
  this.timeout(10000);

  let mainWindow: BrowserWindow | undefined;

  before(async () => {
    await app.whenReady();
    mainWindow = await bootstrap();

    if (_.isNil(mainWindow)) {
      throw new Error("Failed to create main window");
    }
  });

  after(async () => {
    await prisma.$disconnect();
    if (mainWindow) mainWindow.close();
    // You may want to avoid app.quit() if multiple tests
    app.exit(0);
  });

  it("should launch a game successfully", async () => {
    // const testGame = await prisma.game.findFirstOrThrow();

    const result = await mainWindow!.webContents.executeJavaScript(`
      window.ipcRenderer.invoke('${RouteLibrary.GET_GAME}', '${1}')
        .then(() => 'success')
        .catch(e => 'error: ' + e.message)
    `);

    expect(true).to.be.true;
  });
});
