import CFG from "./Model/CFG.js"

const N = ["S", "A", "B", "C", "D", "E"]
const sigma = ["a", "b", "c", "d"]
const P = {
    "S": [
        ["A", "B", "C", "D"], ["E"]
    ],
    "A": [
         ["a"], ["ε"]
    ],
    "B": [
        ["b"], ["c"]
    ],
    "C": [
        ["b"], ["ε"]
    ],
    "D": [
        ["a"], ["b"]
    ],
    "E": [
        ["a"], ["d"], ["ε"]
    ]
}

const S = "S"

const grammar = CFG(N, sigma, P, S)
console.log(grammar.reduceToChomskyNormalForm())


