import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CommonModule } from '../common';

import { HealthController } from './health.controller';

@Module({
    imports: [
        TerminusModule.forRoot({
            logger: false,
        }),
        CommonModule,
    ],
    controllers: [HealthController],
})
export class HealthModule {}
