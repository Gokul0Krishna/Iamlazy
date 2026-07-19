import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cron from "node-cron";

import connectDB from "./config/db.js";
import fetchRoutes from "./routes/fetchRoutes.js";
import processRoutes from "./routes/processRoutes.js";
import { fetchNewEmails } from "./services/getemailService.js";
import { processAndSaveEmail } from "./controllers/processControllers.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/fetch", fetchRoutes);
app.use("/api/process", processRoutes);

app.get("/", (req, res) => {
  res.send("Notes App API is running");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Automatically poll the inbox on a schedule (default: every 5 minutes)
  const cronSchedule = process.env.INBOX_CHECK_CRON || "*/60 * * * *";
  cron.schedule(cronSchedule, async () => {
    console.log("Running scheduled inbox check...");
    try {
      const emails = await fetchNewEmails();
      for (const email of emails) {
        await processAndSaveEmail(email.body);
      }
      if (emails.length) {
        console.log(`Processed ${emails.length} new email(s).`);
      }
    } catch (err) {
      console.error("Scheduled inbox check failed:", err.message);
    }
  });
};

// startServer();