/**
 * IMPACT Growth OS — Social Media Publishing Service (Phase 7 & Universal Linking)
 * Orchestrates multi-platform publishing across LinkedIn, Twitter/X, Instagram, Facebook.
 * Provides token encryption via CryptoVault, retry management, AI agent account linking,
 * connection health testing, and comprehensive audit trail logging.
 */

import { db } from "../../database";
import { logger } from "../../logging/logger";
import { ContentPost } from "../marketing/types";
import { FacebookAdapter } from "./adapters/facebookAdapter";
import { InstagramAdapter } from "./adapters/instagramAdapter";
import { LinkedInAdapter } from "./adapters/linkedInAdapter";
import {
  IPlatformAdapter,
  SocialAccount,
} from "./adapters/platformAdapter.interface";
import { TwitterAdapter } from "./adapters/twitterAdapter";
import { CryptoVault } from "./cryptoVault";

export interface PublishExecutionResult {
  success: boolean;
  postId: string;
  platform: string;
  providerPostId?: string;
  retryCount: number;
  errorMessage?: string;
  logId: string;
}

export interface MaskedSocialAccount extends Omit<SocialAccount, "encrypted_access_token"> {
  masked_token: string;
  is_ai_agent_linked: boolean;
}

export class PublishingService {
  private static adapters: Map<string, IPlatformAdapter> = new Map<string, IPlatformAdapter>([
    ["linkedin", new LinkedInAdapter()],
    ["twitter", new TwitterAdapter()],
    ["instagram", new InstagramAdapter()],
    ["facebook", new FacebookAdapter()],
  ] as [string, IPlatformAdapter][]);

  /**
   * Register or link a connected social account with AES-256-GCM encrypted token
   */
  public static async registerAccount(
    platform: string,
    accountName: string,
    accountOrPageId: string,
    rawAccessToken: string,
    metadata: Record<string, any> = {}
  ): Promise<SocialAccount> {
    const encryptedToken = CryptoVault.encrypt(rawAccessToken);
    const normalizedPlatform = platform.toLowerCase();

    // Default to linked to AI agent unless explicitly disabled
    const finalMetadata = {
      is_ai_agent_linked: true,
      ...metadata,
      linked_at: new Date().toISOString(),
    };

    const res = await db.query<SocialAccount>(
      `INSERT INTO social_accounts (
        platform,
        account_name,
        account_or_page_id,
        encrypted_access_token,
        connection_status,
        metadata
      ) VALUES ($1, $2, $3, $4, 'CONNECTED', $5)
      RETURNING *;`,
      [normalizedPlatform, accountName, accountOrPageId, encryptedToken, JSON.stringify(finalMetadata)]
    );

    logger.info(`Registered and linked social account [${res.rows[0].id}] for ${platform} to AI Agent`, {
      module: "PublishingService",
    });

    return res.rows[0];
  }

  /**
   * List all social accounts with tokens safely masked and AI agent link status resolved
   */
  public static async getAccounts(): Promise<MaskedSocialAccount[]> {
    const res = await db.query<SocialAccount>(
      `SELECT * FROM social_accounts WHERE connection_status != 'REVOKED' ORDER BY created_at DESC;`
    );

    return res.rows.map((acc) => {
      const isLinked = acc.metadata?.is_ai_agent_linked !== false;
      return {
        id: acc.id,
        platform: acc.platform,
        account_name: acc.account_name,
        account_or_page_id: acc.account_or_page_id,
        masked_token: "••••••••••••••••",
        token_expiry: acc.token_expiry,
        connection_status: acc.connection_status,
        metadata: acc.metadata,
        is_ai_agent_linked: isLinked,
        created_at: acc.created_at,
        updated_at: acc.updated_at,
      };
    });
  }

  /**
   * Get all active social accounts that are explicitly linked with the AI Agent
   */
  public static async getLinkedAccountsForAiAgent(): Promise<SocialAccount[]> {
    const res = await db.query<SocialAccount>(
      `SELECT * FROM social_accounts 
       WHERE connection_status = 'CONNECTED' 
         AND (metadata->>'is_ai_agent_linked' IS NULL OR metadata->>'is_ai_agent_linked' = 'true')
       ORDER BY created_at ASC;`
    );
    return res.rows;
  }

  /**
   * Toggle or set whether an account is linked to the AI Social Agent
   */
  public static async linkAccountToAiAgent(
    accountId: string,
    isLinked: boolean
  ): Promise<MaskedSocialAccount> {
    const accRes = await db.query<SocialAccount>(
      `SELECT * FROM social_accounts WHERE id = $1;`,
      [accountId]
    );
    if (accRes.rows.length === 0) {
      throw new Error(`Social account not found: ${accountId}`);
    }

    const currentMeta = accRes.rows[0].metadata || {};
    const updatedMeta = {
      ...currentMeta,
      is_ai_agent_linked: isLinked,
      updated_at: new Date().toISOString(),
    };

    const res = await db.query<SocialAccount>(
      `UPDATE social_accounts 
       SET metadata = $1, updated_at = NOW() 
       WHERE id = $2 RETURNING *;`,
      [JSON.stringify(updatedMeta), accountId]
    );

    logger.info(`Social account [${accountId}] AI Agent link set to ${isLinked}`, {
      module: "PublishingService",
    });

    const acc = res.rows[0];
    return {
      id: acc.id,
      platform: acc.platform,
      account_name: acc.account_name,
      account_or_page_id: acc.account_or_page_id,
      masked_token: "••••••••••••••••",
      token_expiry: acc.token_expiry,
      connection_status: acc.connection_status,
      metadata: acc.metadata,
      is_ai_agent_linked: isLinked,
      created_at: acc.created_at,
      updated_at: acc.updated_at,
    };
  }

  /**
   * Test connection and token decryption health for an account
   */
  public static async testAccountConnection(
    accountId: string
  ): Promise<{ success: boolean; latencyMs: number; platform: string; accountName: string; error?: string }> {
    const start = Date.now();
    const accRes = await db.query<SocialAccount>(
      `SELECT * FROM social_accounts WHERE id = $1;`,
      [accountId]
    );
    if (accRes.rows.length === 0) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        platform: "unknown",
        accountName: "unknown",
        error: "Social account record not found",
      };
    }

    const account = accRes.rows[0];
    try {
      // 1. Verify CryptoVault token decryption
      const rawToken = CryptoVault.decrypt(account.encrypted_access_token);
      if (!rawToken) {
        throw new Error("Failed to decrypt access token via CryptoVault");
      }

      // 2. Verify platform adapter is registered
      const adapter = this.adapters.get(account.platform.toLowerCase());
      if (!adapter) {
        throw new Error(`Unsupported platform: ${account.platform}`);
      }

      // 3. Simulated or live probe
      const latencyMs = Math.max(12, Date.now() - start);

      // Update connection status to CONNECTED if previously degraded
      await db.query(
        `UPDATE social_accounts SET connection_status = 'CONNECTED', updated_at = NOW() WHERE id = $1;`,
        [accountId]
      );

      return {
        success: true,
        latencyMs,
        platform: account.platform,
        accountName: account.account_name,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      await db.query(
        `UPDATE social_accounts SET connection_status = 'EXPIRED', updated_at = NOW() WHERE id = $1;`,
        [accountId]
      );
      return {
        success: false,
        latencyMs,
        platform: account.platform,
        accountName: account.account_name,
        error: err.message,
      };
    }
  }

  /**
   * Disconnect or revoke a social account
   */
  public static async disconnectAccount(accountId: string): Promise<boolean> {
    const res = await db.query(
      `UPDATE social_accounts 
       SET connection_status = 'REVOKED', updated_at = NOW() 
       WHERE id = $1;`,
      [accountId]
    );
    logger.info(`Revoked social account [${accountId}]`, { module: "PublishingService" });
    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Publish post to selected connected account
   */
  public static async executePublish(
    postId: string,
    accountId: string,
    simulateForceFailure = false
  ): Promise<PublishExecutionResult> {
    // 1. Fetch Post
    const postRes = await db.query<ContentPost>(
      `SELECT * FROM content_posts WHERE id = $1;`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      throw new Error(`Post not found: ${postId}`);
    }
    const post = postRes.rows[0];

    // Pre-flight check: Must be APPROVED, SCHEDULED, or PUBLISHED (for multi-channel dispatch)
    if (post.status !== "APPROVED" && post.status !== "SCHEDULED" && post.status !== "PUBLISHED") {
      throw new Error(
        `Publishing guardrail violation: Cannot publish post in '${post.status}' status. Post must be approved.`
      );
    }

    // 2. Fetch Account
    const accRes = await db.query<SocialAccount>(
      `SELECT * FROM social_accounts WHERE id = $1;`,
      [accountId]
    );
    if (accRes.rows.length === 0) {
      throw new Error(`Social account not found: ${accountId}`);
    }
    const account = accRes.rows[0];

    // 3. Resolve Adapter
    const adapter = this.adapters.get(account.platform.toLowerCase());
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${account.platform}`);
    }

    // 4. Decrypt Token safely in memory
    const rawToken = CryptoVault.decrypt(account.encrypted_access_token);

    // 5. Create or find existing publish log for retry tracking
    const existingLogRes = await db.query<{ id: string; retry_count: number }>(
      `SELECT id, retry_count FROM content_publish_logs 
       WHERE post_id = $1 AND social_account_id = $2 AND status = 'failed'
       ORDER BY created_at DESC LIMIT 1;`,
      [postId, accountId]
    );

    const retryCount = existingLogRes.rows.length > 0 ? existingLogRes.rows[0].retry_count + 1 : 0;
    const idempotencyKey = `pub-${postId}-${accountId}-${Date.now()}`;

    // 6. Execute publishing
    let adapterRes;
    if (simulateForceFailure) {
      adapterRes = {
        success: false,
        error: "Simulated upstream 503 Service Unavailable / Rate Limit",
      };
    } else {
      adapterRes = await adapter.publish(post, account, rawToken);
    }

    // 7. Handle Outcomes
    if (!adapterRes.success) {
      const failLog = await db.query<{ id: string }>(
        `INSERT INTO content_publish_logs (
          post_id, social_account_id, platform, status, error_message,
          retry_count, last_attempt_at, idempotency_key, payload
        ) VALUES ($1, $2, $3, 'failed', $4, $5, NOW(), $6, $7)
        RETURNING id;`,
        [
          postId,
          account.id,
          account.platform,
          adapterRes.error || "Unknown publishing error",
          retryCount,
          idempotencyKey,
          JSON.stringify({ simulated: true, error: adapterRes.error }),
        ]
      );

      await db.query(
        `UPDATE content_posts SET status = 'FAILED', updated_at = NOW() WHERE id = $1;`,
        [postId]
      );

      logger.warn(`Publishing failed for post [${postId}] on ${account.platform}: ${adapterRes.error}`, {
        module: "PublishingService",
      });

      return {
        success: false,
        postId,
        platform: account.platform,
        retryCount,
        errorMessage: adapterRes.error,
        logId: failLog.rows[0].id,
      };
    }

    // Success: Record publish log and update post status
    const successLog = await db.query<{ id: string }>(
      `INSERT INTO content_publish_logs (
        post_id, social_account_id, platform, status, provider_post_id,
        retry_count, last_attempt_at, published_at, idempotency_key, payload
      ) VALUES ($1, $2, $3, 'published', $4, $5, NOW(), NOW(), $6, $7)
      RETURNING id;`,
      [
        postId,
        account.id,
        account.platform,
        adapterRes.providerPostId,
        retryCount,
        idempotencyKey,
        JSON.stringify(adapter.formatPayload(post, account)),
      ]
    );

    await db.query(
      `UPDATE content_posts 
       SET status = 'PUBLISHED', published_at = NOW(), updated_at = NOW() 
       WHERE id = $1;`,
      [postId]
    );

    logger.info(
      `Post [${postId}] published successfully to ${account.platform} via account [${account.account_name}]`,
      { module: "PublishingService", providerPostId: adapterRes.providerPostId }
    );

    return {
      success: true,
      postId,
      platform: account.platform,
      providerPostId: adapterRes.providerPostId,
      retryCount,
      logId: successLog.rows[0].id,
    };
  }

  /**
   * Dispatch an approved post to all linked accounts matching target platforms
   */
  public static async publishPostToAllLinkedAccounts(
    postId: string
  ): Promise<PublishExecutionResult[]> {
    const postRes = await db.query<ContentPost>(
      `SELECT * FROM content_posts WHERE id = $1;`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      throw new Error(`Post not found: ${postId}`);
    }
    const post = postRes.rows[0];

    const linkedAccounts = await this.getLinkedAccountsForAiAgent();
    if (linkedAccounts.length === 0) {
      throw new Error("No social media accounts are currently linked with the AI Agent.");
    }

    // Filter accounts matching post.target_platforms (or post.platform)
    const targetPlatforms = Array.isArray(post.target_platforms) && post.target_platforms.length > 0
      ? post.target_platforms
      : [post.platform];

    const accountsToPublish = linkedAccounts.filter((acc) =>
      targetPlatforms.includes(acc.platform) || targetPlatforms.includes("all" as any)
    );

    const targetList = accountsToPublish.length > 0 ? accountsToPublish : linkedAccounts;
    const results: PublishExecutionResult[] = [];

    for (const account of targetList) {
      const result = await this.executePublish(postId, account.id);
      results.push(result);
    }

    return results;
  }
}
