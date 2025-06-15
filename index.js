import CFG from "./Model/CFG.js"
import Parse from "./Model/Parse.js"

const N = ["S", "A", "B", "C"]
const sigma = ["a", "b"]
const P = {
    "S": [
        ["A", "B"], ["B", "C"]
    ],
    "A": [
        ["B", "A"], ["a"]
    ],
    "B": [
        ["C", "C"], ["b"]
    ],
    "C": [
        ["A", "B"], ["a"]
    ]
}

const S = "S"

const grammar = CFG(N, sigma, P, S)

const parse = Parse("bb", grammar)

console.log(parse.wordIsGeneratedByGrammar())