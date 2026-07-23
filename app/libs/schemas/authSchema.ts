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
  ownerFullname: z.string().min(2, "Owner full name is required"),
  ownerEmail: z.string().email("Invalid owner email"),
  ownerPhone: z.string().min(7, "Valid phone number is required"),
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
