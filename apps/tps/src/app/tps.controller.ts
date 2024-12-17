import { Controller, Get, Logger, Query } from '@nestjs/common';

@Controller()
export class TpsController {
    @Get('/')
    getData(@Query('email') email: string): boolean {
        Logger.log(`Hello ${email}`);
        return true;
    }
}
