const { Resend } = require("resend")

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendInviteEmail({ name, email, token }) {
  const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`

  await resend.emails.send({
    from: "TM Beauty Hub <noreply@tmbeauty-hub.com>",
    to: email,
    subject: "Your TM Beauty Hub Account is Ready",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #F7F0E3; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 22px; color: #1A1A1A; letter-spacing: 4px; margin: 0;">TM BEAUTY HUB</h1>
          <div style="width: 40px; height: 1px; background: #A87C2A; margin: 12px auto;"></div>
          <p style="font-size: 12px; color: #A87C2A; font-style: italic; margin: 0;">Members Portal</p>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #D4B86A; border-top: 3px solid #A87C2A; padding: 36px;">
          <p style="font-size: 16px; color: #1A1A1A; margin: 0 0 16px;">Dear ${name},</p>
          <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 24px;">
            Your TM Beauty Hub account has been created. Please click the button below to set your password and access your account.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #A87C2A; color: #FFFFFF; padding: 16px 36px; text-decoration: none; font-size: 13px; letter-spacing: 3px; font-family: Georgia, serif;">
              SET MY PASSWORD
            </a>
          </div>

          <p style="font-size: 13px; color: #888; margin: 24px 0 0; line-height: 1.6;">
            This link expires in 24 hours. If you did not request this, please ignore this email.
          </p>
        </div>

        <p style="text-align: center; font-size: 11px; color: #B8A070; margin-top: 24px; letter-spacing: 1px;">
          © 2026 TM Beauty Hub. All rights reserved.
        </p>
      </div>
    `
  })
}

async function sendPasswordResetEmail({ name, email, token }) {
  const link = `${process.env.FRONTEND_URL}/set-password?token=${token}`

  await resend.emails.send({
    from: "TM Beauty Hub <noreply@tmbeauty-hub.com>",
    to: email,
    subject: "Reset Your TM Beauty Hub Password",
    html: `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; background: #F7F0E3; padding: 40px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 22px; color: #1A1A1A; letter-spacing: 4px; margin: 0;">TM BEAUTY HUB</h1>
          <div style="width: 40px; height: 1px; background: #A87C2A; margin: 12px auto;"></div>
          <p style="font-size: 12px; color: #A87C2A; font-style: italic; margin: 0;">Members Portal</p>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #D4B86A; border-top: 3px solid #A87C2A; padding: 36px;">
          <p style="font-size: 16px; color: #1A1A1A; margin: 0 0 16px;">Dear ${name},</p>
          <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}" style="background: #A87C2A; color: #FFFFFF; padding: 16px 36px; text-decoration: none; font-size: 13px; letter-spacing: 3px; font-family: Georgia, serif;">
              RESET MY PASSWORD
            </a>
          </div>

          <p style="font-size: 13px; color: #888; margin: 24px 0 0; line-height: 1.6;">
            This link expires in 1 hour. If you did not request this, please ignore this email.
          </p>
        </div>

        <p style="text-align: center; font-size: 11px; color: #B8A070; margin-top: 24px; letter-spacing: 1px;">
          © 2026 TM Beauty Hub. All rights reserved.
        </p>
      </div>
    `
  })
}

module.exports = { sendInviteEmail, sendPasswordResetEmail }