export type TestClass = new (...args: never[]) => object;

export enum TestEventsEnum {
  BEFORE_EACH = 'beforeEach',
  AFTER_EACH = 'afterEach',
}

interface DecoratedMethod {
  propertyKey: string | symbol;
}

export interface TestDefinition extends DecoratedMethod {
  description: string;
}

export interface EventDefinition extends DecoratedMethod {
  eventName: TestEventsEnum;
}

// Keyed by class instead of by class name, so two classes can share a name
const suiteTitles = new WeakMap<object, string>();
const eventSuites = new WeakSet<object>();
const decoratedTests = new WeakMap<object, TestDefinition[]>();
const decoratedEvents = new WeakMap<object, EventDefinition[]>();

const addMethod = <T>(
  registry: WeakMap<object, T[]>,
  target: object,
  method: T,
): void => {
  registry.set(target, [...(registry.get(target) ?? []), method]);
};

// Walks from the base class down, so a subclass replaces what it redeclares
const collectMethods = <T extends DecoratedMethod>(
  registry: WeakMap<object, T[]>,
  target: object,
): T[] => {
  const hierarchy: object[] = [];
  for (
    let current = target;
    current && current !== Function.prototype;
    current = Object.getPrototypeOf(current)
  ) {
    hierarchy.unshift(current);
  }

  const methods = new Map<string | symbol, T>();
  for (const current of hierarchy) {
    for (const method of registry.get(current) ?? []) {
      methods.set(method.propertyKey, method);
    }
  }
  return [...methods.values()];
};

export const getSuiteTitle = (target: TestClass): string | undefined =>
  suiteTitles.get(target);

export const isEventsSuite = (target: TestClass): boolean =>
  eventSuites.has(target);

export const getTests = (target: TestClass): TestDefinition[] =>
  collectMethods(decoratedTests, target);

export const getEvents = (target: TestClass): EventDefinition[] =>
  collectMethods(decoratedEvents, target);

export const TestEventsSuite = () => {
  return (target: TestClass): void => {
    eventSuites.add(target);
  };
};

export const TestSuite = (title: string) => {
  return (target: TestClass): void => {
    suiteTitles.set(target, title);
  };
};

export function Test(description: string): MethodDecorator {
  return (target, propertyKey): void => {
    addMethod(decoratedTests, target.constructor, { description, propertyKey });
  };
}

export function TestEvent(eventName: TestEventsEnum): MethodDecorator {
  return (target, propertyKey): void => {
    addMethod(decoratedEvents, target.constructor, { eventName, propertyKey });
  };
}
