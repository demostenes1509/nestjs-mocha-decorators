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