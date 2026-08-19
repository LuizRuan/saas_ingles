/**
 * useCourse — normaliza um objeto `word` para o par de idiomas ativo.
 *
 * Os componentes usam este hook em vez de ler `word.en` / `word.pt` direto,
 * para não precisarem saber qual curso está ativo.
 *
 *   const { targetText, sourceText, targetLabel } = useCourse(word);
 *
 * Sem uma palavra, devolve só os metadados do curso:
 *
 *   const { targetLabel, sourceLabel, coursePair } = useCourse();
 *
 * HISTÓRICO IMPORTANTE: este módulo tinha um `ACTIVE_COURSE` fixo em 'en-pt',
 * com o comentário "alterar aqui é o único passo necessário para trocar o
 * idioma". Isso deixou de ser verdade quando o curso passou a viver em
 * `progress.activeCourse` (ver useCourseData.js): eram dois sistemas
 * paralelos, e este mentia sobre qual idioma estava ativo — os rótulos diriam
 * "Inglês" para quem estuda espanhol. Agora ele lê a mesma fonte que todo o
 * resto do app.
 *
 * Nota: `word.en` guarda o texto no IDIOMA-ALVO em todos os cursos (em es-pt,
 * `en: "Hola"`), e `word.pt` a tradução. Por isso `targetText`/`sourceText`
 * funcionam sem precisar trocar de chave por curso — ver src/utils/wordKey.js.
 */

import { useProgress } from './useProgress';
import { AVAILABLE_COURSES } from '../data/index';

const FLAG_FONTE = '🇧🇷';
const LABEL_FONTE = 'Português';

const metadados = (courseId) => {
  const curso = AVAILABLE_COURSES.find(c => c.id === courseId) || AVAILABLE_COURSES[0];
  return {
    coursePair: curso.id,
    targetLabel: curso.targetName,
    targetFlag: curso.flag,
    sourceLabel: LABEL_FONTE,
    sourceFlag: FLAG_FONTE,
  };
};

const useCourse = (word) => {
  const { progress } = useProgress();
  const meta = metadados(progress?.activeCourse || 'en-pt');

  if (!word) {
    return {
      targetText: '',
      sourceText: '',
      tip: '',
      exampleTarget: '',
      exampleSource: '',
      ...meta,
    };
  }

  return {
    targetText: word.en ?? '',
    sourceText: word.pt ?? '',
    tip: word.tip ?? '',
    exampleTarget: word.example ?? '',
    exampleSource: word.examplePt ?? '',
    ...meta,
  };
};

export default useCourse;
