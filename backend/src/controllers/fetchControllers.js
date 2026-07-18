import { fetchNewEmails } from "../services/imapService.js";
import { processAndSaveEmail } from "./processControllers.js";

// GET /api/fetch/check
// Manually triggers a check of the inbox for new emails from allowed senders,
// runs each matching email through the OpenRouter extraction pipeline, and
// saves the results.
export const checkInbox = async (req, res) => {
  try {
    const emails = await fetchNewEmails();

    const results = [];
    for (const email of emails) {
      try {
        const saved = await processAndSaveEmail(email.body);
        results.push({ from: email.from, subject: email.subject, saved });
      } catch (err) {
        console.error(`Failed to process email from ${email.from}:`, err.message);
        results.push({ from: email.from, subject: email.subject, error: err.message });
      }
    }

    res.status(200).json({
      message: `Checked inbox. ${emails.length} matching email(s) found.`,
      results,
    });
  } catch (error) {
    console.error("Error checking inbox:", error.message);
    res.status(500).json({ message: "Failed to check inbox", error: error.message });
  }
};