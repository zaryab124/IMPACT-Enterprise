/**
 * IMPACT Growth OS — Credential Crypto Vault (Phase 7)
 * Implements AES-256-GCM authenticated encryption for social media tokens.
 * Plaintext tokens are NEVER stored in the database or transmitted to the client.
 */

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

export class CryptoVault {
  private static getMasterKey(): Buffer {
    const rawKey =
      process.env.ENCRYPTION_MASTER_KEY ||
      "impact-growth-os-aes256-master-key-32b!"; // 32 chars default
    return crypto.createHash("sha256").update(rawKey).digest();
  }

  /**
   * Encrypt plaintext string into hex payload containing IV, Auth Tag, and Ciphertext
   */
  public static encrypt(plainText: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = this.getMasterKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([
      cipher.update(plainText, "utf8"),
      cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    // Format: iv:tag:ciphertext (hex encoded)
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  /**
   * Decrypt hex payload back to plaintext string
   */
  public static decrypt(cipherTextPayload: string): string {
    const parts = cipherTextPayload.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted payload format. Expected iv:tag:ciphertext");
    }

    const [ivHex, tagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const key = this.getMasterKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  /**
   * Mask token for safe display in UI/API responses
   */
  public static maskToken(token: string): string {
    if (!token || token.length < 8) return "••••••••";
    return `${token.substring(0, 4)}••••••••${token.substring(token.length - 4)}`;
  }
}
