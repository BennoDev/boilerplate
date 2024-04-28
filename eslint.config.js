const { Linter } = require('eslint');
const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nxEslintPlugin = require('@nx/eslint-plugin');
const parser = require('@typescript-eslint/parser');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

/**
 * We need to use FlatCompat because the following plugins have not yet migrated to Flat Config:
 * - eslint-import-resolver-typescript
 * - eslint-plugin-import
 *
 * @type {Array<Linter.FlatConfig>}
 */
module.exports = [
    { plugins: { '@nx': nxEslintPlugin } },
    ...compat
        .config({
            extends: ['plugin:@nx/typescript'],
            plugins: ['unicorn', 'import'],
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
        })
        .map(config => ({
            ...config,
            files: ['**/*.ts', '**/*.tsx'],
            rules: {
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
                    {
                        argsIgnorePattern: '^_',
                        varsIgnorePattern: '^_',
                    },
                ],
                '@typescript-eslint/consistent-type-imports': [
                    'error',
                    {
                        prefer: 'type-imports',
                        fixStyle: 'inline-type-imports',
                    },
                ],
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
                        alphabetize: {
                            caseInsensitive: true,
                            order: 'asc',
                        },
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
                'unicorn/prefer-node-protocol': 'error',
                'no-inline-comments': 'error',
                'spaced-comment': ['error', 'always'],
                'prefer-arrow-callback': 'error',
                eqeqeq: ['error', 'always'],
                'func-style': ['error', 'expression'],
            },
            languageOptions: {
                parser,
                parserOptions: {
                    project: [
                        './tsconfig.base.json',
                        'apps/**/tsconfig.json',
                        'libs/**/tsconfig.json',
                    ],
                },
            },
        })),
    ...compat.config({ extends: ['plugin:@nx/javascript'] }).map(config => ({
        ...config,
        files: ['**/*.js', '**/*.jsx'],
        rules: {},
    })),
    ...compat.config({ env: { jest: true } }).map(config => ({
        ...config,
        files: [
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/*.spec.js',
            '**/*.spec.jsx',
        ],
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
    })),
    { ignores: ['/dist', '/node_modules'] },
];
