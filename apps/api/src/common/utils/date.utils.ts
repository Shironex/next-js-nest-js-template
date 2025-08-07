export type TimeUnit = 's' | 'm' | 'h' | 'd' | 'w';

export class TimeSpan {
  private milliseconds: number;

  constructor(value: number, unit: TimeUnit) {
    switch (unit) {
      case 's':
        this.milliseconds = value * 1000;
        break;
      case 'm':
        this.milliseconds = value * 60 * 1000;
        break;
      case 'h':
        this.milliseconds = value * 60 * 60 * 1000;
        break;
      case 'd':
        this.milliseconds = value * 24 * 60 * 60 * 1000;
        break;
      case 'w':
        this.milliseconds = value * 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        this.milliseconds = 0;
        break;
    }
  }

  toMilliseconds(): number {
    return this.milliseconds;
  }

  toSeconds(): number {
    return Math.floor(this.milliseconds / 1000);
  }

  toMinutes(): number {
    return Math.floor(this.milliseconds / (60 * 1000));
  }

  toHours(): number {
    return Math.floor(this.milliseconds / (60 * 60 * 1000));
  }

  toDays(): number {
    return Math.floor(this.milliseconds / (24 * 60 * 60 * 1000));
  }
}

export function createDate(timeSpan: TimeSpan): Date {
  const now = new Date();
  return new Date(now.getTime() + timeSpan.toMilliseconds());
}

export function isWithinExpirationDate(expiresAt: Date): boolean {
  const now = new Date();
  return now < expiresAt;
}
