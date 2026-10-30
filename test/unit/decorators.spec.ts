import { expect } from 'expect';
import { Test, TestEvent, TestEventsEnum, TestEventsSuite, TestSuite } from '../../src';
import {
  getEvents,
  getSuiteTitle,
  getTests,
  isEventsSuite,
} from '../../src/mochaTest.decorators';

describe('decorators', () => {
  it('stores the suite title and its tests', () => {
    @TestSuite('A suite')
    class Suite {
      @Test('first')
      first(): void {
        return;
      }

      @Test('second')
      second(): void {
        return;
      }
    }

    expect(getSuiteTitle(Suite)).toBe('A suite');
    expect(getTests(Suite).map((test) => test.description)).toEqual(['first', 'second']);
  });

  it('inherits tests from a base class, base class first', () => {
    class Base {
      @Test('from base')
      fromBase(): void {
        return;
      }
    }

    class Child extends Base {
      @Test('from child')
      fromChild(): void {
        return;
      }
    }

    expect(getTests(Child).map((test) => test.description)).toEqual(['from base', 'from child']);
    expect(getTests(Base).map((test) => test.description)).toEqual(['from base']);
  });

  it('lets a subclass redeclare a test', () => {
    class Base {
      @Test('old description')
      shared(): void {
        return;
      }
    }

    class Child extends Base {
      @Test('new description')
      override shared(): void {
        return;
      }
    }

    expect(getTests(Child).map((test) => test.description)).toEqual(['new description']);
  });

  it('does not make a subclass a suite unless it is decorated', () => {
    @TestSuite('Parent')
    class Parent {}

    class Child extends Parent {}

    expect(getSuiteTitle(Child)).toBeUndefined();
  });

  it('stores the events', () => {
    @TestEventsSuite()
    class Events {
      @TestEvent(TestEventsEnum.BEFORE_EACH)
      before(): void {
        return;
      }

      @TestEvent(TestEventsEnum.AFTER_EACH)
      after(): void {
        return;
      }
    }

    expect(isEventsSuite(Events)).toBe(true);
    expect(getEvents(Events).map((event) => event.eventName)).toEqual([
      TestEventsEnum.BEFORE_EACH,
      TestEventsEnum.AFTER_EACH,
    ]);
  });
});
