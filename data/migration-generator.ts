import { TSMigrationGenerator } from '@mikro-orm/migrations';

/**
 * Transforms text to PascalCase.
 * Courtesy of https://stackoverflow.com/a/53952925
 *
 * @param text Text that will be transformed.
 */
const toPascalCase = (text: string): string => {
    return `${text}`
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(
            new RegExp(/\s+(.)(\w*)/, 'g'),
            (_, second, third) =>
                `${second.toUpperCase() + third.toLowerCase()}`,
        )
        .replace(new RegExp(/\w/), s => s.toUpperCase());
};

export class MigrationGenerator extends TSMigrationGenerator {
    generateMigrationFile(
        className: string,
        diff: { up: string[]; down: string[] },
    ): string {
        return super.generateMigrationFile(
            /**
             * MIGRATION_NAME environment variable should have been set before this point,
             * in the `migrationFileName` function in `data.config.ts`.
             */
            toPascalCase(process.env.MIGRATION_NAME ?? className),
            diff,
        );
    }
}
