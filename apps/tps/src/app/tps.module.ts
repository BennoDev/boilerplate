import { Module } from '@nestjs/common';

import { TpsController } from './tps.controller';

@Module({
    controllers: [TpsController],
})
export class TpsModule {}
