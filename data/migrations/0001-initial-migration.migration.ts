import { Migration } from '@mikro-orm/migrations';

export class InitialMigration extends Migration {
    async up(): Promise<void> {
        this.addSql('create extension if not exists "uuid-ossp";');
    }

    async down(): Promise<void> {
        this.addSql('drop extension if exists "uuid-ossp"');
    }
}
