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
            // The default className is `Migration<Timestamp>_<Name>` which doesn't work with kebab case - which is the preferable file naming convention.
            // So we transform it to PascalCase which is the preferred class naming convention, and we omit the verbose timestamp & Migration prefix.
            toPascalCase(className.split('_').slice(1).join('_')),
            diff,
        );
    }
}
