import nx from '@nx/eslint-plugin';
import parser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import unicornPlugin from 'eslint-plugin-unicorn';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.cts',
            '**/*.mts',
            '**/*.js',
            '**/*.jsx',
            '**/*.cjs',
            '**/*.mjs',
        ],
        ignores: [
            '**/dist',
            'eslint.config.mjs',
            'jest.config.ts',
            'webpack.config.js',
        ],
        plugins: {
            unicorn: unicornPlugin,
            import: importPlugin,
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
                node: true,
            },
        },
        // Override or add rules here
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-extraneous-class': 'off',
            '@typescript-eslint/no-use-before-define': 'off',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
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
                    allow: ['app/*', '@mikro-orm/**', '@nestjs/**', 'rxjs/**'],
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
                    'tsconfig.base.json',
                    '@(apps|libs|tools)/**/tsconfig?(.*).json',
                ],
                /**
                 * By default, the Nx Eslint plugin will have the individual project dir as root dir.
                 * For Nx this is fine, however our VSCode linting setup will not work correctly, as the root dir for that is the repository root.
                 * To fix this, we need to set the tsconfigRootDir to the repository root to align them.
                 */
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
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
    },
];
