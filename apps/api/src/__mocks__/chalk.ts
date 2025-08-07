// Mock chalk for Jest tests
const chalk = {
  red: {
    bold: (text: string) => text,
  },
  yellow: {
    bold: (text: string) => text,
  },
  green: {
    bold: (text: string) => text,
  },
  blue: {
    bold: (text: string) => text,
  },
  white: (text: string) => text,
  cyan: (text: string) => text,
  gray: (text: string) => text,
  magenta: (text: string) => text,
};

export default chalk;
