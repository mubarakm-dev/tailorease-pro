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



export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await sendbyte.emails.send({
      from: "TailorEase <noreply@yourdomain.com>",
      to,
      subject,
      html,
    })
  } catch (error) {
    if (error instanceof SendByteError) {
      console.error({
        code: error.code,
        message: error.message,
        status: error.status,
      })
    }
    throw new Error("Failed to send email")
  }

}


export async function sendCompanySuspendedEmail(to: string, companyName: string, ownerFullname: string): Promise<void> {
  const subject = "Your Company has been suspended"
  const html = `
        <div>
            <h2>Account suspended</h2>
            <p>Dear ${ownerFullname}, ${companyName} has been suspended on TailorEase. Please contact support.</p>
        </div>
    `

  await sendEmail(to, subject, html)


}

export async function sendCompanyRejectedEmail(to: string, companyName: string, ownerFullname: string): Promise<void> {
  const subject = "Your Company has been Rejected"
  const html = `
        <div>
            <h2>Account Rejected</h2>
            <p>Dear ${ownerFullname}, ${companyName} has been rejected on TailorEase. Please contact support.</p>
        </div>
    `

  await sendEmail(to, subject, html)

}


export async function sendStaffRejectedEmail(to: string, companyName: string, staffFullname: string): Promise<void> {
  const subject = "Your Registration has been Rejected"
  const html = `
        <div>
            <h2>Account Rejected</h2>
            <p>Dear ${staffFullname}, The Management of ${companyName} has rejected your registration. Please contact your company support.</p>
        </div>
    `

  await sendEmail(to, subject, html)

}

export async function sendStaffApprovalEmail(to: string, companyName: string, staffFullname: string): Promise<void> {
  const subject = "Your Registration has been Approved"
  const html = `
        <div>
            <h2>Account Approved</h2>
            <p>Dear ${staffFullname}, The Management of ${companyName} has Approved your registration.</p>
        </div>
    `

  await sendEmail(to, subject, html)

}

export async function sendStaffSuspendedEmail(to: string, companyName: string, staffFullname: string): Promise<void> {
  const subject = "Your Accounnt has been Suspended"
  const html = `
        <div>
            <h2>Account Suspended</h2>
            <p>Dear ${staffFullname}, The Management of ${companyName} has suspended your account. Please contact your company support.</p>
        </div>
    `

  await sendEmail(to, subject, html)

}

export async function sendStaffReactivateEmail(to: string, companyName: string, staffFullname: string): Promise<void> {
  const subject = "Your Accounnt has been Reactivated"
  const html = `
        <div>
            <h2>Account Reactivated</h2>
            <p>Dear ${staffFullname}, The Management of ${companyName} has reactivated your account.</p>
        </div>
    `

  await sendEmail(to, subject, html)

}




export async function sendCompanyApprovalEmail(to: string, companyName: string, ownerFullname: string, companyCode: string): Promise<void> {
  const subject = "Your company registration has been approved"
  const html = `
        <div>
            <h2>Company Approved</h2>
            <p>Dear ${ownerFullname}, The Platform developer has approved the registration of ${companyName}.</p>
            <p>Your Company code: <strong>${companyCode}</strong> </P>
        </div>
    `

  await sendEmail(to, subject, html)
}


export async function sendCompanyReactivatedEmail(to: string, companyName: string, ownerFullname: string): Promise<void> {
  const subject = "Your Company has been Re-activated"
  const html = `
        <div>
            <h2>Account Re-actiavted</h2>
            <p>Dear ${ownerFullname}, ${companyName} has been reactivated on TailorEase.</p>
        </div>
    `

  await sendEmail(to, subject, html)

}

