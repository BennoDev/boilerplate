import { InternalServerErrorException } from '@nestjs/common';

export class UnexpectedNull extends InternalServerErrorException {
    constructor() {
        super('Unexpected null value', 'UNEXPECTED_NULL');
    }
}
