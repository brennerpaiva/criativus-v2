import '@testing-library/jest-dom';

global.console = {
  ...console,
  log: jest.fn(), // mock console.log
};
