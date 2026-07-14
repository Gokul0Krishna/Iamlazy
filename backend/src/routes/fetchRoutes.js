import express from 'express';
import { fetchmails } from '../controllers/fetchControllers.js';

const router = express.Router();

router.post("/mail", fetchmails)

export default router;