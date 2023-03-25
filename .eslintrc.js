module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        emitDecoratorMetadata: true,
    },
    plugins: ['@typescript-eslint', 'unicorn'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'plugin:import/warnings',
    ],
    rules: {
        // TypeScript
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-empty-function': 'warn',
        '@typescript-eslint/ban-types': 'warn',
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                fixStyle: 'inline-type-imports',
            },
        ],
        // Imports
        'import/first': 'error',
        'import/no-internal-modules': [
            'error',
            { allow: ['@mikro-orm/**', '@nestjs/**', 'rxjs/**'] },
        ],
        'import/no-unused-modules': 'warn',
        'import/no-default-export': 'error',
        'import/order': [
            'error',
            {
                alphabetize: { caseInsensitive: true, order: 'asc' },
                groups: [
                    ['builtin'],
                    ['external'],
                    ['internal'],
                    ['parent'],
                    ['sibling', 'index'],
                ],
                pathGroups: [
                    {
                        pattern: '@libs/**',
                        group: 'internal',
                    },
                ],
                pathGroupsExcludedImportTypes: ['builtin'],
                'newlines-between': 'always',
            },
        ],
        // Unicorn
        'unicorn/prefer-node-protocol': 'error',
        // Comments
        'no-inline-comments': 'error',
        'spaced-comment': ['error', 'always'],
        // Misc
        'prefer-arrow-callback': 'warn',
    },
    env: { node: true },
};
