export const EmailSchema = { type: "string", format: "email" } as const;
export const PasswordSchema = { type: "string", minLength: 8, maxLength: 255 } as const;
