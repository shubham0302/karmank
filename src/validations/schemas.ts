import { z } from "zod";
import { VALIDATION_RULES } from "@/constants";

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(VALIDATION_RULES.PASSWORD.MIN_LENGTH, `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`)
    .max(VALIDATION_RULES.PASSWORD.MAX_LENGTH, `Password must be less than ${VALIDATION_RULES.PASSWORD.MAX_LENGTH} characters`),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// Numerology Input Schemas
// ============================================

/**
 * Validates name input
 * - Allows English letters, spaces, and Devanagari script
 * - Min 2 characters, max 50 characters
 */
export const nameSchema = z
  .string()
  .trim()
  .min(VALIDATION_RULES.NAME.MIN_LENGTH, `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters`)
  .max(VALIDATION_RULES.NAME.MAX_LENGTH, `Name cannot exceed ${VALIDATION_RULES.NAME.MAX_LENGTH} characters`)
  .regex(
    VALIDATION_RULES.NAME.PATTERN,
    "Name can only contain letters (English or Hindi) and spaces"
  );

/**
 * Validates date of birth
 * - Accepts DD/MM/YYYY format
 * - Validates year range (1900 to current year)
 * - Validates valid dates (no 31st February, etc.)
 */
export const dobSchema = z
  .string()
  .trim()
  .regex(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/, "Date must be in DD/MM/YYYY format")
  .refine((date) => {
    const parts = date.split(/[\/\-]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check year range
    if (year < VALIDATION_RULES.DATE.MIN_YEAR || year > VALIDATION_RULES.DATE.MAX_YEAR) {
      return false;
    }

    // Check month range
    if (month < 1 || month > 12) {
      return false;
    }

    // Check day range based on month
    const daysInMonth = new Date(year, month, 0).getDate();
    return day >= 1 && day <= daysInMonth;
  }, "Please enter a valid date");

/**
 * Complete numerology input schema
 */
export const numerologyInputSchema = z.object({
  name: nameSchema,
  dob: dobSchema,
});

export type NumerologyInputValidation = z.infer<typeof numerologyInputSchema>;

// ============================================
// Compatibility Input Schema
// ============================================

export const compatibilityInputSchema = z.object({
  person1: z.object({
    name: nameSchema,
    dob: dobSchema,
  }),
  person2: z.object({
    name: nameSchema,
    dob: dobSchema,
  }),
});

export type CompatibilityInputValidation = z.infer<typeof compatibilityInputSchema>;

// ============================================
// Name Analysis Schema
// ============================================

export const nameAnalysisInputSchema = z.object({
  name: nameSchema,
  system: z.enum(["chaldean", "pythagorean"]).optional().default("chaldean"),
});

export type NameAnalysisInputValidation = z.infer<typeof nameAnalysisInputSchema>;

// ============================================
// Helper Functions
// ============================================

/**
 * Validate and parse input with Zod schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Get first error message from Zod error
 */
export function getFirstError(error: z.ZodError): string {
  const firstIssue = error.issues[0];
  return firstIssue?.message || "Validation failed";
}

/**
 * Get all error messages as object
 * { field: "error message" }
 */
export function getAllErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });
  return errors;
}
