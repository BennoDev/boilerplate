import { readdirSync } from 'fs';
import { Knex } from 'knex';
import { question } from 'readline-sync';

export async function insertData(
    knex: Knex,
    data: unknown[],
    entityName: string,
): Promise<void> {
    console.info(`Inserting data for ${entityName}: started`);
    try {
        await knex.table(entityName).insert(data);
        console.info(`Inserting data for ${entityName}: success`);
    } catch (error) {
        console.error(`Inserting data for ${entityName}: failed`);
        throw error;
    }
}

export async function clearData(knex: Knex, entityName: string): Promise<void> {
    console.info(`Truncating table "${entityName}": started`);
    try {
        await knex.raw(`truncate table "${entityName}" cascade`);
        console.info(`Inserting data for ${entityName}: success`);
    } catch (error) {
        console.error(`Inserting data for ${entityName}: failed`);
        throw error;
    }
}

/**
 * Allows us to properly name our migrations rather than the default Migration<TimeStamp> MikroORM uses.
 * Courtesy of https://github.com/mikro-orm/mikro-orm/issues/914#issuecomment-815129660.
 * @param path Path where the migration will be located.
 */
export function migrationFileName(path: string) {
    const DELIMITER = '-';

    // Get the last migration
    const lastFileName = readdirSync(path).pop();
    let counter = 0;

    if (lastFileName) {
        // Increment the counter based on the last migration
        counter = parseInt(lastFileName.split(DELIMITER)[0], 10) + 1;
    }

    // Ask user for a short description (keep asking until you get something or they quit with ctrl+c)
    let name = '';
    while (!name) {
        name = question(
            '\nWhat is the name of the new migrations (kebab-cased)\n> ',
        )
            .replace(/\s+/gi, DELIMITER) // Replace any number of whitespace characters with the delimiter
            .toLowerCase();
    }

    // Setting it to an environment variable allows us to also use the name in the MigrationGenerator.
    process.env.MIGRATION_NAME = name;

    // New line to find question in logs easier
    console.log();

    return `${(counter || 1).toString().padStart(4, '0')}-${name}.migration`;
}

/**
 * Transforms text to PascalCase.
 * Courtesy of: https://stackoverflow.com/a/53952925
 * @param text Text that will be transformed.
 */
export function toPascalCase(text: string) {
    return `${text}`
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(
            new RegExp(/\s+(.)(\w*)/, 'g'),
            (_, second, third) =>
                `${second.toUpperCase() + third.toLowerCase()}`,
        )
        .replace(new RegExp(/\w/), s => s.toUpperCase());
}
