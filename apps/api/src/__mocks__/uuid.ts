export const v4 = jest.fn(() => 'mocked-uuid-v4');
export const v1 = jest.fn(() => 'mocked-uuid-v1');
export const v3 = jest.fn(() => 'mocked-uuid-v3');
export const v5 = jest.fn(() => 'mocked-uuid-v5');
export const validate = jest.fn(() => true);
export const version = jest.fn(() => 4);

export default {
  v4,
  v1,
  v3,
  v5,
  validate,
  version,
};
