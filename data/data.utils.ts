import * as Knex from 'knex';

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
