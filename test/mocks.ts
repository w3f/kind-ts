export class LoggerMock {
    info(msg: string): void {
        console.log(msg);
    }
    debug(msg: string): void {
        console.log(msg)
    }
    error(msg: string): void {
        console.log(msg)
    }
}
