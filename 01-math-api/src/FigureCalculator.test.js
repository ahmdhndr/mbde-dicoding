const FigureCalculator = require('./FigureCalculator');
const MathBasic = require('./MathBasic');

describe('A FigureCalculator', () => {
  it('should contain calculateRectanglePerimeter, calculateRectangleArea, calculateTrianglePerimeter, and calculateTriangleArea function', () => {
    const figureCalculator = new FigureCalculator({});

    expect(figureCalculator).toHaveProperty('calculateRectanglePerimeter');
    expect(figureCalculator).toHaveProperty('calculateRectangleArea');
    expect(figureCalculator).toHaveProperty('calculateTrianglePerimeter');
    expect(figureCalculator).toHaveProperty('calculateTriangleArea');
    expect(figureCalculator.calculateRectanglePerimeter).toBeInstanceOf(Function);
    expect(figureCalculator.calculateRectangleArea).toBeInstanceOf(Function);
    expect(figureCalculator.calculateTrianglePerimeter).toBeInstanceOf(Function);
    expect(figureCalculator.calculateTriangleArea).toBeInstanceOf(Function);
  });

  describe('A calculateRectanglePerimeter function', () => {
    it('should throw error when not given 2 parameters', () => {
      const figureCalculator = new FigureCalculator({});

      expect(() => figureCalculator.calculateRectanglePerimeter()).toThrowError();
      expect(() => figureCalculator.calculateRectanglePerimeter(1)).toThrowError();
      expect(() => figureCalculator.calculateRectanglePerimeter(1, 2, 3)).toThrowError();
    });

    it('should throw error when given with non-number parameters', () => {
      const figureCalculator = new FigureCalculator({});

      expect(() => figureCalculator.calculateRectanglePerimeter('1', '2')).toThrowError();
      expect(() => figureCalculator.calculateRectanglePerimeter(true, false)).toThrowError();
      expect(() => figureCalculator.calculateRectanglePerimeter({}, [])).toThrowError();
    });

    it('should return correct value based on rectangle perimeter formula', () => {
      // Arrange
      const length = 20;
      const width = 30;
      const spyAdd = jest.spyOn(MathBasic, 'add');
      const spyMultiply = jest.spyOn(MathBasic, 'multiply');
      const figureCalculator = new FigureCalculator(MathBasic);

      // Action
      const result = figureCalculator.calculateRectanglePerimeter(length, width);

      // Assert
      expect(result).toEqual(100); // 2 x (length + width)
      expect(spyAdd).toBeCalledWith(length, width);
      expect(spyMultiply).toBeCalledWith(2, 50); // (length + width);
    });
  });

  describe('A calculateRectangleArea function', () => {
    it('should throw error when not given 2 parameters', () => {
      const figureCalculator = new FigureCalculator({});

      expect(() => figureCalculator.calculateRectangleArea()).toThrowError();
      expect(() => figureCalculator.calculateRectangleArea(1)).toThrowError();
      expect(() => figureCalculator.calculateRectangleArea(1, 2, 3)).toThrowError();
    });

    it('should throw error when given with non-number parameters', () => {
      const figureCalculator = new FigureCalculator({});

      expect(() => figureCalculator.calculateRectangleArea('1', '2')).toThrowError();
      expect(() => figureCalculator.calculateRectangleArea(true, false)).toThrowError();
      expect(() => figureCalculator.calculateRectangleArea({}, [])).toThrowError();
    });

    it('should return correct value based on rectangle perimeter formula', () => {
      // Arrange
      const length = 20;
      const width = 10;
      const spyMultiply = jest.spyOn(MathBasic, 'multiply');
      const figureCalculator = new FigureCalculator(MathBasic);

      // Action
      const result = figureCalculator.calculateRectangleArea(length, width);

      // Assert
      expect(result).toEqual(200); // (length * width)
      expect(spyMultiply).toBeCalledWith(length, width);
    });
  });

  describe('A calculateTrianglePerimeter function', () => {
    it('should throw error when not given 3 parameters', () => {
      const figureCalculator = new FigureCalculator({});

      expect(() => figureCalculator.calculateTrianglePerimeter()).toThrowError();
      expect(() => figureCalculator.calculateTrianglePerimeter(1)).toThrowError();
      expect(() => figureCalculator.calculateTrianglePerimeter(1, 2)).toThrowError();
      expect(() => figureCalculator.calculateTrianglePerimeter(1, 2, 3, 4)).toThrowError();
    });

    it('should throw error when given with non-number parameters', () => {
      const figureCalculator = new FigureCalculator({});

      expect(() => figureCalculator.calculateTrianglePerimeter([], true, 2)).toThrowError();
      expect(() => figureCalculator.calculateTrianglePerimeter(1, {}, false)).toThrowError();
      expect(() => figureCalculator.calculateTrianglePerimeter('2', 2, {})).toThrowError();
    });

    it('should return correct value based on triangle perimeter formula', () => {
      // Arrange
      const sideA = 10;
      const sideB = 15;
      const base = 30;
      const spyAdd = jest.spyOn(MathBasic, 'add');
      const figureCalculator = new FigureCalculator(MathBasic);

      // Act
      const result = figureCalculator.calculateTrianglePerimeter(sideA, sideB, base);

      // Assert
      expect(result).toEqual(55); // (sideA + sideB) + base
      expect(spyAdd).toBeCalledWith((sideA + sideB), base);
    });

    describe('a calculateTriangleArea', () => {
      it('should throw error when not given 2 parameters', () => {
        const figureCalculator = new FigureCalculator({});

        expect(() => figureCalculator.calculateTriangleArea()).toThrowError();
        expect(() => figureCalculator.calculateTriangleArea(1)).toThrowError();
        expect(() => figureCalculator.calculateTriangleArea(1, 2, 3)).toThrowError();
      });

      it('should throw error when given with non-number parameters', () => {
        const figureCalculator = new FigureCalculator({});

        expect(() => figureCalculator.calculateTriangleArea(1, '2')).toThrowError();
        expect(() => figureCalculator.calculateTriangleArea({}, null)).toThrowError();
        expect(() => figureCalculator.calculateTriangleArea(true, false)).toThrowError();
      });

      it('should return correct value based on triangle area formula', () => {
        // Arrange
        const base = 10;
        const height = 15;
        const spyMultiply = jest.spyOn(MathBasic, 'multiply');
        const spyDivide = jest.spyOn(MathBasic, 'divide');
        const figureCalculator = new FigureCalculator(MathBasic);

        // Action
        const result = figureCalculator.calculateTriangleArea(base, height);

        // Assert
        expect(result).toEqual(75); // (base * height) / 2
        expect(spyMultiply).toBeCalledWith(base, height);
        expect(spyDivide).toBeCalledWith(150, 2);
      });
    });
  });
});
