import { Module } from '@nestjs/common';
import { DemoModule } from './modules/demo.module';

@Module({
  imports: [
    DemoModule,
  ],
})
export class YourAppModule { }
