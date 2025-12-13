import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
})

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@nexus.com"
const APP_NAME = "NeXuS"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

interface SendEmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"${APP_NAME}" <${FROM_EMAIL}>`,
            to,
            subject,
            html,
        })
        console.log("Email sent:", info.messageId)
        return { success: true, messageId: info.messageId }
    } catch (error) {
        console.error("Failed to send email:", error)
        return { success: false, error }
    }
}

export function getApprovalEmailTemplate(
    firstname: string,
    email: string,
    temporaryPassword: string,
): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Application Approved</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1></div>
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
<h2 style="color: #333; margin-top: 0;">Congratulations, ${firstname}!</h2>
<p>Your application to become an owner on ${APP_NAME} has been <strong style="color: #22c55e;">approved</strong>!</p>
<p>Below are your login credentials:</p>
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
<p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
<p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 2px 8px; border-radius: 4px;">${temporaryPassword}</code></p></div>
<p style="color: #dc2626; font-size: 14px;"><strong>Important:</strong> This temporary password will expire in 24 hours. You must change it upon first login.</p>
<div style="text-align: center; margin: 30px 0;">
<a href="${APP_URL}/owner/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Your Account</a></div>
</div></body></html>`
}

export function getRejectionEmailTemplate(firstname: string, reason: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Application Update</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1></div>
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
<h2 style="color: #333; margin-top: 0;">Hello, ${firstname}</h2>
<p>Thank you for your interest in becoming an owner on ${APP_NAME}.</p>
<p>After careful review, we regret to inform you that we are unable to approve your request at this time.</p>
<div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
<p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
<p style="margin: 10px 0 0 0; color: #7f1d1d;">${reason}</p></div>
<p>Feel free to reapply after addressing the feedback.</p>
</div></body></html>`
}

export function getApplicationReceivedEmailTemplate(firstname: string): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Application Received</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1></div>
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
<h2 style="color: #333; margin-top: 0;">Thank You, ${firstname}!</h2>
<p>We have received your application to become an owner on ${APP_NAME}.</p>
<div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
<p style="margin: 0; color: #166534;"><strong>What happens next?</strong></p>
<ul style="margin: 10px 0 0 0; color: #15803d;">
<li>Our team will review your application</li>
<li>We typically respond within 24-48 hours</li>
<li>You'll receive an email with our decision</li></ul></div>
</div></body></html>`
}

export function getAdminNotificationEmailTemplate(
    applicantName: string,
    applicantEmail: string,
    applicantPhone: string,
): string {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>New Owner Application</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
<h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME} Admin</h1></div>
<div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
<h2 style="color: #333; margin-top: 0;">New Owner Application</h2>
<p>A new owner application has been submitted.</p>
<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
<p style="margin: 5px 0;"><strong>Name:</strong> ${applicantName}</p>
<p style="margin: 5px 0;"><strong>Email:</strong> ${applicantEmail}</p>
<p style="margin: 5px 0;"><strong>Phone:</strong> ${applicantPhone}</p></div>
<div style="text-align: center; margin: 30px 0;">
<a href="${APP_URL}/admin/applications" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Application</a></div>
</div></body></html>`
}
