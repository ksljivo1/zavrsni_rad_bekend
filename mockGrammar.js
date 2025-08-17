import CFG from './controllers/CFG.js';

const N = ['S', 'A', 'B', 'C', 'D'];
const sigma = ['a', 'b', 'c'];
const P = {
  S: [
    ['A', 'B', 'B'],
    ['B', 'C'],
  ],
  A: [['B', 'A'], ['a']],
  B: [['C', 'C'], ['b']],
  C: [['A', 'B'], ['a']],
  D: [['c']],
};

const S = 'S';
