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