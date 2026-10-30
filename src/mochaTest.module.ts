import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { TestClass } from './mochaTest.decorators';
import { MOCHA_TEST_CLASSES, MochaTestService } from './mochaTest.service';

@Module({})
export class MochaTestModule {
  static registerTests(
    testsToRegister: TestClass[],
    imports: ModuleMetadata['imports'] = [],
  ): DynamicModule {
    return {
      module: MochaTestModule,
      imports,
      providers: [
        MochaTestService,
        { provide: MOCHA_TEST_CLASSES, useValue: testsToRegister },
        ...testsToRegister,
      ],
      exports: [MochaTestService],
    };
  }
}
