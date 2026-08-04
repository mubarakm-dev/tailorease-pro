import z from "zod";


export const createOrderSchema = z.object({
  title: z.string().min(2, "Order title is required"),
  amount: z.coerce.number().int().positive("Amount must be a positive integer").optional(),
  notes: z.string().optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
