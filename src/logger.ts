interface Logger {
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    log(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}

const noopLogger: Logger = {
    error: () => {},
    warn: () => {},
    log: () => {},
    debug: () => {},
};

const consoleLogger: Logger = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    debug: console.debug,
};

declare const __DEV__: boolean;

let loggerInstance: Logger = typeof __DEV__ !== "undefined" && __DEV__ ? consoleLogger : noopLogger;

export const setLogger = (newLogger: Logger) => {
    loggerInstance = newLogger;
};

export const logger = {
    get error() {
        return loggerInstance.error;
    },
    get warn() {
        return loggerInstance.warn;
    },
    get log() {
        return loggerInstance.log;
    },
    get debug() {
        return loggerInstance.debug;
    },
};

export { noopLogger, consoleLogger };
export type { Logger };
