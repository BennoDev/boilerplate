import { Inject, Injectable } from '@nestjs/common';
import { api } from '@opentelemetry/sdk-node';

import { Logger } from '@libs/logger';

import { meterInjectionToken } from '../auth.constants';

@Injectable()
export class MetricsService {
    private readonly counter: api.Counter;

    constructor(
        @Inject(meterInjectionToken) private readonly meter: api.Meter,
        private readonly logger: Logger,
    ) {
        this.counter = this.meter.createCounter('number_of_logins', {
            valueType: api.ValueType.INT,
            description: 'Number of times users have logged in',
        });
    }

    incrementLoginCounter(): void {
        this.logger.info('Incrementing login counter');
        this.counter.add(1, { context: 'auth' });
    }
}
