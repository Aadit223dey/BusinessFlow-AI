/**
 * Transactional Email HTML Templates
 */

export function getStaffInviteEmailTemplate(
  businessName: string,
  inviterName: string,
  inviteLink: string
): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 12px;">
      <h2 style="color: #0f172a; margin-bottom: 16px;">You've Been Invited to Join ${businessName}</h2>
      <p style="color: #334155; font-size: 16px; line-height: 1.5;">
        ${inviterName} has invited you to join their staff team on <strong>BusinessFlow AI</strong>.
      </p>
      <div style="margin: 32px 0; text-align: center;">
        <a href="${inviteLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
          Accept Invitation & Set Up Account
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">
        This link will expire in 7 days. If you were not expecting this email, you can safely ignore it.
      </p>
    </div>
  `;
}
