
import { HttpModule } from '@nestjs/axios';
import { ConsoleLogger, INestApplication } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { run } from 'mocha';
import { MochaTestModule, MochaTestService } from '../src';
import { DemoTest } from './tests/demo.test';
import { YourAppModule } from './your-app/your-app.module';

const initNest = async (): Promise<INestApplication> => {
  const testingModuleBuilder: TestingModuleBuilder = await Test.createTestingModule({
    imports: [
      YourAppModule,  // The app to test
      MochaTestModule.registerTests([DemoTest], [HttpModule]) // Your test suite
    ],
  })
  const testingModule: TestingModule = await testingModuleBuilder.compile();
  const app = testingModule.createNestApplication();
  app.useLogger(new ConsoleLogger());
  app.listen(4343)
  return app
}

(async (): Promise<void> => {
  try {
    const app = await initNest();
    app.get(MochaTestService).declareTests()
    run();
  }
  catch(error) {
    console.error(error)
  }
})();