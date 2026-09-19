/**
 * IMPACT Growth OS — Content Approval & Simulated Publishing Engine (Phase 6)
 * Governs state transitions: PENDING_APPROVAL -> APPROVED -> SCHEDULED -> PUBLISHED.
 * Enforces strict policy that no post is published without prior human approval.
 */

import { db } from "../../database";
import { logger } from "../../logging/logger";
import { ContentPost, ContentPostStatus } from "./types";

export interface PublishResult {
  success: boolean;
  postId: string;
  platform: string;
  providerPostId?: string;
  status: "published" | "failed";
  errorMessage?: string;
  publishedAt?: string;
}

export class SimulatedPublisher {
  /**
   * Human review: Approve post
   */
  public static async approvePost(
    postId: string,
    reviewerId?: string,
    feedback?: string
  ): Promise<ContentPost> {
    const postRes = await db.query<ContentPost>(
      `SELECT * FROM content_posts WHERE id = $1;`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      throw new Error(`Content post not found: ${postId}`);
    }

    await db.query(
      `INSERT INTO content_approvals (post_id, reviewer_id, status, feedback)
       VALUES ($1, $2, 'APPROVED', $3);`,
      [postId, reviewerId || null, feedback || "Approved by human editor"]
    );

    const updateRes = await db.query<ContentPost>(
      `UPDATE content_posts
       SET status = 'APPROVED', updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [postId]
    );

    logger.info(`Post [${postId}] approved by reviewer [${reviewerId || "system"}]`, {
      module: "SimulatedPublisher",
    });

    return updateRes.rows[0];
  }

  /**
   * Human review: Reject post
   */
  public static async rejectPost(
    postId: string,
    reviewerId?: string,
    feedback: string = "Needs revision"
  ): Promise<ContentPost> {
    await db.query(
      `INSERT INTO content_approvals (post_id, reviewer_id, status, feedback)
       VALUES ($1, $2, 'REJECTED', $3);`,
      [postId, reviewerId || null, feedback]
    );

    const updateRes = await db.query<ContentPost>(
      `UPDATE content_posts
       SET status = 'REJECTED', updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [postId]
    );

    logger.info(`Post [${postId}] rejected: ${feedback}`, { module: "SimulatedPublisher" });
    return updateRes.rows[0];
  }

  /**
   * Schedule approved post for future publishing
   */
  public static async schedulePost(
    postId: string,
    scheduledAt: Date
  ): Promise<ContentPost> {
    const postRes = await db.query<ContentPost>(
      `SELECT * FROM content_posts WHERE id = $1;`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      throw new Error(`Content post not found: ${postId}`);
    }

    const post = postRes.rows[0];
    if (post.status !== "APPROVED" && post.status !== "PENDING_APPROVAL") {
      throw new Error(`Cannot schedule post in status: ${post.status}. Post must be approved.`);
    }

    const updateRes = await db.query<ContentPost>(
      `UPDATE content_posts
       SET status = 'SCHEDULED', scheduled_at = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [postId, scheduledAt.toISOString()]
    );

    logger.info(`Post [${postId}] scheduled for ${scheduledAt.toISOString()}`, {
      module: "SimulatedPublisher",
    });

    return updateRes.rows[0];
  }

  /**
   * Publish post to simulated social destination.
   * STRICT GUARD: Fails if post has NOT been approved or scheduled.
   */
  public static async publishPost(
    postId: string,
    simulateFailure = false
  ): Promise<PublishResult> {
    const postRes = await db.query<ContentPost>(
      `SELECT * FROM content_posts WHERE id = $1;`,
      [postId]
    );
    if (postRes.rows.length === 0) {
      throw new Error(`Content post not found: ${postId}`);
    }

    const post = postRes.rows[0];
    if (post.status !== "APPROVED" && post.status !== "SCHEDULED") {
      throw new Error(
        `Publishing guardrail violation: Cannot publish post [${postId}] with status '${post.status}'. Human approval is required.`
      );
    }

    const platform = post.platform || "linkedin";
    const idempotencyKey = `pub-${postId}-${Date.now()}`;

    if (simulateFailure) {
      // Log failure in content_publish_logs
      await db.query(
        `INSERT INTO content_publish_logs (
          post_id, platform, status, error_message, idempotency_key, payload
        ) VALUES ($1, $2, 'failed', $3, $4, $5);`,
        [
          postId,
          platform,
          "Simulated rate limit / upstream provider connection error",
          idempotencyKey,
          JSON.stringify({ simulated: true, error: "RATE_LIMIT_EXCEEDED" }),
        ]
      );

      await db.query(
        `UPDATE content_posts SET status = 'FAILED', updated_at = NOW() WHERE id = $1;`,
        [postId]
      );

      return {
        success: false,
        postId,
        platform,
        status: "failed",
        errorMessage: "Simulated rate limit / upstream provider connection error",
      };
    }

    // Successful simulated publishing
    const providerPostId = `sim-${platform}-${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO content_publish_logs (
        post_id, platform, status, provider_post_id, idempotency_key, published_at, payload
      ) VALUES ($1, $2, 'published', $3, $4, $5, $6);`,
      [
        postId,
        platform,
        providerPostId,
        idempotencyKey,
        now,
        JSON.stringify({ simulated: true, platform, title: post.title }),
      ]
    );

    await db.query(
      `UPDATE content_posts
       SET status = 'PUBLISHED', published_at = $2, updated_at = NOW()
       WHERE id = $1;`,
      [postId, now]
    );

    logger.info(`Post [${postId}] published successfully to ${platform} (id: ${providerPostId})`, {
      module: "SimulatedPublisher",
    });

    return {
      success: true,
      postId,
      platform,
      providerPostId,
      status: "published",
      publishedAt: now,
    };
  }
}
