import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid company email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
   confirmPassword: z.string(),
  ownerFullname: z.string().min(2, "Owner full name is required"),
  ownerEmail: z.string().email("Invalid owner email"),
  ownerPhone: z.string().min(7, "Valid phone number is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>

export const registerStaffSchema = z.object({
  companyCode: z.string().min(1, "Company code is required"),
  fullname: z.string().min(2, "fullname is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),

})
export type RegisterStaffInput = z.infer<typeof registerStaffSchema>

export const verifyOtpSchema = z.object({
  email: z.email("Invalid email address"),
  code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
})
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>

export const resendOtpSchema = z.object({
  email: z.email("Invalid email address"),
})
export type ResendOtpInput = z.infer<typeof resendOtpSchema>


