import { fetchNewEmails } from "../services/getemailService.js";
import { processAndSaveEmail } from "./processControllers.js";

// GET /api/fetch/check
// Manually triggers a check of the inbox for new emails from allowed senders,
// runs each matching email through the OpenRouter extraction pipeline, and
// saves the results.
export const checkInbox = async (req, res) => {
  if (!process.env.TEST_MODE !== "true") {
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
}

else{
  res.status(200).json({ message: `
Dear Students,

HealthAsyst hiring for the interns from 2027 graduating batch, please go through the below details and get register before 9th July 2026.

Registration Link - Apply in SLCM.

End Date - 9th July 2026 (10:00 AM).

Role Offered: Intern

Eligibility: B.E./B.Tech (CS, IT, or EC specialization only) – 2027 Batch Fresher (75% and above)

We are looking to hire final-semester engineering students for a 6-month internship in Bengaluru. During the training period, selected candidates will receive a stipend of ₹25,000 per month.

Candidates will undergo a 6-month Internship program, and based on their performance during the internship, they may be absorbed into the organization. Upon absorption, they will be required to sign a 30-month employment agreement.

Training Duration: 6 Months
Stipend: ₹25,000 per month
Employment Agreement (upon absorption): 30 Months
Location: Bengaluru

Hiring Process

Online Assessment
Group Discussion
One-on-One Interview
Managerial/HR Round
About HealthAsyst

Company Profile: www.healthasyst.com

HealthAsyst is a technology company with a strong track record of successful products and services engagements across the healthcare industry since 1999. We specialize in software development, mobile application development, healthcare integration, and other healthcare technology solutions.

Additional Requirements

CS, IT, or EC background students for the Developer Trainee role.
Preference will be given to students from Karnataka or nearby regions looking for long-term career opportunities.
Aggregate marks of 75% and above.
Candidates selected and absorbed after the training period will be required to sign a mandatory 30-month employment agreement.
Work Location: Bengaluru.


Thanks and Regards,
Chetan J`})}
};