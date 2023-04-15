import { z } from "zod";

// Validator function for the id
export const idValidator = z.object({ id: z.string() });
