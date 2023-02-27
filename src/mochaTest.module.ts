import { DynamicModule, Module } from '@nestjs/common';
import { MochaTestService } from './mochaTest.service';

@Module({})
export class MochaTestModule {
  static registerTests(testsToRegister,imports=[]): DynamicModule {
    return {
      module: MochaTestModule,
      imports,
      providers: [MochaTestService, ...testsToRegister],
      exports: [MochaTestService],
    };
  }
}
