import { z } from "zod";

// Validator function for the add friend form
export const emailValidator = z.object({
  email: z.string().email(),
});
