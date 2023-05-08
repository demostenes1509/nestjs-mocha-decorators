interface ConstructorType {
  new (): void;
}

interface FunctionType {
  (): void;
}

export enum TestEventsEnum {
  BEFORE_EACH = 'beforeEach',
  AFTER_EACH = 'afterEach',
}

export const DecoratedSuites: {
  [suiteName: string]: {
    title: string;
    parallel: boolean;
    target: ConstructorType;
    tests: Array<{ method: FunctionType; description: string }>;
  };
} = {};

export const DecoratedEvents: {
  [suiteName: string]: {
    target: ConstructorType;
    events: Array<{ method: FunctionType; eventName: TestEventsEnum }>;
  };
} = {};

export const TestEventsSuite = () => {
  return (target: ConstructorType): void => {
    if (!DecoratedEvents.hasOwnProperty(target.name))
      DecoratedEvents[target.name] = { events: [], target };
    DecoratedEvents[target.name].target = target;
  };
};

export const TestSuite = (title: string, parallel = false) => {
  return (target: ConstructorType): void => {
    target.prototype.title = title;
    if (!DecoratedSuites.hasOwnProperty(target.name))
      DecoratedSuites[target.name] = { tests: [], title, parallel, target };
    DecoratedSuites[target.name].title = title;
    DecoratedSuites[target.name].parallel = parallel;
    DecoratedSuites[target.name].target = target;
  };
};

/* eslint-disable  @typescript-eslint/ban-types */
export function Test(description: string): MethodDecorator {
  return (
    target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    const className = target.constructor.name;
    if (!DecoratedSuites.hasOwnProperty(className))
      DecoratedSuites[className] = {
        tests: [],
        target: null,
        title: null,
        parallel: false,
      };
    DecoratedSuites[className].tests.push({
      description,
      method: descriptor.value,
    });
  };
}

export function TestEvent(eventName: TestEventsEnum): MethodDecorator {
  return (
    target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): void => {
    const className = target.constructor.name;
    if (!DecoratedEvents.hasOwnProperty(className))
      DecoratedEvents[className] = {
        events: [],
        target: null,
      };
    DecoratedEvents[className].events.push({
      eventName,
      method: descriptor.value,
    });
  };
}

/* eslint-enable  @typescript-eslint/ban-types */
