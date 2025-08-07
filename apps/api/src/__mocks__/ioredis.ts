export class Redis {
  on = jest.fn();
  connect = jest.fn();
  disconnect = jest.fn();
  pipeline = jest.fn(() => ({
    zremrangebyscore: jest.fn().mockReturnThis(),
    zcard: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  }));

  constructor() {
    // Mock constructor
  }
}

export default Redis;
