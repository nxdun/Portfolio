import { defineAction } from "astro:actions";
import { z } from "astro/zod";

export const server = {
  contact: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().trim().min(1, "Name is required"),
      email: z.email({ message: "Valid email is required" }).trim(),
      purpose: z.string().trim().min(1, "Purpose is required"),
      message: z.string().trim().min(1, "Message is required"),
      "g-recaptcha-response": z.string().trim().optional(),
    }),
    handler: async input => {
      // Astro 6
      const { env } = await import("cloudflare:workers");
      const db = env.portfolio_db;

      if (!db) {
        throw new Error("Database connection not found");
      }

      const { name, email, purpose, message } = input;
      // verify the captcha here

      try {
        await db
          .prepare(
            `INSERT INTO contact_messages (name, email, purpose, message, status) VALUES (?, ?, ?, ?, 'unread')`
          )
          .bind(name, email, purpose, message)
          .run();

        return { success: true, name };
      } catch (error) {
        throw new Error("Failed to write to database.", { cause: error });
      }
    },
  }),
};
