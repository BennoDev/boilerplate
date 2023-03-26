module.exports = {
    root: true,
    overrides: [
        {
            files: ['*.ts', '*.js'],
            plugins: ['@typescript-eslint', 'unicorn', 'import'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/eslint-recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:@typescript-eslint/strict',
                'plugin:import/typescript',
                'plugin:import/recommended',
                'plugin:import/warnings',
                'plugin:import/errors',
            ],
            parserOptions: {
                project: './tsconfig.json',
                emitDecoratorMetadata: true,
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project: './tsconfig.json',
                    },
                },
            },
            rules: {
                // TypeScript
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-extraneous-class': 'off',
                '@typescript-eslint/no-use-before-define': 'off',
                '@typescript-eslint/interface-name-prefix': 'off',
                '@typescript-eslint/no-unused-vars': [
                    'warn',
                    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
                ],
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
                    { allow: ['@mikro-orm/**', '@nestjs/**', 'rxjs/**', '@libs/common/*'] },
                ],
                'import/no-unused-modules': 'error',
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
                'prefer-arrow-callback': 'error',
                eqeqeq: ['error', 'always'],
            },
        },
        {
            files: ['*.spec.ts'],
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/restrict-template-expressions': [
                    'error',
                    { allowAny: true },
                ],
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-argument': 'off',
                '@typescript-eslint/no-unsafe-member-access': 'off',
            },
        },
        {
            /**
             * This override exists because migration classes extend an abstract base which demands a type signature of async () => Promise<void>
             * even if the extending method does not require to be asynchronous. Removing the
             */
            files: ['*.migration.ts'],
            rules: {
                '@typescript-eslint/require-await': 'off',
            },
        },
    ],
    env: { node: true },
};
