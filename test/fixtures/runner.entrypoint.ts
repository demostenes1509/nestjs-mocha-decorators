import { Inject, Injectable, Module } from '@nestjs/common';
import { Test as NestTest } from '@nestjs/testing';
import { run } from 'mocha';
import { MochaTestModule, MochaTestService, Test, TestSuite } from '../../src';

@Injectable()
class Greeter {
  greet(): string {
    return 'hello';
  }
}

@Module({ providers: [Greeter], exports: [Greeter] })
class GreeterModule {}

abstract class BaseSuite {
  @Inject()
  protected readonly greeter!: Greeter;

  @Test('inherited')
  async inherited(): Promise<void> {
    if (this.greeter.greet() !== 'hello') throw new Error('not injected');
  }

  @Test('overridden')
  async overridden(): Promise<void> {
    throw new Error('the base implementation must not run');
  }
}

@TestSuite('Child')
class ChildSuite extends BaseSuite {
  override async overridden(): Promise<void> {
    return;
  }

  @Test('own')
  async own(): Promise<void> {
    return;
  }
}

@TestSuite('Other')
class OtherSuite {
  @Test('passes')
  passes(): void {
    return;
  }

  @Test('fails')
  async fails(): Promise<void> {
    throw new Error('expected failure');
  }
}

// Same class name as the suite below: each one must keep its own tests
const FirstHomonym = ((): typeof ChildSuite => {
  @TestSuite('First homonym')
  class Homonym extends ChildSuite {}
  return Homonym;
})();

const SecondHomonym = ((): new () => object => {
  @TestSuite('Second homonym')
  class Homonym {
    @Test('second only')
    secondOnly(): void {
      return;
    }
  }
  return Homonym;
})();

@TestSuite('Not registered')
export class NotRegisteredSuite {
  @Test('must not run')
  mustNotRun(): void {
    throw new Error('this suite was not passed to registerTests');
  }
}

async function bootstrap(): Promise<void> {
  const testingModule = await NestTest.createTestingModule({
    imports: [
      MochaTestModule.registerTests(
        [ChildSuite, OtherSuite, FirstHomonym, SecondHomonym],
        [GreeterModule],
      ),
    ],
  }).compile();
  testingModule.get(MochaTestService).declareTests();
  run();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
