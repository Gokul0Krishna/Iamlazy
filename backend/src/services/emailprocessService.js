import axios from "axios";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const buildPrompt = (emailBody) => `
You are an information extraction engine. Extract the following fields from
the email body below and return ONLY a valid JSON object with these exact keys:

- company_name       (string, required)
- registration_date  (string, ISO date "YYYY-MM-DD", required)
- work_period        (string, e.g. "3 months" or "June 2026 - Sept 2026", optional)
- stiphend            (string, stipend amount/description, optional)
- location           (string, optional)
- company_website    (string, URL, optional)

Rules:
- Return ONLY the JSON object. No markdown, no code fences, no explanation.
- If registration_date is not explicitly mentioned in the email, use today's date.
- If an optional field cannot be found, use an empty string "" for it, never null.
- Do your best to infer company_name even if not explicitly labeled.

Email body:
"""
${emailBody}
"""
`;

export const extractEmailInfo = async (emailBody) => {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not set in environment variables");
  }

  const response = await axios.post(
    OPENROUTER_API_URL,
    {
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise JSON extraction assistant. You only ever output valid JSON, nothing else.",
        },
        { role: "user", content: buildPrompt(emailBody) },
      ],
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content?.trim() || "";

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse OpenRouter response as JSON. Raw response: ${raw}`);
  }

  return parsed;
};
