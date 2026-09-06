import rootConfig from "../shared/eslint.config.mjs";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...rootConfig,
  {
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",

      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/jsx-fragments": "off",
      "react/no-arrow-function-lifecycle": "off",
      "react/no-danger": "off",
      "react/no-deprecated": "off",
      "react/no-did-mount-set-state": "off",
      "react/no-did-update-set-state": "off",
      "react/no-direct-mutation-state": "off",
      "react/no-is-mounted": "off",
      "react/no-unused-state": "off",
      "react/no-multi-comp": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-newline": "off",
      "react/hook-use-state": "off",
      "react/jsx-curly-newline": "off",
      "react/self-closing-comp": "off",
      "react/jsx-wrap-multilines": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": "off"
    }
  }
]);