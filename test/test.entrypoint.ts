
import { HttpModule } from '@nestjs/axios';
import { ConsoleLogger, INestApplication } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { MochaTestService } from 'src/mochaTest.service';
import { MochaTestModule } from '../src';
import { DemoTest } from './tests/demo.test';
import { YourAppModule } from './your-app/your-app.module';
import { run } from 'mocha';

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
  const app = await initNest();
  app.get(MochaTestService).declareTests()
  run();
})();