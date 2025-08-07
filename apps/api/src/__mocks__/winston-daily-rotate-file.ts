// Mock winston-daily-rotate-file for Jest tests
const DailyRotateFile = jest.fn().mockImplementation(() => ({}));

export default DailyRotateFile;
