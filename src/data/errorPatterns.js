// Erros típicos de quem fala português e está aprendendo inglês.
//
// Todos aqui são DECALQUES: a pessoa monta a frase em português e troca palavra
// por palavra. Por isso a explicação sempre nomeia a estrutura do português que
// causou o erro — é o que faz a correção grudar, em vez de só mostrar a forma
// certa. As explicações ficam em PORTUGUÊS de propósito: quem erra isso ainda
// não lê inglês bem o bastante para aprender com uma explicação em inglês.
//
// Acrescentar um erro = acrescentar um objeto a esta lista. Nada mais a ligar.
//
// `teste` roda sobre a frase JÁ NORMALIZADA por answerCheck.js: minúscula, sem
// pontuação e com as contrações expandidas ("i'm" vira "i am"). Escreva os
// padrões nessa forma — procurar por "I'm" aqui nunca casa.

export const errorPatterns = [
  {
    id: 'idade_com_have',
    teste: /\bi (have|has) \d+ (years?|year old)\b/,
    explicacaoPt:
      'Idade em inglês usa o verbo "to be", não "to have". "I have 20 years" é "tenho 20 anos" traduzido palavra por palavra — para um falante de inglês soa como se você possuísse 20 anos.',
    correcao: "I'm 20 years old.",
  },
  {
    id: 'idade_sem_old',
    teste: /\bi am \d+ years\b(?! old)/,
    explicacaoPt:
      'Quase lá! Quando você diz o número de anos, a frase termina com "old": "I\'m 20 years old". Sem o "old" a frase fica pela metade.',
    correcao: "I'm 20 years old.",
  },
  {
    id: 'estado_com_have',
    teste: /\bi (have|has) (hungry|thirsty|cold|hot|sleepy|tired|scared|lucky|right|reason)\b/,
    explicacaoPt:
      'Estados e sensações em inglês usam "to be": "I am hungry", "I am cold". Em português a gente diz "estou com fome" e "tenho frio", e é daí que vem o "have" — mas em inglês ele não cabe aqui.',
    correcao: "I'm hungry.",
  },
  {
    id: 'profissao_sem_artigo',
    teste: /\b(i am|he is|she is|you are|we are|they are) (student|teacher|doctor|engineer|nurse|lawyer|driver|cook|waiter|dentist)\b/,
    explicacaoPt:
      'Profissões em inglês pedem o artigo "a" ou "an": "I am a student". Em português falamos "sou estudante", sem artigo, e é fácil esquecer dele ao traduzir.',
    correcao: "I'm a student.",
  },
  {
    id: 'negacao_sem_auxiliar',
    teste: /\bi (no|not) (like|want|have|know|understand|speak|go|eat|live|work)\b/,
    explicacaoPt:
      'Para negar um verbo em inglês você precisa do auxiliar "do not" (ou "don\'t"). Não dá para colocar "no" na frente do verbo como em "eu não gosto".',
    correcao: "I don't like it.",
  },
  {
    id: 'terceira_pessoa_sem_s',
    teste: /\b(he|she|it) (go|have|like|want|live|work|eat|speak|do|make|say|play|study|need)\b/,
    explicacaoPt:
      'Com "he", "she" e "it" no presente, o verbo ganha um -s no final: "he goes", "she likes", "it works". Português não tem essa marca, então ela some com facilidade.',
    correcao: 'He goes to school.',
  },
  {
    id: 'people_singular',
    teste: /\bpeople (is|was|has)\b/,
    explicacaoPt:
      '"People" já é plural em inglês (é o plural de "person"), então pede verbo no plural: "people are", "people were", "people have".',
    correcao: 'People are nice.',
  },
  {
    id: 'i_has',
    teste: /\bi has\b/,
    explicacaoPt: 'O "has" só vale para "he", "she" e "it". Com "I" é sempre "have".',
    correcao: 'I have a dog.',
  },
  {
    id: 'pergunta_sem_auxiliar',
    // Só vale quando a pessoa realmente escreveu uma pergunta: "You have a nice
    // dog" é frase legítima e não pode ser corrigida como pergunta malformada.
    exigeInterrogacao: true,
    teste: /^(you|he|she|they|we) (like|want|have|know|speak|live|work|go)\b/,
    explicacaoPt:
      'Perguntas em inglês começam com um auxiliar: "Do you like…?", "Does he work…?". Em português basta a entonação ("você gosta?"), mas em inglês o "do/does" é obrigatório.',
    correcao: 'Do you like it?',
  },
  {
    id: 'explain_me',
    teste: /\b(explain|say) me\b/,
    explicacaoPt:
      'Em inglês, "explain" e "say" pedem a preposição "to" antes da pessoa: "explain to me", "say to me". "Explain me" soa como se você fosse o assunto explicado.',
    correcao: 'Can you explain it to me?',
  },
  {
    id: 'have_anos_generico',
    teste: /\bhow many years (do|does) (you|he|she) have\b/,
    explicacaoPt:
      'Para perguntar a idade, o inglês usa "How old are you?" — literalmente "quão velho você é". A tradução direta de "quantos anos você tem" não funciona.',
    correcao: 'How old are you?',
  },
  {
    id: 'concordo_com_am',
    teste: /\bi am agree\b/,
    explicacaoPt:
      '"Agree" já é o verbo, então não leva "am": diga "I agree". Em português "estou de acordo" tem o verbo ser/estar, e é ele que vaza para o inglês.',
    correcao: 'I agree.',
  },
];
