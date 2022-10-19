/* eslint-disable class-methods-use-this */
class FigureCalculator {
  constructor(mathBasic) {
    this._mathBasic = mathBasic;
  }

  calculateRectanglePerimeter(...args) {
    if (args.length !== 2) {
      throw new Error('fungsi hanya menerima 2 parameter');
    }

    const [a, b] = args;

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('fungsi hanya menerima parameter number');
    }
  }

  calculateRectangleArea() { }

  calculateTrianglePerimeter() { }

  calculateTriangleArea() { }
}

module.exports = FigureCalculator;
