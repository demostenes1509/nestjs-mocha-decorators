import { HttpService } from "@nestjs/axios";
import { Inject, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Test, TestSuite } from "../../src";
import { expect } from 'expect'
import { Events } from "../events";


@TestSuite('Demo Test Suite')
export class DemoTest {

    private readonly logger = new Logger(DemoTest.name)

    @Inject()
    private readonly httpService!: HttpService

    @Inject()
    private readonly events!: Events

    @Test('Get Test')
    async testGet(): Promise<void> {
        this.logger.debug('In Demo Test')
        const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'))
        expect(data).toBe('Hello, Test world !')
    }

    @Test('Runs the events around each test')
    async testEvents(): Promise<void> {
        expect(this.events.beforeEachCalls).toBe(this.events.afterEachCalls + 1)
    }

}
