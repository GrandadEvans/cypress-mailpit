module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6,
    },
    "rules": {
        "quotes": [2, "double"],
        "max-len": ["error", { "code": 120 }],
        "indent": ["error", 4],
        "object-curly-spacing": ["error", "always", { "objectsInObjects": false }],
    },
};
