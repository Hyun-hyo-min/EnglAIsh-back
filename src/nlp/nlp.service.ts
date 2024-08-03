import { Injectable } from '@nestjs/common';
import * as natural from 'natural';

@Injectable()
export class NlpService {
    private tokenizer: natural.WordTokenizer;
    private sentenceAnalyzer: natural.SentimentAnalyzer;
    private sentenceTokenizer: natural.SentenceTokenizer;
    private tagger: natural.BrillPOSTagger;
    public stemmer: typeof natural.PorterStemmer;

    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.sentenceAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
        this.sentenceTokenizer = new natural.SentenceTokenizer();
        this.stemmer = natural.PorterStemmer;

        const baseFolder = "node_modules/natural/lib/natural/brill_pos_tagger/data";
        const lexiconFilename = `${baseFolder}/English/lexicon_from_posjs.json`;
        const rulesFilename = `${baseFolder}/English/tr_from_posjs.txt`;
        const lexicon = new natural.Lexicon(lexiconFilename, 'NN');
        const ruleSet = new natural.RuleSet(rulesFilename);

        this.tagger = new natural.BrillPOSTagger(lexicon, ruleSet);
    }

    tokenize(text: string): string[] {
        return this.tokenizer.tokenize(text);
    }

    sentenceTokenize(text: string): string[] {
        return this.sentenceTokenizer.tokenize(text);
    }

    analyzeSentiment(text: string): number {
        const words = this.tokenize(text);
        const sentiment = this.sentenceAnalyzer.getSentiment(words);
        return (sentiment + 1) / 2;
    }

    posTag(words: string[]): string[] {
        return this.tagger.tag(words).taggedWords.map(tw => tw.tag);
    }

    analyzeSentenceStructure(tags: string[]): number {
        const hasNoun = tags.includes('NN') || tags.includes('NNS') || tags.includes('NNP') || tags.includes('NNPS');
        const hasVerb = tags.includes('VB') || tags.includes('VBD') || tags.includes('VBG') || tags.includes('VBN') || tags.includes('VBP') || tags.includes('VBZ');
        const hasAdjective = tags.includes('JJ') || tags.includes('JJR') || tags.includes('JJS');
        const hasAdverb = tags.includes('RB') || tags.includes('RBR') || tags.includes('RBS');

        let score = 0;
        if (hasNoun && hasVerb) score += 0.5;
        if (hasAdjective) score += 0.25;
        if (hasAdverb) score += 0.25;

        return score;
    }

    analyzeWordOrder(tags: string[]): number {
        const validPatterns = [
            ['DT', 'NN', 'VB'],
            ['PRP', 'VB'],
            ['NN', 'VB'],
            ['DT', 'JJ', 'NN', 'VB'],
        ];

        for (let i = 0; i < tags.length - 2; i++) {
            const trigram = tags.slice(i, i + 3);
            if (validPatterns.some(pattern => JSON.stringify(pattern) === JSON.stringify(trigram))) {
                return 1;
            }
        }

        return 0;
    }
}
