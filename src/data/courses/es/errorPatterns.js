// Erros típicos de quem fala português e está aprendendo ESPANHOL.
//
// MESMO CONTRATO do arquivo de inglês (src/data/errorPatterns.js):
//   { id, teste: RegExp, explicacaoPt, correcao }
// e `teste` roda sobre a frase JÁ NORMALIZADA por answerCheck.js (minúscula,
// sem pontuação de borda).
//
// POR QUE UMA LISTA SEPARADA, e não a mesma: vários padrões do inglês estão
// INVERTIDOS em espanhol. O caso mais claro é a idade — "I have 20 years" é
// erro em inglês, mas "tengo 20 años" é a forma CORRETA em espanhol. Usar a
// lista do inglês aqui não seria só inútil: corrigiria o acerto como se fosse
// erro.
//
// O maior risco do espanhol para nós não é a gramática, é a semelhança: os
// FALSOS COGNATOS. A pessoa entende a frase inteira e erra só a palavra que
// parecia óbvia. Por isso eles dominam esta lista.
//
// As explicações ficam em PORTUGUÊS de propósito — mesma regra do inglês:
// quem ainda erra isso não lê espanhol bem o bastante para aprender com uma
// explicação em espanhol.

export const errorPatterns = [
  // ─── Falsos cognatos ────────────────────────────────────────────────────
  {
    id: 'es_embarazada',
    teste: /\bembarazad[oa]\b/,
    explicacaoPt:
      '"Embarazada" significa GRÁVIDA, não "envergonhada". Para dizer que ficou com vergonha use "avergonzado(a)". É o falso cognato que mais causa confusão real entre brasileiros.',
    correcao: 'Estoy avergonzado. (envergonhado) / Está embarazada. (grávida)',
  },
  {
    id: 'es_exquisito',
    teste: /\bexquisit[oa]\b.*\b(raro|extraño|feo)\b|\bes exquisito\b/,
    explicacaoPt:
      '"Exquisito" significa DELICIOSO, refinado — é um elogio. "Esquisito" no sentido de estranho se diz "raro" ou "extraño".',
    correcao: 'La comida está exquisita. (deliciosa)',
  },
  {
    id: 'es_oficina',
    teste: /\boficina\b.*\b(coche|carro|mecánic|taller|reparar)\b/,
    explicacaoPt:
      '"Oficina" em espanhol é ESCRITÓRIO. A oficina mecânica é "el taller".',
    correcao: 'Llevé el coche al taller.',
  },
  {
    id: 'es_rato_animal',
    teste: /\bun rato\b.*\b(come|queso|animal|gato)\b/,
    explicacaoPt:
      '"Rato" em espanhol é um MOMENTO ("espera un rato" = espere um pouco). O animal é "ratón".',
    correcao: 'El ratón come queso.',
  },
  {
    id: 'es_salsa',
    teste: /\bsalsa\b.*\b(verde|perejil|hierba)\b/,
    explicacaoPt:
      '"Salsa" em espanhol é MOLHO. A salsinha (a erva) é "perejil".',
    correcao: 'Salsa de tomate. / Un poco de perejil.',
  },
  {
    id: 'es_vaso_planta',
    teste: /\bvaso\b.*\b(planta|flor|flores)\b/,
    explicacaoPt:
      '"Vaso" em espanhol é COPO. O vaso de planta é "maceta".',
    correcao: 'Un vaso de agua. / Una maceta con flores.',
  },
  {
    id: 'es_exito_saida',
    teste: /\b(la|el|una|un) éxito\b.*\b(puerta|salir|emergencia)\b|\bbuscar el éxito\b.*\bpuerta\b/,
    explicacaoPt:
      '"Éxito" significa SUCESSO. A saída é "la salida".',
    correcao: 'La salida está allí. / Fue un gran éxito.',
  },
  {
    id: 'es_pelado',
    teste: /\bpelad[oa]\b.*\b(desnud|sin ropa)\b/,
    explicacaoPt:
      '"Pelado" em espanhol é CARECA ou descascado, não "pelado" de sem roupa — esse é "desnudo".',
    correcao: 'Está desnudo. (sem roupa) / Se quedó pelado. (careca)',
  },
  {
    id: 'es_doce_numero',
    teste: /\bdoce\b.*\b(azúcar|postre|dulce|sabor)\b/,
    explicacaoPt:
      '"Doce" em espanhol é o número 12. O doce que se come é "dulce".',
    correcao: 'Me gusta el dulce. / Son las doce.',
  },
  {
    id: 'es_largo',
    teste: /\blargo\b.*\b(ancho|anchura|de ancho)\b/,
    explicacaoPt:
      '"Largo" em espanhol significa COMPRIDO. Largo no sentido de largura é "ancho".',
    correcao: 'Un pasillo largo. (comprido) / Una calle ancha. (larga)',
  },

  // ─── Estruturas ─────────────────────────────────────────────────────────
  {
    id: 'es_idade_com_ser',
    teste: /\b(soy|eres|es|somos|son) \d+ años\b/,
    explicacaoPt:
      'Idade em espanhol usa "tener", igual ao português: "tengo 20 años". "Soy 20 años" é uma tradução literal do inglês e não existe.',
    correcao: 'Tengo veinte años.',
  },
  {
    id: 'es_fome_com_estar',
    teste: /\b(estoy|está|estás|estamos|están) (hambre|sed|frío|calor|sueño|miedo|prisa)\b/,
    explicacaoPt:
      'Fome, sede, frio, medo e pressa vão com "tener", não com "estar": "tengo hambre", "tengo frío".',
    correcao: 'Tengo hambre.',
  },
  {
    id: 'es_gustar_invertido',
    teste: /\byo gusto\b|\bgusto de\b/,
    explicacaoPt:
      '"Gustar" funciona como "agradar": quem gosta é o objeto indireto. Não é "yo gusto la música", e sim "me gusta la música" (a música me agrada).',
    correcao: 'Me gusta la música.',
  },
  {
    id: 'es_clima_com_estar',
    teste: /\b(está|es) (mucho )?(frío|calor|sol|viento)\b(?!.*\bhoy en\b)/,
    explicacaoPt:
      'Clima em espanhol usa "hacer": "hace frío", "hace calor", "hace sol". "Está frío" só vale para um objeto específico ("el café está frío").',
    correcao: 'Hace mucho frío hoy.',
  },
  {
    id: 'es_muy_mucho',
    teste: /\bmucho (bueno|malo|grande|pequeño|bonito|caro|barato|rápido|lento|difícil|fácil)\b/,
    explicacaoPt:
      'Antes de ADJETIVO use "muy", não "mucho": "muy bueno", "muy grande". "Mucho" acompanha substantivos ("mucho trabajo").',
    correcao: 'Es muy bueno.',
  },
  {
    id: 'es_pergunta_sem_abertura',
    teste: /^(qué|dónde|cómo|cuándo|quién|cuánto|cuál)\b.*\?$/,
    explicacaoPt:
      'Perguntas em espanhol abrem com "¿" invertido: "¿Dónde está?". Na escrita isso não é opcional.',
    correcao: '¿Dónde está el baño?',
  },
  {
    id: 'es_nombre_com_ser',
    teste: /\b(mi nombre está|me llamo es)\b/,
    explicacaoPt:
      'Para se apresentar use "me llamo Ana" ou "mi nombre es Ana" — nunca os dois juntos, e nunca com "estar".',
    correcao: 'Me llamo Ana.',
  },
  {
    id: 'es_haver_existencia',
    teste: /\b(tiene|tienen) (un|una|muchos|muchas) .*\b(en la mesa|en la casa|aquí|allí)\b/,
    explicacaoPt:
      'Para dizer que algo EXISTE em um lugar use "hay": "hay un libro en la mesa". "Tiene" é posse, de alguém específico.',
    correcao: 'Hay un libro en la mesa.',
  },
  {
    id: 'es_h_pronunciado',
    teste: /\b(rablar|rola|ristoria|rermano)\b/,
    explicacaoPt:
      'O "h" em espanhol é sempre MUDO: "hola" se fala "óla", "hablar" é "ablár". Escreva o "h", mas não o pronuncie.',
    correcao: 'Hola. / Hablar.',
  },
  {
    id: 'es_mais_em_espanhol',
    teste: /\bmais\b/,
    explicacaoPt:
      '"Mais" é português. Em espanhol é "más" (com acento) para quantidade, e "pero" para o "mas" adversativo.',
    correcao: 'Quiero más café, pero no tengo tiempo.',
  },
  {
    id: 'es_muito_em_espanhol',
    teste: /\b(muito|muita|bem|então|mas|também|obrigado)\b/,
    explicacaoPt:
      'Essa palavra é portuguesa. Equivalentes: muito → "muy/mucho", bem → "bien", então → "entonces", mas → "pero", também → "también", obrigado → "gracias".',
    correcao: 'Muy bien, gracias.',
  },
];

export default errorPatterns;
