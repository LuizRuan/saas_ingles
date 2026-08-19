import * as enWords from './courses/en/words.js';
import * as enSentences from './courses/en/sentences.js';
import * as enStories from './courses/en/stories.js';
import * as enConversations from './courses/en/conversations.js';
import * as enImageWords from './courses/en/imageWords.js';

import { levels as enLevels } from './categories.js';
import { errorPatterns as enErrorPatterns } from './errorPatterns.js';
import { errorPatterns as esErrorPatterns } from './courses/es/errorPatterns.js';
import { levels as esLevels } from './courses/es/levels.js';

import * as esWords from './courses/es/words.js';
import * as esSentences from './courses/es/sentences.js';
import * as esStories from './courses/es/stories.js';
import * as esConversations from './courses/es/conversations.js';
import * as esImageWords from './courses/es/imageWords.js';

export const AVAILABLE_COURSES = [
  { id: 'en-pt', name: 'Inglês', flag: '🇺🇸', langCode: 'en-US', targetName: 'Inglês', available: true },
  { id: 'es-pt', name: 'Espanhol', flag: '🇪🇸', langCode: 'es-ES', targetName: 'Espanhol', available: false },
];

const courseDataMap = {
  'en-pt': {
    words: enWords.words,
    sentences: enSentences.sentences,
    fillBlanks: enSentences.fillBlanks,
    trueFalse: enSentences.trueFalse,
    translationQuizzes: enSentences.translationQuizzes,
    stories: enStories.stories,
    storyLevels: enStories.STORY_LEVELS,
    conversations: enConversations.conversations,
    imageWords: enImageWords.imageWords,
    levels: enLevels,
    errorPatterns: enErrorPatterns
  },
  'es-pt': {
    words: esWords.words,
    sentences: esSentences.sentences,
    fillBlanks: esSentences.fillBlanks,
    trueFalse: esSentences.trueFalse,
    translationQuizzes: esSentences.translationQuizzes,
    stories: esStories.stories,
    storyLevels: esStories.STORY_LEVELS,
    conversations: esConversations.conversations,
    imageWords: esImageWords.imageWords,
    levels: esLevels,
    errorPatterns: esErrorPatterns
  }
};

export const getCourseData = (courseId = 'en-pt') => {
  return courseDataMap[courseId] || courseDataMap['en-pt'];
};

export const getWords = (courseId = 'en-pt') => getCourseData(courseId).words;
export const getSentences = (courseId = 'en-pt') => getCourseData(courseId).sentences;
export const getFillBlanks = (courseId = 'en-pt') => getCourseData(courseId).fillBlanks;
export const getTrueFalse = (courseId = 'en-pt') => getCourseData(courseId).trueFalse;
export const getTranslationQuizzes = (courseId = 'en-pt') => getCourseData(courseId).translationQuizzes;
export const getStories = (courseId = 'en-pt') => getCourseData(courseId).stories;
export const getConversations = (courseId = 'en-pt') => getCourseData(courseId).conversations;
export const getImageWords = (courseId = 'en-pt') => getCourseData(courseId).imageWords;
// Escada de níveis por curso: os bancos têm tamanhos muito diferentes, então
// os thresholds de `wordsNeeded` não podem ser compartilhados (ver
// courses/es/levels.js).
export const getLevels = (courseId = 'en-pt') => getCourseData(courseId).levels;
// Correções por curso: vários padrões do inglês estão INVERTIDOS em espanhol
// ("tengo 20 años" é o certo lá, "I have 20 years" é o erro aqui), então
// compartilhar a lista corrigiria acertos como se fossem erros.
export const getErrorPatterns = (courseId = 'en-pt') => getCourseData(courseId).errorPatterns;

// Código BCP-47 do idioma-alvo, usado pela síntese de voz (useSpeech) e pelo
// reconhecimento de fala (MicButton). Fonte única: o `langCode` que já existe
// em AVAILABLE_COURSES — antes useSpeech.js mantinha um mapa próprio, que
// passaria a divergir desta lista no dia em que um curso novo entrasse.
export const getCourseLangCode = (courseId = 'en-pt') =>
  AVAILABLE_COURSES.find(c => c.id === courseId)?.langCode || 'en-US';
