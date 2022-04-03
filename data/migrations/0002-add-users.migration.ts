import { Migration } from '@mikro-orm/migrations';

export class AddUsers extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "user" ("id" uuid not null default uuid_generate_v4(), "created_at" timestamptz(3) not null, "updated_at" timestamptz(3) not null, "email" varchar(255) not null, "state" text check ("state" in (\'REGISTERING\', \'ACTIVE\', \'INACTIVE\')) not null, "password" varchar(255) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null);',
        );
        this.addSql(
            'alter table "user" add constraint "user_email_unique" unique ("email");',
        );
        this.addSql(
            'alter table "user" add constraint "user_pkey" primary key ("id");',
        );
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "user" cascade;');
    }
}
