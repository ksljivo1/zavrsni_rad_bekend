import * as combinatorics from "js-combinatorics";

const EPSILON = "ε"

function removeDuplicateProductions(arr) {
    const seen = new Set();
    return arr.filter(sub => {
        const key = JSON.stringify(sub);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).filter(sub => sub.length !== 0);
}

export default function CFG(nonTerminals, alphabet, productions, startSymbol) {
    function removeEpsilonFromProduction(production, epsProductions) {
        const countOfEpsProductions = production.filter(symbol => epsProductions.includes(symbol)).length
        const replacement = []

        if (countOfEpsProductions > 0) {
            const binStrings = new combinatorics.BaseN([true, false], countOfEpsProductions);
            binStrings.toArray().forEach(binString => {
                let newProduction = []
                let index = 0
                production.forEach(symbol => {
                    if (epsProductions.includes(symbol)) {
                        if (binString[index]) newProduction.push(symbol)
                        index++
                    } else {
                        newProduction.push(symbol)
                    }
                })
                replacement.push(newProduction)
            })

            return removeDuplicateProductions(replacement)
        }
        return [production]
    }

    function print() {
        console.log("Context-free grammar G is given by 4-tuple (N, Σ, P, S): ")
        console.log("Non terminal symbols N: ")
        nonTerminals.forEach((symbol, i) => console.log("" + (i + 1) + ") " + symbol))

        console.log("Alphabet Σ: ")
        alphabet.forEach((symbol, i) => console.log("" + (i + 1) + ") " + symbol))

        console.log("Production rules P: ")
        nonTerminals.forEach((symbol, i) => {
            let productionRule = ""
            for (const production of productions[symbol]) {
                productionRule += production.reduce((a, b) => a + b, "") + " | "
            }
            console.log(`${i + 1}) ${symbol}`, "->", productionRule.slice(0, -2))
        })

        console.log("Start symbol S:", startSymbol)
    }

    function getNonTerminals() {
        return nonTerminals
    }

    function getAlphabet() {
        return alphabet
    }

    function getProductions() {
        return productions
    }

    function getStartSymbol() {
        return startSymbol
    }

    function getListOfGenerativeSymbols() {
        let oldListOfGenerativeSymbols = []
        let newListOfGenerativeSymbols = nonTerminals.filter(symbol => {
            for (const production of productions[symbol]) {
                if (production.every(symbol1 => [...alphabet, "ε"].includes(symbol1))) {
                    return true
                }
            }
            return false
        })
        while (newListOfGenerativeSymbols.length !== oldListOfGenerativeSymbols.length) {
            oldListOfGenerativeSymbols = [...newListOfGenerativeSymbols]
            newListOfGenerativeSymbols = nonTerminals.filter(symbol => {
                for (const production of productions[symbol]) {
                    if (production.every(symbol1 => [...alphabet, ...oldListOfGenerativeSymbols, EPSILON].includes(symbol1))) {
                        return true
                    }
                }
                return false
            })
        }
        return newListOfGenerativeSymbols
    }

    function getListOfReachableSymbols() {
        let oldListOfReachableSymbols = []
        let newListOfReachableSymbols = [startSymbol]

        while (newListOfReachableSymbols.length !== oldListOfReachableSymbols.length) {
            oldListOfReachableSymbols = [...newListOfReachableSymbols]
            oldListOfReachableSymbols.filter(symbol => nonTerminals.includes(symbol)).forEach(symbol => {
                let setOfReachableSymbols = new Set()
                productions[symbol].forEach(production => {
                    production.forEach(symbol1 => setOfReachableSymbols.add(symbol1))
                })
                newListOfReachableSymbols = [...(new Set([...oldListOfReachableSymbols, ...newListOfReachableSymbols, ...setOfReachableSymbols]))]
            })
        }
        return newListOfReachableSymbols
    }

    function getListOfEmptySymbols() {
        let oldListOfEmptySymbols = []
        let newListOfEmptySymbols = nonTerminals.filter(symbol => productions[symbol].some(production => production.length === 1 && production[0] === EPSILON))

        while (newListOfEmptySymbols.length !== oldListOfEmptySymbols.length) {
            oldListOfEmptySymbols = newListOfEmptySymbols
            newListOfEmptySymbols = [...(new Set([...oldListOfEmptySymbols, ...nonTerminals.filter(symbol => {
                return productions[symbol].some(production => production.every(symbol => oldListOfEmptySymbols.includes(symbol)))
            })]))]
        }

        return newListOfEmptySymbols
    }

    function reduceToChomskyNormalForm() {
        // removing non-generative symbols
        const newNonTerminals = getListOfGenerativeSymbols()
        const listOfNongenerativeSymbols = nonTerminals.filter(symbol => !newNonTerminals.includes(symbol))
        const newAlphabet = new Set()
        const newProductions = {}
        for (const symbol of newNonTerminals) {
            newProductions[symbol] = []
            for (const production of productions[symbol]) {
                let acceptRule = true
                if (production.some(symbol1 => listOfNongenerativeSymbols.includes(symbol1))) acceptRule = false
                if (acceptRule) {
                    newProductions[symbol].push(production)
                    production.filter(symbol1 => alphabet.includes(symbol1)).forEach(symbol1 => newAlphabet.add(symbol1))
                }
            }
            if (newProductions[symbol].length === 0) delete newProductions[symbol]
        }

        // removing non-reachable symbols
        const listOfReachableSymbols = getListOfReachableSymbols()
        Object.keys(newProductions).forEach(symbol => {
            if (!listOfReachableSymbols.includes(symbol)) delete newProductions[symbol]
        })

        const newGrammar = CFG(newNonTerminals.filter(symbol => listOfReachableSymbols.includes(symbol)),
            [...newAlphabet].filter(symbol => listOfReachableSymbols.includes(symbol)),
            newProductions,
            startSymbol)

        // below is logic for removing epsilon productions

        const newestListOfProductions = newGrammar.getProductions()
        const newestStartSymbol = newGrammar.getStartSymbol()
        const newestAlphabet = newGrammar.getAlphabet()
        const newestNonTerminals = newGrammar.getNonTerminals()
        const listOfEmptySymbols = newGrammar.getListOfEmptySymbols()

        for (const symbol of newestNonTerminals) {
            let newProductions = []
                newestListOfProductions[symbol].forEach(production => {
                    if (production.length === 1 && [...newestAlphabet, EPSILON].includes(production[0])) newProductions.push(production)
                    else newProductions.push(...removeEpsilonFromProduction(production, listOfEmptySymbols))
                })

            newestListOfProductions[symbol] = newProductions
        }

        let listOfDirectEpsilonProductions = listOfEmptySymbols
            .filter(production => newestListOfProductions[production].length === 1 && newestListOfProductions[production][0].length === 1
                    && newestListOfProductions[production][0][0] === EPSILON)

        let oldListOfDirectEpsilonProductions = []
        while (listOfDirectEpsilonProductions.length !== oldListOfDirectEpsilonProductions.length) {
            oldListOfDirectEpsilonProductions = [...listOfDirectEpsilonProductions]
            listOfDirectEpsilonProductions = [...(new Set([...listOfDirectEpsilonProductions, ...newestNonTerminals.filter(symbol =>
                 productions[symbol].every(production => production.every(symbol => oldListOfDirectEpsilonProductions.includes(symbol)))
            )]))]
        }

        for (const symbol of newestNonTerminals) {
            let newProductions = []
            newestListOfProductions[symbol].forEach(production => {
                newProductions.push(production.filter(symbol1 => ![...listOfDirectEpsilonProductions, EPSILON].includes(symbol1)))
            })

            newestListOfProductions[symbol] = removeDuplicateProductions(newProductions)
        }

        for (const symbol of newestNonTerminals) {
            if (newestListOfProductions[symbol].length === 0) delete newestListOfProductions[symbol]
        }

        if (listOfEmptySymbols.includes(newestStartSymbol)) newestListOfProductions[newestStartSymbol].push(["ε"])

        return newestListOfProductions;
    }

    function containsWord(word) {
        return word
    }

    function generateTree(word) {
        return word
    }

    return {
        print,
        getAlphabet,
        getStartSymbol,
        getProductions,
        getNonTerminals,
        getListOfGenerativeSymbols,
        getListOfReachableSymbols,
        reduceToChomskyNormalForm,
        getListOfEmptySymbols,
        containsWord,
        generateTree,
        removeEpsilonFromProduction
    }
}