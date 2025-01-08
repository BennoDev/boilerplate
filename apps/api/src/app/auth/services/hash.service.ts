import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

import { Trace } from '@libs/logger';

const saltRounds = 10;

@Injectable()
export class HashService {
    hash(text: string): Promise<string> {
        return hash(text, saltRounds);
    }

    @Trace()
    compare(text: string, hashed: string): Promise<boolean> {
        return compare(text, hashed);
    }
}
