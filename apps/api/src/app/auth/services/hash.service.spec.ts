import { HashService } from './hash.service';

describe('HashService', () => {
    const service = new HashService();

    describe('hash', () => {
        it('should correctly hash a value', async () => {
            const raw = 'astring';
            const hashed = await service.hash(raw);

            expect(typeof hashed).toBe('string');
            expect(hashed).not.toBe(raw);
        });
    });

    describe('compare', () => {
        it('should correctly compare hashed values', async () => {
            const raw = 'astring';
            const hashed = await service.hash(raw);
            const isValid = await service.compare(raw, hashed);

            expect(isValid).toBe(true);
        });
    });
});
