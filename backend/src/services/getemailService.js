export async function fetchmails(req, res) {
    try{
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
Chetan J` });
    }
    catch(err){
        res.status(500).json({ message: "Internal Server Error" });
    }
}


import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const getAllowedSenders = () =>
  (process.env.ALLOWED_SENDERS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

/**
 * Connects to the configured IMAP inbox, finds unseen emails from the
 * allowed sender list, marks them as seen, and returns their parsed content.
 *
 * NOTE: if ALLOWED_SENDERS is empty, ALL unseen emails will match — set it
 * in your .env to restrict processing to specific address(es).
 */
export const fetchNewEmails = async () => {
  const allowedSenders = getAllowedSenders();

  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT) || 993,
    secure: true,
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASS,
    },
    logger: false,
  });

  const matchedEmails = [];

  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = await client.search({ seen: false });

      for (const uid of uids) {
        const { source } = await client.fetchOne(uid, { source: true });
        const parsed = await simpleParser(source);

        const fromAddress = parsed.from?.value?.[0]?.address?.toLowerCase() || "";

        const isAllowed =
          allowedSenders.length === 0 || allowedSenders.includes(fromAddress);

        if (isAllowed) {
          matchedEmails.push({
            uid,
            from: fromAddress,
            subject: parsed.subject || "",
            body: parsed.text || parsed.html || "",
            date: parsed.date,
          });
        }

        // Mark as seen either way so we never reprocess the same email
        await client.messageFlagsAdd(uid, ["\\Seen"]);
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return matchedEmails;
};