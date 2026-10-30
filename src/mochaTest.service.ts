import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { describe, it, beforeEach, afterEach } from 'mocha';
import {
  getEvents,
  getSuiteTitle,
  getTests,
  isEventsSuite,
  TestClass,
  TestEventsEnum,
} from './mochaTest.decorators';

export const MOCHA_TEST_CLASSES = Symbol('MOCHA_TEST_CLASSES');

type DecoratedInstance = Record<string | symbol, () => void | Promise<void>>;

@Injectable()
export class MochaTestService {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(MOCHA_TEST_CLASSES) private readonly testClasses: TestClass[],
  ) {}

  declareTests(): void {
    const { SUITETORUN, TESTTORUN } = process.env;

    const isSelectedToRun = (
      actualName: string,
      selectedName?: string,
    ): boolean => {
      return !selectedName || selectedName === actualName;
    };

    for (const testClass of this.testClasses) {
      this.assertDecorated(testClass);
    }

    for (const testClass of this.testClasses.filter(isEventsSuite)) {
      for (const { eventName, propertyKey } of getEvents(testClass)) {
        const registerHook =
          eventName === TestEventsEnum.BEFORE_EACH ? beforeEach : afterEach;
        const callMethod = this.bindMethod(testClass, propertyKey);
        registerHook(async function () {
          this.timeout(0);
          await callMethod();
        });
      }
    }

    // Register all decorated tests and uses mocha on 'describe' them
    // We need to register nest.js component, thats why we use moduleRef.get
    for (const testClass of this.testClasses) {
      const title = getSuiteTitle(testClass);
      if (title !== undefined && isSelectedToRun(title, SUITETORUN)) {
        describe(title, () => {
          for (const { description, propertyKey } of getTests(testClass)) {
            if (isSelectedToRun(description, TESTTORUN)) {
              it(description, this.bindMethod(testClass, propertyKey)).timeout(
                0,
              );
            }
          }
        }).timeout(0);
      }
    }
  }

  private assertDecorated(testClass: TestClass): void {
    const isSuite = getSuiteTitle(testClass) !== undefined;
    if (!isSuite && !isEventsSuite(testClass)) {
      throw new Error(
        `${testClass.name} must be decorated with @TestSuite or @TestEventsSuite`,
      );
    }
    if (getEvents(testClass).length > 0 && !isEventsSuite(testClass)) {
      throw new Error(
        `${testClass.name} uses @TestEvent, so it must be decorated with @TestEventsSuite`,
      );
    }
  }

  // The method is looked up by name so overrides in subclasses are honored
  private bindMethod(
    testClass: TestClass,
    propertyKey: string | symbol,
  ): () => Promise<void> {
    return async (): Promise<void> => {
      const instance = this.moduleRef.get(testClass) as DecoratedInstance;
      await instance[propertyKey]();
    };
  }
}
