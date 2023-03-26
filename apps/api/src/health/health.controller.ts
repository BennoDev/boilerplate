import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    HealthCheckService,
    MikroOrmHealthIndicator,
    type HealthCheckResult,
    type HealthIndicatorResult,
} from '@nestjs/terminus';

@ApiTags('Health')
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
