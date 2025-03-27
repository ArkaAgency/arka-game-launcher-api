import { Request, Response } from "express";
import getDirs from "../../utils/getDirs";
import getFiles from "../../utils/getFiles";
import prisma from "../../utils/prisma";
import path from "path";

async function getGameData(req: Request, res: Response) {
  const gameFilesPath = path.join(__dirname, "../../../public/game/");

  let folders = await getDirs(gameFilesPath);
  let files = await getFiles(gameFilesPath, folders, "game/");

  res.json({
    success: true,
    folders,
    files,
  });
}

async function getGameVersion(req: Request, res: Response) {
  const latestUpdate = await prisma.update.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  return res.json({
    success: true,
    version: latestUpdate?.versionString,
    update: latestUpdate,
  });
}

module.exports = { getGameData, getGameVersion };
