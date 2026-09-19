import { db } from "../../database";
import {
  GrowthOsModuleRecord,
  ContentCampaignRecord,
  ContentPostRecord,
  ContentApprovalRecord,
  CrmTaskRecord,
  ContentPostStatus,
  TaskStatus,
  GrowthOsFoundationSummary,
} from "../types";

export class GrowthOsRepository {
  // 1. Modules
  public async getModules(): Promise<GrowthOsModuleRecord[]> {
    const res = await db.query<GrowthOsModuleRecord>(
      `SELECT * FROM growth_os_modules ORDER BY sort_order ASC, name ASC;`
    );
    return res.rows;
  }

  public async getModuleByCode(code: string): Promise<GrowthOsModuleRecord | null> {
    const res = await db.query<GrowthOsModuleRecord>(
      `SELECT * FROM growth_os_modules WHERE code = $1 LIMIT 1;`,
      [code]
    );
    return res.rows[0] || null;
  }

  public async updateModuleStatus(id: string, isActive: boolean): Promise<boolean> {
    const res = await db.query(
      `UPDATE growth_os_modules SET is_active = $1, updated_at = NOW() WHERE id = $2;`,
      [isActive, id]
    );
    return (res.rowCount ?? 0) > 0;
  }

  // 2. Campaigns
  public async createCampaign(data: {
    name: string;
    target_service?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    created_by?: string;
  }): Promise<ContentCampaignRecord> {
    const res = await db.query<ContentCampaignRecord>(
      `INSERT INTO content_campaigns (name, target_service, description, start_date, end_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *;`,
      [
        data.name,
        data.target_service || null,
        data.description || null,
        data.start_date || null,
        data.end_date || null,
        data.status || "active",
        data.created_by || null,
      ]
    );
    return res.rows[0];
  }

  public async getCampaigns(): Promise<ContentCampaignRecord[]> {
    const res = await db.query<ContentCampaignRecord>(
      `SELECT * FROM content_campaigns ORDER BY created_at DESC;`
    );
    return res.rows;
  }

  // 3. Content Posts
  public async createContentPost(data: {
    campaign_id?: string;
    title: string;
    content: string;
    target_platforms?: string[];
    post_type?: string;
    status?: ContentPostStatus;
    scheduled_at?: string;
    ai_model?: string;
    ai_prompt?: string;
    media_urls?: string[];
    tags?: string[];
    created_by?: string;
  }): Promise<ContentPostRecord> {
    const res = await db.query<ContentPostRecord>(
      `INSERT INTO content_posts (
         campaign_id, title, content, target_platforms, post_type, status,
         scheduled_at, ai_model, ai_prompt, media_urls, tags, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *;`,
      [
        data.campaign_id || null,
        data.title,
        data.content,
        JSON.stringify(data.target_platforms || ["linkedin"]),
        data.post_type || "social_post",
        data.status || "DRAFT",
        data.scheduled_at || null,
        data.ai_model || null,
        data.ai_prompt || null,
        JSON.stringify(data.media_urls || []),
        JSON.stringify(data.tags || []),
        data.created_by || null,
      ]
    );
    return res.rows[0];
  }

  public async getContentPosts(filter?: {
    status?: ContentPostStatus;
    campaignId?: string;
    limit?: number;
  }): Promise<ContentPostRecord[]> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (filter?.status) {
      params.push(filter.status);
      clauses.push(`status = $${params.length}`);
    }

    if (filter?.campaignId) {
      params.push(filter.campaignId);
      clauses.push(`campaign_id = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limitClause = filter?.limit ? `LIMIT ${Number(filter.limit)}` : "LIMIT 100";

    const res = await db.query<ContentPostRecord>(
      `SELECT * FROM content_posts ${whereClause} ORDER BY created_at DESC ${limitClause};`,
      params
    );
    return res.rows;
  }

  public async getContentPostById(id: string): Promise<ContentPostRecord | null> {
    const res = await db.query<ContentPostRecord>(
      `SELECT * FROM content_posts WHERE id = $1 LIMIT 1;`,
      [id]
    );
    return res.rows[0] || null;
  }

  public async updateContentPostStatus(
    id: string,
    status: ContentPostStatus,
    scheduledAt?: string,
    publishedAt?: string
  ): Promise<ContentPostRecord | null> {
    const res = await db.query<ContentPostRecord>(
      `UPDATE content_posts
       SET status = $1,
           scheduled_at = COALESCE($2, scheduled_at),
           published_at = COALESCE($3, published_at),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *;`,
      [status, scheduledAt || null, publishedAt || null, id]
    );
    return res.rows[0] || null;
  }

  // 4. Content Approvals
  public async createApproval(data: {
    post_id: string;
    reviewer_id?: string;
    status: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
    feedback?: string;
  }): Promise<ContentApprovalRecord> {
    const res = await db.query<ContentApprovalRecord>(
      `INSERT INTO content_approvals (post_id, reviewer_id, status, feedback)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [data.post_id, data.reviewer_id || null, data.status, data.feedback || null]
    );

    // Synchronize post status
    let postStatus: ContentPostStatus = "DRAFT";
    if (data.status === "APPROVED") postStatus = "APPROVED";
    if (data.status === "REJECTED") postStatus = "REJECTED";
    if (data.status === "CHANGES_REQUESTED") postStatus = "DRAFT";

    await this.updateContentPostStatus(data.post_id, postStatus);

    return res.rows[0];
  }

  public async getApprovalsForPost(postId: string): Promise<ContentApprovalRecord[]> {
    const res = await db.query<ContentApprovalRecord>(
      `SELECT * FROM content_approvals WHERE post_id = $1 ORDER BY reviewed_at DESC;`,
      [postId]
    );
    return res.rows;
  }

  // 5. Tasks & Reminders
  public async createTask(data: {
    title: string;
    description?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    status?: TaskStatus;
    due_date?: string;
    assigned_to?: string;
    lead_id?: string;
    customer_id?: string;
    created_by?: string;
  }): Promise<CrmTaskRecord> {
    const res = await db.query<CrmTaskRecord>(
      `INSERT INTO crm_tasks (title, description, priority, status, due_date, assigned_to, lead_id, customer_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        data.title,
        data.description || null,
        data.priority || "MEDIUM",
        data.status || "PENDING",
        data.due_date || null,
        data.assigned_to || null,
        data.lead_id || null,
        data.customer_id || null,
        data.created_by || null,
      ]
    );
    return res.rows[0];
  }

  public async getTasks(filter?: {
    status?: TaskStatus;
    assignedTo?: string;
    leadId?: string;
    limit?: number;
  }): Promise<CrmTaskRecord[]> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (filter?.status) {
      params.push(filter.status);
      clauses.push(`status = $${params.length}`);
    }

    if (filter?.assignedTo) {
      params.push(filter.assignedTo);
      clauses.push(`assigned_to = $${params.length}`);
    }

    if (filter?.leadId) {
      params.push(filter.leadId);
      clauses.push(`lead_id = $${params.length}`);
    }

    const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const limitClause = filter?.limit ? `LIMIT ${Number(filter.limit)}` : "LIMIT 100";

    const res = await db.query<CrmTaskRecord>(
      `SELECT * FROM crm_tasks ${whereClause} ORDER BY due_date ASC NULLS LAST, created_at DESC ${limitClause};`,
      params
    );
    return res.rows;
  }

  public async updateTaskStatus(id: string, status: TaskStatus): Promise<CrmTaskRecord | null> {
    const completedAt = status === "COMPLETED" ? "NOW()" : "NULL";
    const res = await db.query<CrmTaskRecord>(
      `UPDATE crm_tasks
       SET status = $1,
           completed_at = ${completedAt},
           updated_at = NOW()
       WHERE id = $2
       RETURNING *;`,
      [status, id]
    );
    return res.rows[0] || null;
  }

  // 6. Foundation Summary Metrics
  public async getFoundationSummary(): Promise<GrowthOsFoundationSummary> {
    const [
      campaignsRes,
      postsRes,
      tasksRes,
      modulesRes,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*)::int AS count FROM content_campaigns;`),
      db.query(`SELECT status, COUNT(*)::int AS count FROM content_posts GROUP BY status;`),
      db.query(`SELECT status, priority, COUNT(*)::int AS count FROM crm_tasks GROUP BY status, priority;`),
      db.query(`SELECT is_active, COUNT(*)::int AS count FROM growth_os_modules GROUP BY is_active;`),
    ]);

    const postCounts: Record<string, number> = {};
    for (const row of postsRes.rows) {
      postCounts[row.status] = Number(row.count);
    }

    let openTasks = 0;
    let urgentTasks = 0;
    for (const row of tasksRes.rows) {
      if (row.status !== "COMPLETED" && row.status !== "CANCELLED") {
        openTasks += Number(row.count);
        if (row.priority === "URGENT" || row.priority === "HIGH") {
          urgentTasks += Number(row.count);
        }
      }
    }

    let totalModules = 0;
    let activeModules = 0;
    for (const row of modulesRes.rows) {
      const count = Number(row.count);
      totalModules += count;
      if (row.is_active) {
        activeModules += count;
      }
    }

    return {
      campaignsCount: Number(campaignsRes.rows[0]?.count || 0),
      draftPostsCount: postCounts["DRAFT"] || 0,
      pendingApprovalsCount: postCounts["PENDING_APPROVAL"] || 0,
      scheduledPostsCount: postCounts["SCHEDULED"] || 0,
      publishedPostsCount: postCounts["PUBLISHED"] || 0,
      openTasksCount: openTasks,
      urgentTasksCount: urgentTasks,
      modulesCount: totalModules,
      activeModulesCount: activeModules,
    };
  }
}

export const growthOsRepository = new GrowthOsRepository();
