
import { HttpModule } from '@nestjs/axios';
import { ConsoleLogger } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { before, describe, it } from 'mocha';
import { MochaTestModule } from '../src';
import { DemoTest } from './tests/demo.test';
import { YourAppModule } from './your-app/your-app.module';

describe('Nestjs-Mocha-Decorators', function () {
  before(async function () {
    const testingModuleBuilder: TestingModuleBuilder =
      await Test.createTestingModule({
        imports: [
          YourAppModule,  // The app to test
          MochaTestModule.registerTests([DemoTest],[HttpModule]) // Your test suite
        ],
      })

    const testingModule: TestingModule = await testingModuleBuilder.compile();
    const app = testingModule.createNestApplication();
    app.useLogger(new ConsoleLogger());
    app.listen(4343)
  });
  it('All Tests', () => {
    // Dummy test to run all others
  });
}).timeout(0);
