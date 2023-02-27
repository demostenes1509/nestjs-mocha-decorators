import { Controller, Get } from '@nestjs/common';

@Controller('demo')
export class DemoController {

  @Get()
  async get(): Promise<string> {
    return "Hello, Test world !"
  }

}
