import express from "express";
import { extractEmailInfo } from "../controllers/processController.js";
const router = express.Router();

router.get("/emailprocess", extractEmailInfo);

export default router;