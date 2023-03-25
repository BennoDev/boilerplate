import { readFileSync } from 'node:fs';

import { Migration } from '@mikro-orm/migrations';

import { clearData, insertData } from '../data.utils';

const entityName = 'User';
const path = `${__dirname}/users.json`;
const data = JSON.parse(readFileSync(path).toString());

export class Users extends Migration {
    async up(): Promise<void> {
        insertData(this.getKnex(), data, entityName);
    }

    async down(): Promise<void> {
        clearData(this.getKnex(), entityName);
    }
}
