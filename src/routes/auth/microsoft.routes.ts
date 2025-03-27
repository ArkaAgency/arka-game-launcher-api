import express, { NextFunction, Request, Response } from "express";
import {
  getMicrosoftAuthLink,
  hostRedirect,
  processMicrosoftAuth,
} from "../../controllers/auth/microsoft.controller";
const router = express.Router();

router.get("/auth-link", getMicrosoftAuthLink);
router.get(
  "/process-auth/:code",
  (req: Request, res: Response, next: NextFunction) => {
    processMicrosoftAuth(req, res).catch(next);
  }
);
router.get("/redirect", hostRedirect);

export default router;
