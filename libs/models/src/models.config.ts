import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { EntityCaseNamingStrategy } from '@mikro-orm/core';
import { registerAs } from '@nestjs/config';

import { Environment, tryGetEnv } from '@libs/common';

export type ModelsConfig = MikroOrmModuleOptions & { environment: Environment };

export const modelsConfig = registerAs<ModelsConfig>('models', () => ({
    namingStrategy: EntityCaseNamingStrategy,
    type: 'postgresql',
    clientUrl: tryGetEnv('DATABASE_URL'),
    environment: tryGetEnv('NODE_ENV') as Environment,
    driverOptions: {
        connection: { ssl: tryGetEnv('DATABASE_SSL') === 'true' },
    },
}));
