// Chave do mês corrente no formato 'YYYY-MM', em UTC — usada tanto para
// premiar um troféu quanto para ler o ranking, então os dois lados sempre
// concordam sobre "qual mês é este" independente do fuso do processo.
export const currentMonthKey = (now = new Date()) => now.toISOString().slice(0, 7);
