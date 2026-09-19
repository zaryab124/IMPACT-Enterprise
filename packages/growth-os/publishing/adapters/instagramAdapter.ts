/**
 * IMPACT Growth OS — Instagram Platform Adapter
 * Implements Meta Graph API Instagram Content Publishing schema.
 * Formats visual briefs, carousel slides, and up to 30 strategic hashtags.
 */

import { ContentPost } from "../../marketing/types";
import {
  AdapterPublishResponse,
  IPlatformAdapter,
  SocialAccount,
} from "./platformAdapter.interface";

export class InstagramAdapter implements IPlatformAdapter {
  public readonly platform = "instagram" as const;

  /**
   * Format payload conforming to Instagram Graph API Container schema
   */
  public formatPayload(post: ContentPost, account: SocialAccount): any {
    const hashtagsFormatted = (post.hashtags || [])
      .slice(0, 30) // Instagram allows up to 30 hashtags
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(" ");

    const caption = `${post.hook ? `✨ ${post.hook}\n\n` : ""}${post.content}\n\n${post.cta ? `👉 ${post.cta}\n\n` : ""}${hashtagsFormatted}`.trim();

    return {
      instagram_account_id: account.account_or_page_id,
      caption,
      media_type: post.format === "carousel" ? "CAROUSEL" : "IMAGE",
      visual_brief: post.visual_brief || "Clean IMPACT Enterprise branded visual with modern typography.",
    };
  }

  /**
   * Publish to Instagram Graph API or controlled simulation
   */
  public async publish(
    post: ContentPost,
    account: SocialAccount,
    token: string
  ): Promise<AdapterPublishResponse> {
    const payload = this.formatPayload(post, account);

    // If live token is not a real Meta token, use controlled simulation
    if (token.startsWith("simulated_") || token.includes("mock") || token.length < 20) {
      const providerPostId = `ig-media-${Date.now()}`;
      return {
        success: true,
        providerPostId,
        rateLimitRemaining: 200,
        rawResponse: { id: providerPostId, media_type: payload.media_type, simulated: true },
      };
    }

    try {
      // Step 1: Create media container
      const containerRes = await fetch(
        `https://graph.facebook.com/v19.0/${account.account_or_page_id}/media`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caption: payload.caption,
            access_token: token,
          }),
        }
      );

      if (!containerRes.ok) {
        const errorText = await containerRes.text();
        return {
          success: false,
          error: `Instagram Media Container error (${containerRes.status}): ${errorText}`,
          rawResponse: errorText,
        };
      }

      const containerJson = await containerRes.json();
      const creationId = containerJson.id;

      // Step 2: Publish container
      const publishRes = await fetch(
        `https://graph.facebook.com/v19.0/${account.account_or_page_id}/media_publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: token,
          }),
        }
      );

      if (!publishRes.ok) {
        const errorText = await publishRes.text();
        return {
          success: false,
          error: `Instagram Media Publish error (${publishRes.status}): ${errorText}`,
          rawResponse: errorText,
        };
      }

      const publishJson = await publishRes.json();
      return {
        success: true,
        providerPostId: publishJson.id || creationId,
        rawResponse: publishJson,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Instagram: ${err.message}`,
      };
    }
  }
}
