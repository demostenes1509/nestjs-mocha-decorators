import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { DecoratedEvents, DecoratedSuites, TestEventsEnum } from './mochaTest.decorators';

const TESTTORUN = process.env.TESTTORUN
const SUITETORUN = process.env.SUITETORUN

@Injectable()
export class MochaTestService {
  constructor(private moduleRef: ModuleRef) { }

  declareTests(): void {

    const isSelectedToRun = (actualName: string, selectedName: string): boolean => {
      return !selectedName || selectedName === actualName;
    };

    for (const appEventClass of Object.keys(DecoratedEvents)) {
      const testEvent = DecoratedEvents[appEventClass];
      for (const testMethod of testEvent.events) {
        if(testMethod.eventName===TestEventsEnum.BEFORE_EACH) {
          beforeEach(async () => {
            const c = this.moduleRef.get(testEvent.target);
            await testMethod.method.apply(c);
          });
        }
        if(testMethod.eventName===TestEventsEnum.AFTER_EACH) {
          afterEach(async () => {
            const c = this.moduleRef.get(testEvent.target);
            await testMethod.method.apply(c);
          });
        }
      }
    }

    // Register all decorated tests and uses mocha on 'describe' them
    // We need to register nest.js component, thats why we use app.get
    for (const appTestClass of Object.keys(DecoratedSuites)) {
      const testSuite = DecoratedSuites[appTestClass];
      if (isSelectedToRun(testSuite.title, SUITETORUN)) {
        describe(testSuite.title, () => {
          for (const testMethod of testSuite.tests) {
            if (isSelectedToRun(testMethod.description, TESTTORUN)) {
              it(testMethod.description, async () => {
                const c = this.moduleRef.get(testSuite.target);
                await testMethod.method.apply(c);
              }).timeout(0);
            }
          }
        }).timeout(0);
      }
    }
  }
}
