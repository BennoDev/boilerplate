import { InternalServerErrorException } from '@nestjs/common';

export class NoContextFound extends InternalServerErrorException {
    constructor() {
        super(
            'NO_CONTEXT_FOUND',
            'There was no active store in AsyncLocalStorage',
        );
    }
}
