import { TSMigrationGenerator } from '@mikro-orm/migrations';

import { toPascalCase } from './data.utils';

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
