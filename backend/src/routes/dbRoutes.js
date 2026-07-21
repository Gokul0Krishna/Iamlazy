import express from "express";
import {
  getAllNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
} from "../controllers/dbControllers.js";

const router = express.Router();

router.get("/", getAllNodes);
router.get("/:id", getNodeById);
router.post("/", createNode);
router.put("/:id", updateNode);
router.delete("/:id", deleteNode);

export default router;