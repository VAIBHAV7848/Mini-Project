export interface LogContext {
  service?: string;
  requestId?: string;
  event?: string;
  [key: string]: unknown;
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message,
        ...context,
      })
    );
  },
  warn(message: string, context?: LogContext) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        message,
        ...context,
      })
    );
  },
  error(message: string, context?: LogContext) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message,
        ...context,
      })
    );
  },
};
