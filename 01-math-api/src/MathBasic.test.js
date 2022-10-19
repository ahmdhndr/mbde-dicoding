const MathBasic = require('./MathBasic');

describe('A MathBasic', () => {
  it('should contains add, subtract, multiply, and divide function', () => {
    expect(MathBasic).toHaveProperty('add');
    expect(MathBasic).toHaveProperty('subtract');
    expect(MathBasic).toHaveProperty('multiply');
    expect(MathBasic).toHaveProperty('divide');
    expect(MathBasic.add).toBeInstanceOf(Function);
    expect(MathBasic.subtract).toBeInstanceOf(Function);
    expect(MathBasic.multiply).toBeInstanceOf(Function);
    expect(MathBasic.divide).toBeInstanceOf(Function);
  });

  describe('An add function', () => {
    it('should throw error when not given two parameters', () => {
      expect(() => MathBasic.add()).toThrowError();
      expect(() => MathBasic.add(1)).toThrowError();
      expect(() => MathBasic.add(1, 2, 3)).toThrowError();
      expect(() => MathBasic.add(1, 2, 3, 4)).toThrowError();
    });

    it('should throw error when given non-number parameters', () => {
      expect(() => MathBasic.add('2', '1')).toThrowError();
      expect(() => MathBasic.add(true, false)).toThrowError();
      expect(() => MathBasic.add([], {})).toThrowError();
    });

    it('should return a + b when given two number parameters', () => {
      expect(MathBasic.add(2, 2)).toEqual(4);
      expect(MathBasic.add(16, 4)).toEqual(20);
      expect(MathBasic.add(5, 5)).toEqual(10);
    });
  });

  describe('A subtract function', () => {
    it('should throw error when not given two parameters', () => {
      expect(() => MathBasic.subtract()).toThrowError();
      expect(() => MathBasic.subtract(1)).toThrowError();
      expect(() => MathBasic.subtract(1, 2, 3)).toThrowError();
    });

    it('should throw error when given non-number parameters', () => {
      expect(() => MathBasic.subtract('2', '1')).toThrowError();
      expect(() => MathBasic.subtract(true, false)).toThrowError();
      expect(() => MathBasic.subtract({}, [])).toThrowError();
    });

    it('should return a - b when given two number parameters', () => {
      expect(MathBasic.subtract(3, 5)).toEqual(-2);
      expect(MathBasic.subtract(5, 5)).toEqual(0);
      expect(MathBasic.subtract(8, 4)).toEqual(4);
    });
  });

  describe('A multiply function', () => {
    it('should throw error when not given two parameters', () => {
      expect(() => MathBasic.multiply()).toThrowError();
      expect(() => MathBasic.multiply(1)).toThrowError();
      expect(() => MathBasic.multiply(1, 2, 3)).toThrowError();
    });

    it('should throw error when given non-number parameters', () => {
      expect(() => MathBasic.multiply('2', '1')).toThrowError();
      expect(() => MathBasic.multiply(true, false)).toThrowError();
      expect(() => MathBasic.multiply({}, [])).toThrowError();
    });

    it('should return a * b when given two number parameters', () => {
      expect(MathBasic.multiply(2, 5)).toEqual(10);
      expect(MathBasic.multiply(9, 5)).toEqual(45);
      expect(MathBasic.multiply(6, 6)).toEqual(36);
    });
  });

  describe('A divide function', () => {
    it('should throw error when not given two parameters', () => {
      expect(() => MathBasic.divide()).toThrowError();
      expect(() => MathBasic.divide(1)).toThrowError();
      expect(() => MathBasic.divide(1, 2, 3)).toThrowError();
    });

    it('should throw error when given non-number parameters', () => {
      expect(() => MathBasic.divide('2', '1')).toThrowError();
      expect(() => MathBasic.divide(true, false)).toThrowError();
      expect(() => MathBasic.divide({}, [])).toThrowError();
    });

    it('should return a / b when given two number parameters', () => {
      expect(MathBasic.divide(5, 5)).toEqual(1);
      expect(MathBasic.divide(10, 4)).toEqual(2.5);
      expect(MathBasic.divide(100, 10)).toEqual(10);
    });
  });
});
