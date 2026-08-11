/**
 * Utilitário para o Sistema de Campeonato Mensal de Níveis & Premiação de 5.000 Moedas
 */

export const MONTHLY_REWARDS = {
  1: { coins: 5000, titleId: 'title_anim_rainbow', badge: '🏆 Campeão Mensal', label: '1º Lugar' },
  2: { coins: 2500, titleId: 'title_anim_neon',    badge: '🥈 Vice-Campeão',  label: '2º Lugar' },
  3: { coins: 1000, titleId: 'title_anim_fire',    badge: '🥉 Elite do Mês',   label: '3º Lugar' }
};

export const getCurrentMonthKey = (date = new Date()) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

export const getPreviousMonthKey = (date = new Date()) => {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getCurrentMonthKey(prev);
};

export const getDaysRemainingInMonth = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  return Math.max(0, lastDayOfMonth - date.getDate());
};

export const isLastWeekendOfMonth = (date = new Date()) => {
  const daysLeft = getDaysRemainingInMonth(date);
  const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
  return daysLeft <= 3 && (dayOfWeek === 0 || dayOfWeek === 6);
};

export const checkMonthlyRewardStatus = (progress) => {
  const currentMonth = getCurrentMonthKey();
  const prevMonth = getPreviousMonthKey();
  const lastClaimed = progress?.lastMonthlyRewardMonth || null;

  // Se já resgatou neste mês o prêmio do mês anterior
  if (lastClaimed === prevMonth || lastClaimed === currentMonth) {
    return { canClaim: false, claimedMonth: lastClaimed };
  }

  return { canClaim: true, targetMonth: prevMonth };
};
