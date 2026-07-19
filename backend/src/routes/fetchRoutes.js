import express from "express";
import { checkInbox } from "../controllers/fetchControllers.js";

const router = express.Router();

router.get("/check", checkInbox);

export default router;