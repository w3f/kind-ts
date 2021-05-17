import { Logger } from '@w3f/logger';

export class LoggerMock implements Logger {
    warn(msg: string): void {
      console.log(msg);
    }
    verbose(msg: string): void {
      console.log(msg);
    }
    log(level: string, msg: string): void {
      console.log(msg);
    }
    info(msg: string): void {
        console.log(msg);
    }
    debug(msg: string): void {
        console.log(msg);
    }
    error(msg: string): void {
        console.log(msg);
    }
}
