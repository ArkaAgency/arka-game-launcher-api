import express from "express";
const getDownloadFile = require("../controllers/download.controller");
const router = express.Router();

router.get("/:filename/:prefix", getDownloadFile);

export default router;
