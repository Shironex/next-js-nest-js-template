import { registerAs } from '@nestjs/config';

export interface LoggerConfig {
  level: string;
  fileEnabled: boolean;
  filePath: string;
  maxSize: string;
  maxFiles: string;
  datePattern: string;
  consoleEnabled: boolean;
}

export default registerAs(
  'logger',
  (): LoggerConfig => ({
    level: process.env.LOG_LEVEL || 'info',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
    consoleEnabled: process.env.LOG_CONSOLE_ENABLED !== 'false',
  }),
);
