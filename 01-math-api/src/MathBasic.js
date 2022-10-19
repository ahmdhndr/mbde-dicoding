const MathBasic = {
  add: (...args) => {
    if (args.length !== 2) {
      throw new Error('fungsi add hanya menerima dua parameter');
    }

    const [a, b] = args;

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('fungsi hanya menerima parameter number');
    }

    return +a + +b;
  },
  subtract: (...args) => {
    if (args.length !== 2) {
      throw new Error('fungsi subtract hanya menerima dua parameter');
    }

    const [a, b] = args;

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('fungsi hanya menerima parameter number');
    }

    return +a - +b;
  },
  multiply: (...args) => {
    if (args.length !== 2) {
      throw new Error('fungsi multiply hanya menerima dua parameter');
    }

    const [a, b] = args;

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('fungsi hanya menerima parameter number');
    }

    return +a * +b;
  },
  divide: (...args) => {
    if (args.length !== 2) {
      throw new Error('fungsi divide hanya menerima dua parameter');
    }

    const [a, b] = args;

    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('fungsi hanya menerima parameter number');
    }

    return +a / +b;
  },
};

module.exports = MathBasic;
