import * as z from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(3, "Warehouse name must be at least 3 characters"),
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(10, "Code cannot be more than 10 characters")
    .toUpperCase(),
  address: z.string().min(10, "Please enter a complete address"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().min(4, "Valid ZIP code is required"),
  type: z.enum(["distribution", "storage", "fulfillment", "cross-dock", "cold-storage"]),
  capacity: z.number().min(100, "Capacity must be at least 100 sq ft"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  manager: z.string().optional(),
});

export type WarehouseFormValues = z.infer<typeof warehouseSchema>;