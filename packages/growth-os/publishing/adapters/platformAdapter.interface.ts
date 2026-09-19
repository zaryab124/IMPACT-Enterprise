/**
 * IMPACT Growth OS — Social Platform Adapter Interface (Phase 7)
 */

import { ContentPost, SocialPlatform } from "../../marketing/types";

export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  account_name: string;
  account_or_page_id: string;
  encrypted_access_token: string;
  token_expiry?: string | null;
  connection_status: "CONNECTED" | "EXPIRED" | "REVOKED";
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AdapterPublishResponse {
  success: boolean;
  providerPostId?: string;
  error?: string;
  rateLimitRemaining?: number;
  rawResponse?: any;
}

export interface IPlatformAdapter {
  readonly platform: SocialPlatform;

  /**
   * Publish post to external platform
   */
  publish(post: ContentPost, account: SocialAccount, token: string): Promise<AdapterPublishResponse>;

  /**
   * Format payload specifically for the platform's API requirements
   */
  formatPayload(post: ContentPost, account: SocialAccount): any;
}
