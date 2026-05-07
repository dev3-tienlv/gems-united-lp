type LoggerArgs = unknown[];

const isDev = process.env.NODE_ENV !== "production";

const noop: (...args: LoggerArgs) => void = () => {};

export const logger = {
  log: isDev ? (...args: LoggerArgs) => console.log(...args) : noop,
  debug: isDev ? (...args: LoggerArgs) => console.debug(...args) : noop,
  info: isDev ? (...args: LoggerArgs) => console.info(...args) : noop,
  warn: isDev ? (...args: LoggerArgs) => console.warn(...args) : noop,
  error: isDev ? (...args: LoggerArgs) => console.error(...args) : noop,
  trace: isDev ? (...args: LoggerArgs) => console.trace(...args) : noop,
};
