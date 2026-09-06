import { EmailSchema, PasswordSchema } from "./validator";


export const SignInSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: EmailSchema,
    password: { type: "string", minLength: 1 }
  },
  additionalProperties: false
} as const;

export const SignUpSchema = {
  type: "object",
  required: ["email", "password"],
  properties: {
    email: EmailSchema,
    password: PasswordSchema
  },
  additionalProperties: false
} as const;
