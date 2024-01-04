import { Module } from '@nestjs/common';

import { DatabaseModule } from '@libs/database';
import { User } from '@libs/models';

@Module({
    imports: [DatabaseModule.register([User])],
    providers: [],
    exports: [DatabaseModule],
})
export class CommonModule {}
