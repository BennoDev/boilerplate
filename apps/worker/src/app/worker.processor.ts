import { UUID } from 'node:crypto';

import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { SpanKind, trace } from '@opentelemetry/api';
import { Job } from 'bullmq';

import { Logger } from '@libs/logger';
import { UserRepository } from '@libs/models';

const tracer = trace.getTracer(process.env['SERVICE_NAME']!);

@Processor('worker')
export class WorkerProcessor extends WorkerHost {
    constructor(
        // Used for CreateRequestContext()
        private readonly orm: MikroORM,
        private readonly logger: Logger,
        private readonly userRepository: UserRepository,
    ) {
        logger.setContext(WorkerProcessor.name);
        super();

        this.logger.info('WorkerProcessor initialized');
    }

    @CreateRequestContext()
    async process(job: Job<{ userId: UUID }>): Promise<void> {
        this.logger.info('Verifying user exists', { data: job.data });

        const user = await this.userRepository.findOneOrFail(job.data.userId);

        return tracer.startActiveSpan(
            'tps call',
            { attributes: { userId: user.id }, kind: SpanKind.CLIENT },
            async span => {
                const url = new URL('http://localhost:3002/api');
                url.searchParams.append('email', user.email);

                const result = await fetch(url);
                this.logger.info('Result', {
                    status: result.status,
                    data: await result.json(),
                });

                span.end();
            },
        );
    }
}
