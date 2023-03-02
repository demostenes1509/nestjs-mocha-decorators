# Nest.js Mocha Decorators


This library lets you use **test decorators** to create your test suite, with all these benefits
- You can create tests suites and tests using classes, instead of jest or mocha anonymous functions
- You can inject your components in your tests, instead of using app.get(Component to use)
- You can use inheritance
- You can pick which test or suite you want to run

Example

    ```
    @TestSuite('Demo Test Suite')
    export class DemoTest {

        @Inject() 
        private readonly httpService: HttpService

        @Test('Get Test')
        async testGet(): Promise<void> {
            const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'))
            expect(data).toBe('Hello, Test world !')
        }
    }
    ```

## Installation

Install with npm globally: ( as a development dependency because it will be use for tests only )

```
npm i --save-dev nestjs-mocha-decorators
```

## Configuration

Its better with an example.

- Add your tests entry point in **test** directory

```
import { HttpModule } from '@nestjs/axios';
import { ConsoleLogger } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { before, describe, it } from 'mocha';
import { MochaTestModule } from '../src';
import { DemoTest } from './tests/demo.test';
import { YourAppModule } from './your-app/your-app.module';

describe('Nestjs-Mocha-Decorators', function () {
  before(async function () {
    const testingModuleBuilder: TestingModuleBuilder =
      await Test.createTestingModule({
        imports: [
          YourAppModule,  // The app you want to test
          MochaTestModule.registerTests([DemoTest],[HttpModule]) // Your test suite
        ],
      })

    const testingModule: TestingModule = await testingModuleBuilder.compile();
    const app = testingModule.createNestApplication();
    app.useLogger(new ConsoleLogger());
    app.listen(4343)
  });
  it('All Tests', () => {
    // Dummy test to run all others
  });
}).timeout(0);
```

- Add this line to your package.json

```
    "test": "mocha --exit --require ts-node/register --require tsconfig-paths/register test/test.entrypoint.ts"
```

- Start coding your tests

```
import { HttpService } from "@nestjs/axios";
import { Inject } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Test, TestSuite } from "../../src";
import expect from 'expect'


@TestSuite('Demo Test Suite')
export class DemoTest {

    @Inject()
    private readonly httpService: HttpService

    @Test('Get Test')
    async testGet(): Promise<void> {
        const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'))
        expect(data).toBe('Hello, Test world !')
    }
}
```

- Run all your tests with:

```
npm run test
```

- If you want to run the tests of a single class ( **suite** ), you can:

```
SUITETORUN="Demo Test Suite" npm run test
```

- Or, perhaps you want to run a single test, with:

```
TESTTORUN="Get Test" npm run test
```

## Comments, suggestions and more

Creating a ticket on github can be very annoying ... send me your comments, problems and suggestions to mcarrizo@gmail.com

Best !
