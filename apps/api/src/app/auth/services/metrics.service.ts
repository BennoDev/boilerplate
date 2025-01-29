import { Inject, Injectable } from '@nestjs/common';
import { Counter, Meter } from '@opentelemetry/api';

import { meterInjectionToken } from '../auth.constants';

@Injectable()
export class MetricsService {
    private readonly counter: Counter;

    constructor(@Inject(meterInjectionToken) private readonly meter: Meter) {
        this.counter = this.meter.createCounter('number_of_logins');
    }

    incrementLoggedInCounter(): void {
        console.info('INCREMENTING COUNTER');
        this.counter.add(1);
    }
}
