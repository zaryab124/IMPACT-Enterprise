/**
 * IMPACT Growth OS — Facebook Platform Adapter
 * Implements Meta Graph API Facebook Page Feed schema.
 * Formats structured page updates, external links, and engaging business copy.
 */

import { ContentPost } from "../../marketing/types";
import {
  AdapterPublishResponse,
  IPlatformAdapter,
  SocialAccount,
} from "./platformAdapter.interface";

export class FacebookAdapter implements IPlatformAdapter {
  public readonly platform = "facebook" as const;

  /**
   * Format payload conforming to Facebook Page Feed API
   */
  public formatPayload(post: ContentPost, account: SocialAccount): any {
    const hashtagsFormatted = (post.hashtags || [])
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(" ");

    const message = `${post.hook ? `${post.hook}\n\n` : ""}${post.content}\n\n${post.cta || ""}\n\n${hashtagsFormatted}`.trim();

    return {
      message,
      page_id: account.account_or_page_id,
      link: "https://impact-enterprise.com",
    };
  }

  /**
   * Publish to Facebook Page Feed API or controlled simulation
   */
  public async publish(
    post: ContentPost,
    account: SocialAccount,
    token: string
  ): Promise<AdapterPublishResponse> {
    const payload = this.formatPayload(post, account);

    // If live token is not a real Meta token, use controlled simulation
    if (token.startsWith("simulated_") || token.includes("mock") || token.length < 20) {
      const providerPostId = `${account.account_or_page_id}_post_${Date.now()}`;
      return {
        success: true,
        providerPostId,
        rateLimitRemaining: 200,
        rawResponse: { id: providerPostId, simulated: true },
      };
    }

    try {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${account.account_or_page_id}/feed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: payload.message,
            link: payload.link,
            access_token: token,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          error: `Facebook Page Feed error (${res.status}): ${errorText}`,
          rawResponse: errorText,
        };
      }

      const json = await res.json();
      return {
        success: true,
        providerPostId: json.id,
        rawResponse: json,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Facebook: ${err.message}`,
      };
    }
  }
}
