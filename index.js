import CFG from "./Model/CFG.js"

// const N = ["S", "A", "B", "C"]
// const sigma = ["a", "b", "c"]
// const P = {
//     "S": [
//         ["A", "a"], ["a", "B", "b"]
//     ],
//     "A": [
//         ["b", "A", "b"]
//     ],
//     "B": [
//         ["b", "B", "b"], ["A"], ["a"]
//     ],
//     "C": [
//         ["a"], ["c"]
//     ]
// }
//
// const S = "S"

const N = ["S", "A", "B", "C", "D", "E"]
const sigma = ["a", "b", "c"]
const P = {
    "S": [
        ["A", "a"], ["a", "B", "b"]
    ],
    "A": [
        ["b", "A", "b"]
    ],
    "B": [
        ["b", "B", "b"], ["A"], ["a"]
    ],
    "C": [
        ["a"], ["c"]
    ],
    "D": [
        ["E"]
    ],
    "E": [
        ["D"]
    ]
}

const S = "S"


const grammar = CFG(N, sigma, P, S).reduceToChomskyNormalForm()
grammar.print()
// console.log(grammar.getListOfReachableSymbols())
// grammar.print()
// grammar.reduceToChomskyNormalForm().print()

