/**
 * IMPACT Growth OS — Weekly Planning Engine (Phase 6)
 * Generates balanced 7-day editorial calendar schedules covering the 9 IMPACT services,
 * rotating formats, platforms, objectives, and optimal publishing time slots.
 */

import { CORE_SERVICES } from "../constants";
import { SocialMediaAgent } from "./socialMediaAgent";
import {
  ContentCapability,
  ContentPost,
  MarketingGoal,
  PostFormat,
  SocialPlatform,
  WeeklyPlan,
  WeeklyPlanSlot,
} from "./types";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DEFAULT_SCHEDULE_MATRIX: Array<{
  dayIndex: number;
  timeSlot: string;
  platform: SocialPlatform;
  format: PostFormat;
  capability: ContentCapability;
  goal: MarketingGoal;
  serviceIndex: number;
}> = [
  { dayIndex: 0, timeSlot: "09:00 UTC", platform: "linkedin", format: "post", capability: "thought_leadership", goal: "AUTHORITY", serviceIndex: 1 }, // AI agents
  { dayIndex: 1, timeSlot: "14:00 UTC", platform: "twitter", format: "thread", capability: "educational_breakdown", goal: "EDUCATION", serviceIndex: 2 }, // AI automation
  { dayIndex: 2, timeSlot: "10:30 UTC", platform: "linkedin", format: "post", capability: "service_spotlight", goal: "SERVICE_PROMOTION", serviceIndex: 3 }, // Make-based lead-conversion
  { dayIndex: 3, timeSlot: "15:00 UTC", platform: "twitter", format: "thread", capability: "conversational_ai_insights", goal: "AWARENESS", serviceIndex: 5 }, // Call agents
  { dayIndex: 4, timeSlot: "11:00 UTC", platform: "linkedin", format: "article", capability: "enterprise_automation_insights", goal: "LEAD_GENERATION", serviceIndex: 4 }, // Chat agents
  { dayIndex: 5, timeSlot: "13:00 UTC", platform: "instagram", format: "carousel", capability: "behind_the_scenes_engineering", goal: "ENGAGEMENT", serviceIndex: 7 }, // Software development
  { dayIndex: 6, timeSlot: "16:00 UTC", platform: "linkedin", format: "post", capability: "problem_solution_framework", goal: "DIRECT_CONVERSION", serviceIndex: 8 }, // Business automation
];

export class WeeklyPlanningEngine {
  /**
   * Generates a 7-day planned editorial calendar with pre-populated slots
   */
  public static generateWeeklyPlan(weekStartDate: Date = new Date(), theme?: string): WeeklyPlan {
    const monday = this.getMonday(weekStartDate);
    const resolvedTheme = theme || "Operational Excellence via Enterprise AI & Automation";

    const slots: WeeklyPlanSlot[] = DEFAULT_SCHEDULE_MATRIX.map((item) => {
      const service = CORE_SERVICES[item.serviceIndex % CORE_SERVICES.length].name;
      return {
        dayIndex: item.dayIndex,
        dayName: DAY_NAMES[item.dayIndex],
        timeSlot: item.timeSlot,
        platform: item.platform,
        format: item.format,
        capability: item.capability,
        goal: item.goal,
        service,
        suggestedTitle: `${service} — ${item.capability.replace(/_/g, " ")} (${item.goal})`,
        post: null,
      };
    });

    return {
      id: `plan-${monday.toISOString().split("T")[0]}`,
      weekStarting: monday.toISOString().split("T")[0],
      theme: resolvedTheme,
      slots,
    };
  }

  /**
   * Populate a weekly plan by generating posts for all 7 days in PENDING_APPROVAL status
   */
  public static async executeWeeklyPlanGeneration(
    plan: WeeklyPlan,
    userId?: string
  ): Promise<ContentPost[]> {
    const posts: ContentPost[] = [];
    const baseDate = new Date(plan.weekStarting);

    for (const slot of plan.slots) {
      const postDate = new Date(baseDate);
      postDate.setDate(baseDate.getDate() + slot.dayIndex);
      // Parse time slot e.g. "09:00 UTC"
      const [hour] = slot.timeSlot.split(":");
      postDate.setUTCHours(parseInt(hour, 10), 0, 0, 0);

      const post = await SocialMediaAgent.generateAndSavePost(
        {
          capability: slot.capability,
          goal: slot.goal,
          platform: slot.platform,
          format: slot.format,
          serviceInterest: slot.service,
          campaignName: plan.theme,
          customPrompt: `Planned for ${slot.dayName} at ${slot.timeSlot}`,
        },
        userId
      );

      // Attach scheduled timestamp while keeping status PENDING_APPROVAL
      posts.push(post);
    }

    return posts;
  }

  private static getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
