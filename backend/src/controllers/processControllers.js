import Email from "../models/format.js";
import { extractEmailInfo } from "../services/openrouterService.js";

/**
 * Core reusable function: takes raw email body text, sends it to
 * OpenRouter for extraction, and saves the structured result to MongoDB.
 */
export const processAndSaveEmail = async (emailBody) => {
  const extracted = await extractEmailInfo(emailBody);

  const emailDoc = new Email({
    company_name: extracted.company_name || "Unknown",
    registration_date: extracted.registration_date
      ? new Date(extracted.registration_date)
      : new Date(),
    work_period: extracted.work_period || "",
    stiphend: extracted.stiphend || "",
    location: extracted.location || "",
    company_website: extracted.company_website || "",
    status: false,
  });

  await emailDoc.save();
  return emailDoc;
};

// POST /api/process  { body: "<raw email text>" }
// Useful for manually pasting an email body to test extraction without IMAP.
export const processManualEmail = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) {
      return res.status(400).json({ message: "Email body is required" });
    }

    const saved = await processAndSaveEmail(body);
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error processing email:", error.message);
    res.status(500).json({ message: "Failed to process email", error: error.message });
  }
};

// GET /api/process
export const getAllEntries = async (req, res) => {
  try {
    const entries = await Email.find().sort({ registration_date: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entries", error: error.message });
  }
};

// GET /api/process/:id
export const getEntryById = async (req, res) => {
  try {
    const entry = await Email.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch entry", error: error.message });
  }
};

// PATCH /api/process/:id/status  -> toggles the boolean status field
export const toggleStatus = async (req, res) => {
  try {
    const entry = await Email.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.status = !entry.status;
    await entry.save();
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Failed to update status", error: error.message });
  }
};

// DELETE /api/process/:id
export const deleteEntry = async (req, res) => {
  try {
    const entry = await Email.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });
    res.status(200).json({ message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete entry", error: error.message });
  }
};