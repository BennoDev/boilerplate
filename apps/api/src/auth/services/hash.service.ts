import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashService {
    hash(text: string): Promise<string> {
        return bcrypt.hash(text, saltRounds);
    }

    compare(text: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(text, hashed);
    }
}
