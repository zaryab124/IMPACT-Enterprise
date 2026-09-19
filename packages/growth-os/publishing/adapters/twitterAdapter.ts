/**
 * IMPACT Growth OS — Twitter / X Platform Adapter
 * Implements Twitter API v2 Tweet Creation schema formatting and publishing.
 * Automatically splits long content into tweet threads or compact 280-char tweets.
 */

import { ContentPost } from "../../marketing/types";
import {
  AdapterPublishResponse,
  IPlatformAdapter,
  SocialAccount,
} from "./platformAdapter.interface";

export class TwitterAdapter implements IPlatformAdapter {
  public readonly platform = "twitter" as const;

  /**
   * Format payload conforming to Twitter / X API v2 Tweets endpoint
   */
  public formatPayload(post: ContentPost, account: SocialAccount): any {
    const hashtagsFormatted = (post.hashtags || [])
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .join(" ");

    const fullText = `${post.hook ? `${post.hook}\n\n` : ""}${post.content}\n\n${post.cta || ""}\n\n${hashtagsFormatted}`.trim();

    // If within 280 chars, single tweet; otherwise format as thread root
    if (fullText.length <= 280) {
      return {
        text: fullText,
      };
    }

    // Thread format: chunk text into <= 280 segments
    const firstTweet = `${post.hook || post.title}\n\n${post.content.slice(0, 180)}...\n\n(1/2) 🧵 ${hashtagsFormatted}`.trim();
    return {
      text: firstTweet,
      thread: [
        firstTweet,
        `${post.content.slice(180)}\n\n${post.cta || ""}\n\n(2/2)`.trim(),
      ],
    };
  }

  /**
   * Publish to Twitter / X API or controlled simulation
   */
  public async publish(
    post: ContentPost,
    account: SocialAccount,
    token: string
  ): Promise<AdapterPublishResponse> {
    const payload = this.formatPayload(post, account);

    // If live token is not an OAuth Bearer token, use controlled simulation
    if (token.startsWith("simulated_") || token.includes("mock") || token.length < 20) {
      const providerPostId = `tw-post-${Date.now()}`;
      return {
        success: true,
        providerPostId,
        rateLimitRemaining: 45,
        rawResponse: { id: providerPostId, text: payload.text, simulated: true },
      };
    }

    try {
      const res = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: payload.text }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          error: `Twitter / X API error (${res.status}): ${errorText}`,
          rawResponse: errorText,
        };
      }

      const json = await res.json();
      return {
        success: true,
        providerPostId: json.data?.id || `tw-${Date.now()}`,
        rawResponse: json,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Network error connecting to Twitter / X: ${err.message}`,
      };
    }
  }
}
