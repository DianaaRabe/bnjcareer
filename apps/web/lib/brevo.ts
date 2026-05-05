// ── Types ────────────────────────────────────────────────────────────────────

export interface SendCandidaturePayload {
  candidatFullName: string;
  candidatEmail: string;
  companyEmail: string;
  jobTitle: string;
  cvBase64: string;
  coverLetter: string | null;
}

// ── Send Candidature Email ───────────────────────────────────────────────────

/**
 * Sends a transactional email with the candidate's CV attached as PDF.
 * Uses native fetch to Brevo REST API to avoid SDK compatibility issues.
 */
export async function sendCandidatureEmail({
  candidatFullName,
  candidatEmail,
  companyEmail,
  jobTitle,
  cvBase64,
  coverLetter,
}: SendCandidaturePayload) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL is not configured");
  }

  const coverLetterHtml = coverLetter
    ? `<div style="margin: 16px 0; padding: 16px; background: #f8f9fa; border-left: 3px solid #590293; border-radius: 4px;">
         <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">Lettre de motivation :</p>
         <p style="margin: 0; color: #555; white-space: pre-line;">${coverLetter}</p>
       </div>`
    : "";

  const htmlContent = `
    <div style="font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <p>Madame, Monsieur,</p>
      <p>Veuillez trouver en pièce jointe le CV de <strong>${candidatFullName}</strong> pour le poste de <strong>${jobTitle}</strong>.</p>
      ${coverLetterHtml}
      <p>Cordialement,<br/>${candidatFullName}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">
        Email envoyé via BNJ Career — Plateforme d'accompagnement professionnel
      </p>
    </div>
  `;

  // Sanitize the candidate name for the PDF filename
  const safeName = candidatFullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);

  const payload = {
    sender: { name: "BNJ Career", email: senderEmail },
    to: [{ email: companyEmail }],
    replyTo: { email: candidatEmail, name: candidatFullName },
    subject: `Candidature – ${jobTitle} – ${candidatFullName}`,
    htmlContent,
    attachment: [
      {
        content: cvBase64,
        name: `CV_${safeName}.pdf`,
      },
    ],
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok) {
    const errorMsg = responseData.message || response.statusText;
    const errorStatus = response.status;
    const err: any = new Error(errorMsg);
    err.statusCode = errorStatus;
    throw err;
  }

  return responseData;
}
