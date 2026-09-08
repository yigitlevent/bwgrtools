export const RulesetsDataSchema = {
  type: "object",
  required: ["rulesets"],
  properties: {
    rulesets: { type: "array", items: { type: "string", minLength: 1, maxLength: 15 }, minItems: 1 }
  },
  additionalProperties: false
} as const;
