import CFG from "./Model/CFG.js"

const N = ["S", "X", "Y", "Z", "M", "N"]
const sigma = ["a", "b"]
const P = {
    "S": [
        ["X", "Y"]
    ],
    "X": [
        ["a"]
    ],
    "Y": [
        ["Z"], ["b"]
    ],
    "Z": [
        ["M"]
    ],
    "M": [
        ["N"]
    ],
    "N": [
        ["a"]
    ]
}

const S = "S"

const grammar = CFG(N, sigma, P, S)

grammar.reduceToChomskyNormalForm().print()


