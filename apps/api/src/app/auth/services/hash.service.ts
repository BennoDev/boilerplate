import * as crypto from 'node:crypto';

import { Injectable } from '@nestjs/common';

const keyLength = 64;

@Injectable()
export class HashService {
    async hash(text: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const salt = crypto.randomBytes(16).toString('hex');

            crypto.scrypt(text, salt, keyLength, (err, key) => {
                if (err) reject(err);

                resolve(`${salt}:${key.toString('hex')}`);
            });
        });
    }

    compare(text: string, hash: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const [salt, existingKey] = hash.split(':');

            crypto.scrypt(text, salt, keyLength, (err, key) => {
                if (err) reject(err);

                resolve(existingKey === key.toString('hex'));
            });
        });
    }
}
