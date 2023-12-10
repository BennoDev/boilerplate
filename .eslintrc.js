module.exports = {
    root: true,
    ignorePatterns: ['**/*'],
    plugins: ['@nx'],
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
            rules: {
                '@nx/enforce-module-boundaries': 'off',
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            extends: ['plugin:@nx/typescript'],
            plugins: ['unicorn', 'import'],
            parserOptions: {
                project: [
                    './tsconfig.base.json',
                    'apps/**/tsconfig.json',
                    'libs/**/tsconfig.json',
                ],
            },
            settings: {
                'import/resolver': {
                    typescript: {
                        project: [
                            'tsconfig.base.json',
                            'apps/**/tsconfig.json',
                            'libs/**/tsconfig.json',
                        ],
                    },
                },
            },
            rules: {
                // TypeScript
                '@typescript-eslint/explicit-function-return-type': 'error',
                '@typescript-eslint/no-floating-promises': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-extraneous-class': 'off',
                '@typescript-eslint/no-use-before-define': 'off',
                '@typescript-eslint/interface-name-prefix': 'off',
                '@typescript-eslint/consistent-type-definitions': [
                    'error',
                    'type',
                ],
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
                    {
                        allow: [
                            'app/*',
                            '@mikro-orm/**',
                            '@nestjs/**',
                            'rxjs/**',
                        ],
                    },
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
                'func-style': ['error', 'expression'],
            },
        },
        {
            files: ['*.js', '*.jsx'],
            extends: ['plugin:@nx/javascript'],
            rules: {},
        },
        {
            files: ['*.spec.ts', '*.spec.tsx', '*.spec.js', '*.spec.jsx'],
            env: {
                jest: true,
            },
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
    ],
};
