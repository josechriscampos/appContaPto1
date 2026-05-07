// backend/src/libs/tokenBlacklist.js
const blacklistedTokens = new Set();

export const blacklistToken = (token) => {
  blacklistedTokens.add(token);
  // Se auto-elimina después de 7 días (igual que el JWT)
  setTimeout(() => {
    blacklistedTokens.delete(token);
  }, 1000 * 60 * 60 * 24 * 7);
};

export const isTokenBlacklisted = (token) => blacklistedTokens.has(token);