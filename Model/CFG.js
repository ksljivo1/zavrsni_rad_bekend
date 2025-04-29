export default function CFG(nonTerminals, alphabet, productions, startSymbol) {
    function print() {
        console.log("Context free grammar G is given by 4-tuple (N, Σ, P, S): ")
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
                    if (production.every(symbol1 => [...alphabet, ...oldListOfGenerativeSymbols, "ε"].includes(symbol1))) {
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

        return CFG(newNonTerminals.filter(symbol => listOfReachableSymbols.includes(symbol)),
            [...newAlphabet].filter(symbol => listOfReachableSymbols.includes(symbol)),
            newProductions,
            startSymbol)
    }

    function containsWord(word) {
        return word
    }

    function generateTree(word) {
        return word
    }

    return {
        print,
        getListOfGenerativeSymbols,
        getListOfReachableSymbols,
        reduceToChomskyNormalForm,
        containsWord,
        generateTree
    }
}