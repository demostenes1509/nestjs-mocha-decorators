import { Logger } from "@nestjs/common";
import { TestEvent, TestEventsEnum, TestEventsSuite } from "../src";

@TestEventsSuite()
export class Events {

    private readonly logger = new Logger(Events.name)

    beforeEachCalls = 0

    afterEachCalls = 0

    @TestEvent(TestEventsEnum.BEFORE_EACH)
    async beforeEach():Promise<void> {
        this.beforeEachCalls++
        this.logger.verbose('Before Each')
    }

    @TestEvent(TestEventsEnum.AFTER_EACH)
    async afterEach():Promise<void> {
        this.afterEachCalls++
        this.logger.verbose('After Each')
    }
}
