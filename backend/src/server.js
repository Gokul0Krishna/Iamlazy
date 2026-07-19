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

  // Cron polling is opt-in — set ENABLE_CRON=true in .env once you're ready
  // to let it auto-check the inbox. Left off by default so it doesn't fire
  // OpenRouter/IMAP calls while you're testing endpoints manually.
  if (process.env.ENABLE_CRON === "true") {
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
    console.log(`Cron inbox polling enabled (${cronSchedule})`);
  } else {
    console.log("Cron inbox polling disabled — hit /api/fetch/check manually to test.");
  }
};

startServer();