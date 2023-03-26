import { Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';

const saltRounds = 10;

@Injectable()
export class HashService {
    hash(text: string): Promise<string> {
        return hash(text, saltRounds);
    }

    compare(text: string, hashed: string): Promise<boolean> {
        return compare(text, hashed);
    }
}
