const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailValido(email: string): boolean {
  return EMAIL_RE.test(normalizarEmail(email));
}

/**
 * Identidades usadas para casar convites com o morador: e-mail cadastrado e,
 * se o login for um endereço válido, o próprio login (muitos usuários entram com o e-mail como login).
 */
export function identidadesConviteMorador(m: {
  email?: string | null;
  login?: string | null;
}): string[] {
  const out = new Set<string>();
  const em = m.email && String(m.email).trim();
  if (em) {
    const n = normalizarEmail(em);
    if (emailValido(n)) out.add(n);
  }
  const loginRaw = m.login && String(m.login).trim();
  if (loginRaw) {
    const loginNorm = normalizarEmail(loginRaw);
    if (emailValido(loginNorm)) out.add(loginNorm);
  }
  return [...out];
}
