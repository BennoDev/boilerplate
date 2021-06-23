import { Module } from '@nestjs/common';

import { ModelsModule } from '@libs/models';

@Module({
    imports: [ModelsModule.register()],
    providers: [],
    exports: [ModelsModule],
})
export class CommonModule {}
