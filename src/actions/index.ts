import { defineAction } from "astro:actions";
import { z } from "astro/zod";

async function verifyRecaptcha(
  token: string,
  secret: string
): Promise<boolean> {
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret,
          response: token,
        }),
      }
    );
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("reCAPTCHA verification failed:", error);
    return false;
  }
}

export const server = {
  contact: defineAction({
    accept: "form",
    input: z.object({
      name: z.string().trim().min(1, "Name is required"),
      email: z.email("Valid email is required").trim(),
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
      const recaptchaToken = input["g-recaptcha-response"];

      const recaptchaSecret =
        env.RECAPTCHA_SECRET_KEY || import.meta.env.RECAPTCHA_SECRET_KEY;
      if (recaptchaSecret && recaptchaToken) {
        const isValid = await verifyRecaptcha(recaptchaToken, recaptchaSecret);
        if (!isValid) {
          throw new Error("Failed reCAPTCHA verification.");
        }
      }

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
