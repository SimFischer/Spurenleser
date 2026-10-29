// A client-side spoiler barrier, not authentication. Never store the code itself.
const SESSION_KEY = 'spurenleser.teacher.session';
export function createTeacherAccess(storage) {
  let unlocked = false;
  const session = () => storage ?? globalThis.sessionStorage;
  try { unlocked = session().getItem(SESSION_KEY) === 'open'; } catch { /* Memory-only fallback. */ }
  return {
    isUnlocked: () => unlocked,
    unlock(code) {
      if (code !== 'Lehrkraft') return false;
      unlocked = true;
      try { session().setItem(SESSION_KEY, 'open'); } catch { /* No persistent storage needed. */ }
      return true;
    },
    lock() {
      unlocked = false;
      try { session().removeItem(SESSION_KEY); } catch { /* Still locked in memory. */ }
    }
  };
}
