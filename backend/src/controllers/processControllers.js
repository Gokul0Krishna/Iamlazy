import Emial from '../models/format.js';
import axios from 'axios';

export const processEmail = async (req, res) => {
try{
    if (testMode === true || testMode === "true") {
      return res.status(200).json({
        message: "Test mode active. Data parsed successfully but not saved.",
        data: {
          ...extractedData,
          status: false
        }
      });
    }
    const { apiKey, testMode, emailText } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" });
    }
    if (!emailText) {
      return res.status(400).json({ error: "Email text is required" });
    }
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an AI that extracts specific structured data from emails into JSON format. Ensure all requested fields match the email details exactly. Parse dates into YYYY-MM-DD format."
          },
          {
            role: "user",
            content: emailText
          }
        ],
        response_format: {
          type: "json_object",
          schema: {
            type: "object",
            properties: {
              company_name: { type: "string" },
              registration_date: { type: "string", description: "Format: YYYY-MM-DD" },
              work_period: { type: "string" },
              stiphend: { type: "string" },
              location: { type: "string" },
              company_website: { type: "string" }
            },
            required: ["company_name", "registration_date"]
          }
        }
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );
    const extractedData = JSON.parse(response.data.choices[0].message.content);
}catch (error) {
    console.error("Error processing email:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Failed to process email content",
      details: error.response?.data || error.message
    });
  }
};

