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
                if (production.every(symbol1 => [...alphabet, EPSILON].includes(symbol1))) {
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

    function removeNonGenerativeSymbols(nonTerminals, alphabet, productions, startSymbol) {
        const newNonTerminals = getListOfGenerativeSymbols()
        const listOfNongenerativeSymbols = nonTerminals.filter(symbol => !newNonTerminals.includes(symbol))
        const newAlphabet = new Set()
        const newProductions = {}
        for (const symbol of newNonTerminals) {
            newProductions[symbol] = []
            for (const production of productions[symbol]) {
                const acceptRule = !production.some(symbol1 => listOfNongenerativeSymbols.includes(symbol1))
                if (acceptRule) {
                    newProductions[symbol].push(production)
                    production.filter(symbol1 => alphabet.includes(symbol1)).forEach(symbol1 => newAlphabet.add(symbol1))
                }
            }
            if (newProductions[symbol].length === 0) delete newProductions[symbol]
        }
        return CFG(newNonTerminals, newAlphabet, newProductions, startSymbol)
    }

    function removeNonReachableSymbols(nonTerminals, alphabet, productions, startSymbol) {
        const listOfReachableSymbols = getListOfReachableSymbols()
        Object.keys(productions).forEach(symbol => {
            if (!listOfReachableSymbols.includes(symbol)) delete productions[symbol]
        })

        return CFG(nonTerminals.filter(symbol => listOfReachableSymbols.includes(symbol)),
            [...alphabet].filter(symbol => listOfReachableSymbols.includes(symbol)),
            productions,
            startSymbol)
    }

    function getListOfDirectEpsilonProductions(listOfEmptySymbols, listOfProductions, nonTerminals) {
        let listOfDirectEpsilonProductions = listOfEmptySymbols
            .filter(production => listOfProductions[production].length === 1 && listOfProductions[production][0].length === 1
                && listOfProductions[production][0][0] === EPSILON)

        let oldListOfDirectEpsilonProductions = []
        while (listOfDirectEpsilonProductions.length !== oldListOfDirectEpsilonProductions.length) {
            oldListOfDirectEpsilonProductions = [...listOfDirectEpsilonProductions]
            listOfDirectEpsilonProductions = [...(new Set([...listOfDirectEpsilonProductions, ...nonTerminals.filter(symbol =>
                productions[symbol].every(production => production.every(symbol => oldListOfDirectEpsilonProductions.includes(symbol)))
            )]))]
        }

        return listOfDirectEpsilonProductions
    }

    function removeEpsilonProductions(grammar) {
        const newestListOfProductions = grammar.getProductions()
        const newestStartSymbol = grammar.getStartSymbol()
        const newestAlphabet = grammar.getAlphabet()
        const newestNonTerminals = grammar.getNonTerminals()
        const listOfEmptySymbols = grammar.getListOfEmptySymbols()

        for (const symbol of newestNonTerminals) {
            let newProductions = []
            newestListOfProductions[symbol].forEach(production => {
                if (production.length === 1 && [...newestAlphabet, EPSILON].includes(production[0])) newProductions.push(production)
                else newProductions.push(...removeEpsilonFromProduction(production, listOfEmptySymbols))
            })

            newestListOfProductions[symbol] = newProductions
        }

        let listOfDirectEpsilonProductions = getListOfDirectEpsilonProductions(listOfEmptySymbols, newestListOfProductions, newestNonTerminals)

        for (const symbol of newestNonTerminals) {
            let newProductions = []
            newestListOfProductions[symbol].forEach(production => {
                newProductions.push(production.filter(symbol1 => ![...listOfDirectEpsilonProductions, EPSILON].includes(symbol1)))
            })

            newestListOfProductions[symbol] = removeDuplicateProductions(newProductions)
        }

        let newNonTerminals = []
        for (const symbol of newestNonTerminals) {
            if (newestListOfProductions[symbol].length === 0) delete newestListOfProductions[symbol]
            else newNonTerminals.push(symbol)
        }

        if (listOfEmptySymbols.includes(newestStartSymbol)) newestListOfProductions[newestStartSymbol].push([EPSILON])

        return { newestListOfProductions, newNonTerminals };
    }

    function unit(symbol, productions, nonTerminals) {
        let oldListOfUnitProductions = []
        let newListOfUnitProductions = [symbol]

        while (newListOfUnitProductions.length !== oldListOfUnitProductions.length) {
            oldListOfUnitProductions = [...newListOfUnitProductions]
            oldListOfUnitProductions.forEach(symbol => {
                const newSymbol = productions[symbol].filter(production => production.length === 1 && nonTerminals.includes(production[0]))
                if (newSymbol.length !== 0) newListOfUnitProductions.push(...newSymbol.flat())
                newListOfUnitProductions = removeDuplicateProductions(newListOfUnitProductions)
            })
        }

        return newListOfUnitProductions
    }

    function removeUnitProductions(grammar) {
        const newestListOfProductions = grammar.getProductions()
        const newestStartSymbol = grammar.getStartSymbol()
        const newestAlphabet = grammar.getAlphabet()
        const newestNonTerminals = grammar.getNonTerminals()

        const additionalProductions = {}

        newestNonTerminals.forEach(symbol => {
            const unitProductions = unit(symbol, newestListOfProductions, newestNonTerminals)
            if (unitProductions.length > 1) {
                const newProductions = []
                unitProductions.forEach(unitProduction => {
                    if (unitProduction !== symbol) {
                        const newThing = productions[unitProduction].filter(production => production.length !== 1
                            || (production.length === 1 && newestAlphabet.includes(...production.flat())))
                        if (newThing.length !== 0) newProductions.push(...newThing)
                    }
                })
                additionalProductions[symbol] = removeDuplicateProductions(newProductions)
            }
        })

        Object.keys(additionalProductions).forEach(symbol => {
            newestListOfProductions[symbol].push(...additionalProductions[symbol])
            newestListOfProductions[symbol] = removeDuplicateProductions(newestListOfProductions[symbol])

            newestListOfProductions[symbol] = newestListOfProductions[symbol].filter(production => {
                return !(production.length === 1 && unit(symbol, newestListOfProductions, newestNonTerminals).includes(...production))}
            )
        })

        return CFG(newestNonTerminals, newestAlphabet, newestListOfProductions, newestStartSymbol)
    }

    function reduceToChomskyNormalForm() {
        // removing non-generative symbols
        const grammarWithoutNonGenerativeSymbols = removeNonGenerativeSymbols(nonTerminals, alphabet, productions, startSymbol)

        // removing non-reachable symbols
        const grammarWithoutNonReachableSymbols = removeNonReachableSymbols(grammarWithoutNonGenerativeSymbols.getNonTerminals(),
            grammarWithoutNonGenerativeSymbols.getAlphabet(), grammarWithoutNonGenerativeSymbols.getProductions(), grammarWithoutNonGenerativeSymbols.getStartSymbol())

        // removing epsilon productions
        const { newestListOfProductions, newNonTerminals } = removeEpsilonProductions(grammarWithoutNonReachableSymbols)

        const grammarWithoutEpsilonProductions = CFG(newNonTerminals, [...grammarWithoutNonGenerativeSymbols.getAlphabet()],
            newestListOfProductions, grammarWithoutNonGenerativeSymbols.getStartSymbol())

        // removing unit productions
        const grammarWithoutUnitProductions = removeUnitProductions(grammarWithoutEpsilonProductions)

        // removal of unit productions might result with useless productions
        const grammarWithoutUnitAndNonGenerativeProductions = grammarWithoutUnitProductions.removeNonGenerativeSymbols(grammarWithoutUnitProductions.getNonTerminals(),
            grammarWithoutUnitProductions.getAlphabet(), grammarWithoutUnitProductions.getProductions(), grammarWithoutUnitProductions.getStartSymbol())

        const newestOfNewestGrammars =  grammarWithoutUnitAndNonGenerativeProductions.removeNonReachableSymbols(
            grammarWithoutUnitAndNonGenerativeProductions.getNonTerminals(), grammarWithoutUnitAndNonGenerativeProductions.getAlphabet(),
            grammarWithoutUnitAndNonGenerativeProductions.getProductions(), grammarWithoutUnitAndNonGenerativeProductions.getStartSymbol()
        )

        // reduction to Chomsky normal form
        const productionsPrime = {}

        newestOfNewestGrammars.getNonTerminals().forEach(symbol => {
            const thiss = newestOfNewestGrammars.getProductions()[symbol]
                .filter(production => (production.length === 1 && newestOfNewestGrammars.getAlphabet().includes(production[0])) ||
                    production.length === 2 && production.every(symbol1 => newestOfNewestGrammars.getNonTerminals().includes(symbol1)))
            if (thiss.length !== 0) productionsPrime[symbol] = thiss
        })

        const constructNewProductions = {}


        const listOfProductionsPrime = Object.values(productionsPrime).reduce((acc, production) => [...acc, ...production], [])

        let newestOfNewestOfProductions = {}

        newestOfNewestGrammars.getNonTerminals().forEach(symbol => {
            const newProductions = []
            newestOfNewestGrammars.getProductions()[symbol].forEach(production => {
                if (!listOfProductionsPrime.some(production1 => production.every(symbol => production1.includes(symbol)))) {
                    newProductions.push(production.map(symbol => {
                        if (newestOfNewestGrammars.getAlphabet().includes(symbol)) {
                            constructNewProductions['REPLACEMENT_FOR_' + symbol] = [[symbol]]
                            return 'REPLACEMENT_FOR_' + symbol
                        }
                        return symbol
                    }))
                } else {
                    newProductions.push(production)
                }
            })
            newestOfNewestOfProductions[symbol] = newProductions
        })

        const newestOfNewestOfNonTerminals = [...newestOfNewestGrammars.getNonTerminals(), ...Object.keys(constructNewProductions)]
        newestOfNewestOfProductions = {...newestOfNewestOfProductions, ...constructNewProductions}

        /// ovo treba jos razraditi
        const replacementProductions = {}
        newestOfNewestOfNonTerminals.forEach((symbol, i) => {
            replacementProductions[symbol] = []
            newestOfNewestOfProductions[symbol].forEach((production, j) => {
                if (production.length >= 3) {
                    let k
                    for (k = 0; k < production.length - 2; k++) {
                        if (k > 0) replacementProductions['D_' + i + '_' + j + '_' + (k - 1)] = []
                        k === 0 ? replacementProductions[symbol].push([production[k], 'D_' + i + '_' + j + '_' + k]) :
                            replacementProductions['D_' + i + '_' + j + '_' + (k - 1)].push([production[k], 'D_' + i + '_' + j + '_' + (k)])
                    }
                    replacementProductions['D_' + i + '_' + j + '_' + (k - 1)] = []
                    replacementProductions['D_' + i + '_' + j + '_' + (k - 1)].push([production[k], production[k + 1]])
                } else {
                    replacementProductions[symbol].push(production)
                }
            })
        })


        return CFG([...Object.keys(replacementProductions)], newestOfNewestGrammars.getAlphabet(), replacementProductions, newestOfNewestGrammars.getStartSymbol())
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
        removeEpsilonFromProduction,
        unit,
        removeUnitProductions,
        removeNonReachableSymbols,
        removeNonGenerativeSymbols
    }
}