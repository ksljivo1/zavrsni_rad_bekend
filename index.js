import CFG from './controllers/CFG.js';
import express from 'express';
import Parse from './controllers/Parse.js';
const app = express();
const port = 3000;

app.use(express.json());

let grammar;

app.post('/grammar', (req, res) => {
  const { nonTerminals, alphabet, productions, startSymbol } = req.body;
  grammar = CFG(nonTerminals, alphabet, productions, startSymbol);
  res.status(200).json('Grammar created successfully!');
});

app.post('/parseTree', (req, res) => {
  try {
    res.status(200).json(Parse(req.body.word, grammar).getGenerativeTree());
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
