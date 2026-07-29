import { describe, it, expect } from 'vitest';
import { presenceLabel, canShowCount } from './presenceLabel';

describe('presenceLabel', () => {
  it('mostra o singular corretamente', () => {
    expect(presenceLabel({ status: 'ok', online: 1, queue: 0 })).toBe('1 pessoa no site');
  });

  it('mostra o plural corretamente', () => {
    expect(presenceLabel({ status: 'ok', online: 12, queue: 0 })).toBe('12 pessoas no site');
  });

  it('acrescenta a fila quando há alguém procurando', () => {
    expect(presenceLabel({ status: 'ok', online: 12, queue: 3 }))
      .toBe('12 pessoas no site · 3 procurando duelo');
  });

  it('omite a fila quando está vazia', () => {
    expect(presenceLabel({ status: 'ok', online: 5, queue: 0 })).toBe('5 pessoas no site');
  });

  // REGRESSÃO: com o servidor fora do ar, a tela mostrava "0 online agora" com
  // bolinha verde pulsando — indistinguível de "servidor no ar, ninguém aqui".
  it('NUNCA mostra número quando o servidor está inalcançável', () => {
    expect(presenceLabel({ status: 'offline', online: 0, queue: 0 }))
      .toBe('Servidor indisponível');
    // Mesmo se um número vier junto por engano, o rótulo não o exibe:
    expect(presenceLabel({ status: 'offline', online: 7, queue: 2 }))
      .toBe('Servidor indisponível');
  });

  it('diz "Conectando" enquanto não sabe', () => {
    expect(presenceLabel({ status: 'connecting', online: null, queue: null }))
      .toBe('Conectando…');
    // null com status ok também é "ainda não sei", não "zero pessoas"
    expect(presenceLabel({ status: 'ok', online: null, queue: null }))
      .toBe('Conectando…');
  });

  it('não quebra sem argumento', () => {
    expect(presenceLabel()).toBe('Conectando…');
  });

  it('zero pessoas é exibível SÓ quando a conexão está boa', () => {
    expect(presenceLabel({ status: 'ok', online: 0, queue: 0 })).toBe('0 pessoas no site');
  });
});

describe('canShowCount', () => {
  it('só libera número com status ok', () => {
    expect(canShowCount('ok')).toBe(true);
    expect(canShowCount('offline')).toBe(false);
    expect(canShowCount('connecting')).toBe(false);
  });
});
