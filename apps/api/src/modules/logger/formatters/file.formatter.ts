import { format } from 'winston';
import type winston from 'winston';

const { combine, timestamp, json, errors } = format;

export const fileFormatter: winston.Logform.Format = combine(
  errors({ stack: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  json({
    replacer: (key, value) => {
      // Handle circular references and non-serializable objects
      if (typeof value === 'object' && value !== null) {
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
      }
      return value;
    },
  }),
);
