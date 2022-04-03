import { Migration } from '@mikro-orm/migrations';
import { readFileSync } from 'fs';

import { clearData, insertData } from '../data.utils';

const entityName = 'user';
const path = `${__dirname}/users.json`;
const data = JSON.parse(readFileSync(path).toString());

export class Migration20210618202117 extends Migration {
    async up(): Promise<void> {
        insertData(this.getKnex(), data, entityName);
    }

    async down(): Promise<void> {
        clearData(this.getKnex(), entityName);
    }
}
