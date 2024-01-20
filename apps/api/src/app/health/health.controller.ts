import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import {
    HealthCheckService,
    MikroOrmHealthIndicator,
    type HealthCheckResult,
    type HealthIndicatorResult,
} from '@nestjs/terminus';

@ApiExcludeController()
@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: MikroOrmHealthIndicator,
    ) {}

    @Get()
    check(): Promise<HealthCheckResult> {
        return this.health.check([
            (): Promise<HealthIndicatorResult> => this.db.pingCheck('db'),
        ]);
    }
}
