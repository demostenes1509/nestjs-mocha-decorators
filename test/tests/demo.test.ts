import { HttpService } from "@nestjs/axios";
import { Inject, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { Test, TestSuite } from "../../src";
import expect from 'expect'


@TestSuite('Demo Test Suite')
export class DemoTest {

    private readonly logger = new Logger(DemoTest.name)

    @Inject()
    private readonly httpService: HttpService

    @Test('Get Test')
    async testGet(): Promise<void> {
        this.logger.debug('In Demo Test')
        const { data } = await firstValueFrom(this.httpService.get('http://localhost:4343/demo'))
        expect(data).toBe('Hello, Test world !')
    }

}