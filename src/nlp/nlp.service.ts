import { Injectable } from '@nestjs/common';
import * as natural from 'natural';
import { GRAMMER_RULES } from './utils/nlp.constants';
import { ADVANCED_WORDS } from './utils/nlp.constants';

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

    calculateGrammarErrors(tags: string[]): number {
        let errors = 0;

        GRAMMER_RULES.forEach(({ pattern, error }) => {
            for (let i = 0; i < tags.length - pattern.length + 1; i++) {
                const slice = tags.slice(i, i + pattern.length);
                if (JSON.stringify(slice) === JSON.stringify(pattern)) {
                    errors += error;
                }
            }
        });

        return errors;
    }

    evaluateVocabulary(text: string): number {
        const words = this.tokenize(text);
        const uniqueWords = new Set(words);
        const basicVocabularyScore = Math.min(uniqueWords.size / words.length, 1);

        const advancedWordSet = new Set(ADVANCED_WORDS.map(word => this.stemmer.stem(word)));
        const stemmedWords = words.map(word => this.stemmer.stem(word));
        const advancedWordCount = stemmedWords.filter(word => advancedWordSet.has(word)).length;
        const advancedWordScore = Math.min(advancedWordCount / 2, 1);

        return Math.round((basicVocabularyScore + advancedWordScore) * 50);
    }
}
