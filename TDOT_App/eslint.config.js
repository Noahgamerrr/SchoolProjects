import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    {ignores: ['tests', 'client']},
    { 
        rules: {
            "no-unused-vars": [
                "warn",
                {
                    "argsIgnorePattern": "^_",
                    "varsIgnorePattern": "^_",
                    "caughtErrorsIgnorePattern": "^_"
                },
            ],
            indent: ["warn", 4, {SwitchCase: 1}],
            "no-empty": "error",
            "no-undef": "error"
        }
    },
    {languageOptions: { globals: globals.node }},
];