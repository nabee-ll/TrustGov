import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

export const passwordService = {
  hash: async (plainText: string) => bcrypt.hash(plainText, BCRYPT_ROUNDS),
  verify: async (plainText: string, hash: string) => bcrypt.compare(plainText, hash),
};
