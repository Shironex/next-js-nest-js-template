import chalk from 'chalk';
import * as winston from 'winston';
import { format } from 'winston';

const { combine, timestamp, printf, errors } = format;

const levelColors = {
  error: chalk.red.bold,
  warn: chalk.yellow.bold,
  info: chalk.green.bold,
  debug: chalk.blue.bold,
};

const contextColor = chalk.cyan;
const timestampColor = chalk.gray;
const metaColor = chalk.magenta;

export const consoleFormatter: winston.Logform.Format = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  printf(({ level, message, timestamp, stack, context, ...meta }) => {
    const levelColor =
      levelColors[level as keyof typeof levelColors] || chalk.white;
    const levelFormatted = levelColor(`[${level.toUpperCase()}]`);
    const timestampFormatted = timestampColor(`[${String(timestamp)}]`);
    const contextFormatted = context
      ? contextColor(
          `[${typeof context === 'string' ? context : JSON.stringify(context)}]`,
        )
      : '';

    let logLine = `${timestampFormatted} ${levelFormatted} ${contextFormatted} ${String(message)}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      const metaString = JSON.stringify(meta, null, 2);
      logLine += `\n${metaColor('Meta:')} ${metaString}`;
    }

    // Add stack trace for errors
    if (stack) {
      const stackString =
        typeof stack === 'string' ? stack : JSON.stringify(stack);
      logLine += `\n${chalk.red('Stack Trace:')}\n${stackString}`;
    }

    return logLine;
  }),
);
