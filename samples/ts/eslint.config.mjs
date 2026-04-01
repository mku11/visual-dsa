/**
 * ESLint configuration for the project.
 * 
 * See https://eslint.style and https://typescript-eslint.io for additional linting options.
 */
// @ts-check
import js from '@eslint/js';
import tsparser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import globals from "globals";

export default [
	{
		ignores: [
			'out'
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...tseslint.configs.stylistic,
	{
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				sourceType: 'module',
				tsconfigRootDir: import.meta.dirname
			},
			globals: {
				...globals.browser,
				...globals.jquery,
				...globals.node,
			},
		},
		plugins: {
			'@stylistic': stylistic,
		},
		rules: {
			'@typescript-eslint/prefer-for-of': ['off'],
			'@stylistic/semi': ['error', 'always'],
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					'selector': 'import',
					'format': ['camelCase', 'PascalCase']
				}
			],
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					'argsIgnorePattern': '^_'
				}
			]
		}
	}
];
