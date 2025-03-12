import { Inject, Injectable } from '@nestjs/common';
import { api } from '@opentelemetry/sdk-node';

import { meterInjectionToken } from '../auth.constants';

@Injectable()
export class MetricsService {
    private readonly counter: api.Counter;

    constructor(
        @Inject(meterInjectionToken) private readonly meter: api.Meter,
    ) {
        this.counter = this.meter.createCounter('number_of_logins');
    }

    incrementLoggedInCounter(): void {
        console.info('INCREMENTING COUNTER');
        this.counter.add(1);
    }
}
