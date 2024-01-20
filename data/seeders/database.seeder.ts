import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { readFile } from 'fs/promises';
import { User } from '../../libs/models/src';

// Add more seed data here
type SeedData = {
    users: any;
};

export class DatabaseSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        const { users } = await this.getData();

        console.log(`Seeding [${users.length}] db instances`);
        await em.insert(User, users);
    }

    private async getData(): Promise<SeedData> {
        const paths = [`${__dirname}/users.json`];

        const raw = await Promise.all(paths.map(path => readFile(path)));
        const [users] = raw.map(data => JSON.parse(data.toString()));

        return { users };
    }
}
