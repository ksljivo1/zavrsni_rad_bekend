import CFG from "./Model/CFG.js"

const N = ["S", "A", "B"]
const sigma = ["a", "b", "c"]
const P = {
    "S": [
        ["A", "B", "a"]
    ],
    "A": [
        ["a", "a", "b"]
    ],
    "B": [
        ["A", "c"]
    ]
}

const S = "S"

const grammar = CFG(N, sigma, P, S)

grammar.reduceToChomskyNormalForm().print()