export default function Parse(word, cfg1) {
    const cfg = cfg1.reduceToChomskyNormalForm()

    function wordIsGeneratedByGrammar() {
        const wordTable = new Array(word.length)

        for (let i = 0; i < wordTable.length; i++) {
            wordTable[i] = new Array(i + 1).fill([])
        }

        Array.from(word).forEach((symbol, index) => {
            cfg.getNonTerminals().forEach(nonTerminal => {
                if (cfg.getProductions()[nonTerminal].some(production => production.includes(symbol)))
                    wordTable[wordTable.length - 1][index] = [...wordTable[wordTable.length - 1][index], nonTerminal]
            })
        })

        for (let i = wordTable.length - 1; i >= 1; i--) {
            for (let j = 0; j < i; j++) {
                let t = 0
                for (let k = i; k < wordTable.length; k++) {
                        wordTable[k][j].forEach(symbol1 => {
                            wordTable[wordTable.length - 1 - t][j + wordTable.length - k].forEach(symbol2 => {
                                cfg.getNonTerminals().forEach(nonTerminal => {
                                    cfg.getProductions()[nonTerminal].some(production => {
                                        if (production.length === 2 && production[0] === symbol1 && production[1] === symbol2)
                                            wordTable[i - 1][j] = [...new Set([...wordTable[i - 1][j], nonTerminal])]
                                    })
                                })
                            })
                        })
                    t++
                }
            }
        }


        return wordTable
    }

    function getParseTree() {

    }

    return {
        getParseTree,
        wordIsGeneratedByGrammar
    }
}