import { z } from "zod";

export const sumSchema = z.object({
  number1: z
    .string()
    .min(1, "First number is required")
    .refine((val) => !isNaN(Number(val)), "Must be a valid number"),
  number2: z
    .string()
    .min(1, "Second number is required")
    .refine((val) => !isNaN(Number(val)), "Must be a valid number"),
});

export type SumFormData = z.infer<typeof sumSchema>;
