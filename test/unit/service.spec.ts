import { ModuleRef } from '@nestjs/core';
import { expect } from 'expect';
import { MochaTestService, TestEvent, TestEventsEnum, TestSuite } from '../../src';

describe('MochaTestService', () => {
  const moduleRef = {} as ModuleRef;

  it('rejects a registered class without test decorators', () => {
    class Plain {}

    const service = new MochaTestService(moduleRef, [Plain]);

    expect(() => service.declareTests()).toThrow(
      'Plain must be decorated with @TestSuite or @TestEventsSuite',
    );
  });

  it('rejects events in a class that is not an events suite', () => {
    @TestSuite('Suite with events')
    class SuiteWithEvents {
      @TestEvent(TestEventsEnum.BEFORE_EACH)
      before(): void {
        return;
      }
    }

    const service = new MochaTestService(moduleRef, [SuiteWithEvents]);

    expect(() => service.declareTests()).toThrow(
      'SuiteWithEvents uses @TestEvent, so it must be decorated with @TestEventsSuite',
    );
  });
});
