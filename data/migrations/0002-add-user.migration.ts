import { Migration } from '@mikro-orm/migrations';

export class AddUser extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "User" ("id" uuid not null default uuid_generate_v4(), "createdAt" timestamptz(3) not null, "updatedAt" timestamptz(3) not null, "email" varchar(255) not null, "state" text check ("state" in (\'REGISTERING\', \'ACTIVE\', \'INACTIVE\')) not null, "password" varchar(255) not null, "firstName" varchar(255) not null, "lastName" varchar(255) not null);',
        );
        this.addSql(
            'alter table "User" add constraint "User_email_unique" unique ("email");',
        );
        this.addSql(
            'alter table "User" add constraint "User_pkey" primary key ("id");',
        );
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "User" cascade;');
    }
}
