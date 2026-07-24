import "server-only"
import { SendByte, SendByteError } from "@sendbyte/node"

const sendbyte = new SendByte(process.env.SENDBYTE_API_KEY!)

export const sendOTPEmail = async (to: string, code: string): Promise<void> => {
  try {
    await sendbyte.emails.send({
      from: "TailorEase <noreply@yourdomain.com>",
      to,
      subject: "Your TailorEase Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2>Verify Your Email</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 8px; font-size: 36px; text-align: center; background: #f3f4f6; padding: 16px; border-radius: 8px;">${code}</h1>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    })
  } catch (error) {
    if (error instanceof SendByteError) {
      console.error({
        code: error.code,
        message: error.message,
        status: error.status,
      })
    }
    throw new Error("Failed to send verification email")
  }
}