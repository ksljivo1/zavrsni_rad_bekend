import CFG from "./Model/CFG.js"

const N = ["S", "A", "B", "C"]
const sigma = ["a", "b", "t"]
const P = {
    "S": [
        ["A", "a"], ["b"], ["B"]
    ],
    "B": [
        ["C", "t"]
    ],
    "A": [
        ["a"]
    ],
    "C": [
        ["B"]
    ]
}

const S = "S"

const grammar = CFG(N, sigma, P, S)
grammar.print()
grammar.reduceToChomskyNormalForm().print()

