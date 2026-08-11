/**
 * fix-rich-accounts.mjs
 * ---------------------
 * Verifica todas as contas com mais de 100.000 moedas (totalScore) e:
 *   - Reduz o saldo para 30.000
 *   - Zera shopItems, shopPurchases
 *   - Remove cosmeticos equipados (selectedTitle, selectedEffect,
 *     selectedAvatar, selectedTheme, selectedSoundPack)
 *
 * Como rodar:
 *   cd backend
 *   node scripts/fix-rich-accounts.mjs
 *
 * Flags:
 *   --dry-run   Lista as contas afetadas sem aplicar nenhuma mudanca.
 *
 * Exemplo (so listar):
 *   node scripts/fix-rich-accounts.mjs --dry-run
 */

import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';

// ---------- config -------------------------------------------------------
const COIN_THRESHOLD = 100_000;   // acima disso -> aplica correcao
const COIN_CAP       = 30_000;    // saldo final
const DRY_RUN        = process.argv.includes('--dry-run');
// -------------------------------------------------------------------------

dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('[fix-rich-accounts] MONGODB_URI nao definido no .env. Abortando.');
  process.exit(1);
}

// Modelo inline - nao importa de /models para evitar dependencias circulares
const { Schema } = mongoose;
const User = mongoose.model('User', new Schema({
  email: String,
  nickname: String,
  progress: Schema.Types.Mixed,
}, { timestamps: true }));

// -------------------------------------------------------------------------

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('[fix-rich-accounts] Conectado ao MongoDB.\n');

  // Busca todos os usuarios que tem progress.totalScore > threshold
  const users = await User.find({ 'progress.totalScore': { $gt: COIN_THRESHOLD } });

  if (users.length === 0) {
    console.log(`[fix-rich-accounts] Nenhuma conta com mais de ${COIN_THRESHOLD.toLocaleString()} moedas encontrada.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`[fix-rich-accounts] ${users.length} conta(s) encontrada(s) com mais de ${COIN_THRESHOLD.toLocaleString()} moedas:`);
  console.log('-'.repeat(60));

  let fixedCount = 0;

  for (const user of users) {
    const prog = user.progress ?? {};
    const before = prog.totalScore ?? 0;

    console.log(`  Email    : ${user.email}`);
    console.log(`  Nickname : ${user.nickname ?? '(sem apelido)'}`);
    console.log(`  Saldo    : ${before.toLocaleString()} moedas`);

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Nenhuma alteracao aplicada.\n`);
      continue;
    }

    const updatedProgress = {
      ...prog,
      totalScore       : COIN_CAP,
      shopItems        : [],
      shopPurchases    : 0,
      selectedTitle    : null,
      selectedEffect   : null,
      selectedAvatar   : null,
      selectedTheme    : 'default',
      selectedSoundPack: 'default',
    };

    await User.updateOne(
      { _id: user._id },
      { $set: { progress: updatedProgress } },
    );

    fixedCount++;
    console.log(`  Corrigido: ${before.toLocaleString()} -> ${COIN_CAP.toLocaleString()} moedas`);
    console.log(`  Itens da loja zerados, cosmeticos resetados.\n`);
  }

  console.log('-'.repeat(60));
  if (DRY_RUN) {
    console.log(`[fix-rich-accounts] DRY RUN concluido - ${users.length} conta(s) seriam afetadas.`);
  } else {
    console.log(`[fix-rich-accounts] Concluido - ${fixedCount} conta(s) corrigida(s).`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('[fix-rich-accounts] Erro:', err);
  process.exit(1);
});