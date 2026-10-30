# Nest.js Mocha Decorators

Write your [Nest.js](https://nestjs.com) tests as classes with decorators, and let [Mocha](https://mochajs.org) run them.

```ts
@TestSuite('Demo Test Suite')
export class DemoTest {
  @Inject()
  private readonly httpService!: HttpService;

  @Test('Get Test')
  async testGet(): Promise<void> {
    const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'));
    expect(data).toBe('Hello, Test world !');
  }
}
```

## Why

- **Classes instead of anonymous functions:** suites and tests are plain classes and methods.
- **Dependency injection:** test classes are Nest providers, so you use `@Inject()` instead of `app.get(Component)`.
- **Inheritance:** share tests through base classes and override them in subclasses.
- **Selective runs:** pick a single suite or test with an environment variable.

## Requirements

| Dependency | Version                    |
| ---------- | -------------------------- |
| Nest.js    | 12                         |
| Mocha      | 12                         |
| Node.js    | `^20.19.0` or `>=22.12.0`  |
| TypeScript | Up to 6.0 to use `ts-node` |

Nest.js 12 packages are ESM only. They load from CommonJS through `require(esm)`, which is why these Node.js versions are needed. TypeScript 7 does not work with `ts-node`, so the setup below uses TypeScript 6.0.

## Installation

Install it as a development dependency, because it is only used for tests:

```bash
npm i --save-dev nestjs-mocha-decorators mocha ts-node typescript@~6.0.0 @nestjs/testing @types/mocha @types/node
```

Your `tsconfig.json` needs these options:

```json
{
  "compilerOptions": {
    "module": "node20",
    "types": ["node", "mocha"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Quick start

**1. Create the tests entry point** in `test/test.entrypoint.ts`. It boots your app, declares the tests and starts Mocha:

```ts
import { HttpModule } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { run } from 'mocha';
import { MochaTestModule, MochaTestService } from 'nestjs-mocha-decorators';
import { DemoTest } from './tests/demo.test';
import { YourAppModule } from './your-app/your-app.module';

async function bootstrap(): Promise<void> {
  try {
    const testingModule = await Test.createTestingModule({
      imports: [
        YourAppModule, // The app to test
        MochaTestModule.registerTests([DemoTest], [HttpModule]), // Your tests, and the modules they need
      ],
    }).compile();

    const app = testingModule.createNestApplication();
    await app.listen(4343);

    app.get(MochaTestService).declareTests();
    run();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
```

`Test` here is the class from `@nestjs/testing`, while the `@Test` decorator comes from this library. If you need both in the same file, import one with an alias.

**2. Add the test script** to your `package.json`:

```json
{
  "scripts": {
    "test": "mocha --delay --exit --require ts-node/register test/test.entrypoint.ts"
  }
}
```

`--delay` makes Mocha wait until `run()` is called, once Nest.js has started.

**3. Write your tests:**

```ts
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { expect } from 'expect';
import { firstValueFrom } from 'rxjs';
import { Test, TestSuite } from 'nestjs-mocha-decorators';

@TestSuite('Demo Test Suite')
export class DemoTest {
  @Inject()
  private readonly httpService!: HttpService;

  @Test('Get Test')
  async testGet(): Promise<void> {
    const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'));
    expect(data).toBe('Hello, Test world !');
  }
}
```

**4. Run them:**

```bash
npm test
```

## Usage

### Running a single suite or test

Names must match exactly:

```bash
SUITETORUN="Demo Test Suite" npm test
TESTTORUN="Get Test" npm test
```

### Running code before and after each test

Create a class with `@TestEventsSuite()` and register it like any other test class. These hooks run around every test of every suite:

```ts
import { TestEvent, TestEventsEnum, TestEventsSuite } from 'nestjs-mocha-decorators';

@TestEventsSuite()
export class Events {
  @TestEvent(TestEventsEnum.BEFORE_EACH)
  async beforeEach(): Promise<void> {
    // Runs before each test
  }

  @TestEvent(TestEventsEnum.AFTER_EACH)
  async afterEach(): Promise<void> {
    // Runs after each test
  }
}
```

```ts
MochaTestModule.registerTests([DemoTest, Events], [HttpModule]);
```

### Sharing tests with inheritance

Tests declared in a base class run in each subclass decorated with `@TestSuite`. A subclass can override a test method, and the override is what runs:

```ts
abstract class CrudTest {
  @Test('Lists items')
  async list(): Promise<void> {
    // ...
  }
}

@TestSuite('Users')
export class UsersTest extends CrudTest {}

@TestSuite('Orders')
export class OrdersTest extends CrudTest {}
```

## API

| Export                                    | Description                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| `@TestSuite(title)`                       | Marks a class as a Mocha `describe`.                                              |
| `@Test(description)`                      | Marks a method as a Mocha `it`.                                                   |
| `@TestEventsSuite()`                      | Marks a class as a holder of hooks.                                               |
| `@TestEvent(eventName)`                   | Marks a method as a hook. Use `TestEventsEnum.BEFORE_EACH` or `AFTER_EACH`.       |
| `MochaTestModule.registerTests(tests, imports?)` | Registers the test classes as providers, with the modules they depend on.  |
| `MochaTestService.declareTests()`         | Declares the registered tests in Mocha. Call it before `run()`.                   |

Mocha timeouts are disabled for tests and hooks.

## Migrating from 1.x

- Upgrade to Nest.js 12, Mocha 12 and a supported Node.js version. They are now peer dependencies.
- Only the classes passed to `registerTests` run. Before, every decorated class that was imported ran too.
- A class passed to `registerTests` without a test decorator now throws an error, as does `@TestEvent` in a class without `@TestEventsSuite`.
- The unused `parallel` argument of `@TestSuite` was removed.
- `DecoratedSuites` and `DecoratedEvents` are no longer exported.

## Contact

Send your comments, problems and suggestions to mcarrizo@gmail.com, or [open an issue](https://github.com/demostenes1509/nestjs-mocha-decorators/issues).
