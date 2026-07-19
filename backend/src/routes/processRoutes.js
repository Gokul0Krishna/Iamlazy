import express from "express";
import {
  processManualEmail,
  getAllEntries,
  getEntryById,
  toggleStatus,
  deleteEntry,
} from "../controllers/processControllers.js";

const router = express.Router();

router.post("/", processManualEmail); // manually process raw text
router.get("/", getAllEntries); // list all saved notes
router.get("/:id", getEntryById); // get one note
router.patch("/:id/status", toggleStatus); // toggle status boolean
router.delete("/:id", deleteEntry); // delete a note

export default router;