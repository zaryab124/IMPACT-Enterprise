import { z } from "zod";
import { ValidationError } from "../errors/AppError";

export async function parseJsonBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<T> {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch (err) {
    throw new ValidationError("Malformed JSON request body");
  }

  const result = schema.safeParse(rawBody);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export function parseSearchParams<T>(url: string, schema: z.ZodSchema<T>): T {
  const { searchParams } = new URL(url);
  const rawParams: Record<string, string> = {};
  searchParams.forEach((val, key) => {
    rawParams[key] = val;
  });

  const result = schema.safeParse(rawParams);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
