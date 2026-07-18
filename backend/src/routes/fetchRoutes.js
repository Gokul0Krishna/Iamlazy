import express from "express";
import { checkInbox } from "../controllers/fetchControllers.js";

const router = express.Router();

// GET /api/fetch/check -> manually trigger IMAP inbox check + processing
router.get("/check", checkInbox);

export default router;