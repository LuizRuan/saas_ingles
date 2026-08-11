import * as enWords from './courses/en/words.js';
import * as enSentences from './courses/en/sentences.js';
import * as enStories from './courses/en/stories.js';
import * as enConversations from './courses/en/conversations.js';
import * as enImageWords from './courses/en/imageWords.js';

import * as esWords from './courses/es/words.js';
import * as esSentences from './courses/es/sentences.js';
import * as esStories from './courses/es/stories.js';
import * as esConversations from './courses/es/conversations.js';
import * as esImageWords from './courses/es/imageWords.js';

export const AVAILABLE_COURSES = [
  { id: 'en-pt', name: 'Inglês', flag: '🇺🇸', langCode: 'en-US', targetName: 'Inglês', available: true },
  { id: 'es-pt', name: 'Espanhol', flag: '🇪🇸', langCode: 'es-ES', targetName: 'Espanhol', available: false }
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
    imageWords: enImageWords.imageWords
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
    imageWords: esImageWords.imageWords
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
