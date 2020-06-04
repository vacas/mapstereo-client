module.exports = {
    "parser": "@typescript-eslint/parser",
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        /* 
        To understand the recommended configurations: https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
        For list of rules excluded by prettier: https://github.com/prettier/eslint-config-prettier/blob/master/README.md#special-rules
        */
        "plugin:prettier/recommended",
        "prettier/react",
        "prettier/@typescript-eslint",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 11,
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "prefer-rest-params": "off",
    },
    "settings": {
        "react": {
          "version": "detect"
        }
      }
};
