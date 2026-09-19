export type UserRole =
  | "SUPER_ADMIN"
  | "CEO"
  | "SALES_MANAGER"
  | "SALES_AGENT"
  | "MARKETING_MANAGER"
  | "CONTENT_MANAGER"
  | "SUPPORT_AGENT"
  | "VIEWER"
  | "ADMIN";

export type Permission =
  // Growth OS CRM Permissions
  | "dashboard:view"
  | "crm:view_all"
  | "crm:view_assigned"
  | "crm:leads_manage"
  | "crm:leads_delete"
  | "crm:deals_manage"
  | "crm:pipeline_move"
  | "crm:tasks_manage"
  | "crm:notes_manage"
  // Content & Marketing Permissions
  | "content:view"
  | "content:create"
  | "content:approve"
  | "social:publish"
  | "campaigns:manage"
  // Analytics, Team & Governance Permissions
  | "analytics:view"
  | "team:manage"
  | "system:manage"
  | "audit:view"
  | "knowledge:curate"
  | "ai_config:manage"
  // Communications & Appointments Permissions
  | "appointments:manage"
  | "appointments:view"
  | "conversations:view"
  | "conversations:takeover"
  // Legacy Aliases for backwards compatibility
  | "leads:view_all"
  | "leads:view_assigned"
  | "leads:create"
  | "leads:edit";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "crm:view_all",
    "crm:view_assigned",
    "crm:leads_manage",
    "crm:leads_delete",
    "crm:deals_manage",
    "crm:pipeline_move",
    "crm:tasks_manage",
    "crm:notes_manage",
    "content:view",
    "content:create",
    "content:approve",
    "social:publish",
    "campaigns:manage",
    "analytics:view",
    "team:manage",
    "system:manage",
    "audit:view",
    "knowledge:curate",
    "ai_config:manage",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
    "leads:view_all",
    "leads:create",
    "leads:edit",
  ],
  CEO: [
    // Full CRM access, analytics, team management, campaigns, content approval
    "dashboard:view",
    "crm:view_all",
    "crm:view_assigned",
    "crm:leads_manage",
    "crm:leads_delete",
    "crm:deals_manage",
    "crm:pipeline_move",
    "crm:tasks_manage",
    "crm:notes_manage",
    "content:view",
    "content:create",
    "content:approve",
    "social:publish",
    "campaigns:manage",
    "analytics:view",
    "team:manage",
    "audit:view",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "leads:view_all",
    "leads:create",
    "leads:edit",
  ],
  SALES_MANAGER: [
    "dashboard:view",
    "crm:view_all",
    "crm:view_assigned",
    "crm:leads_manage",
    "crm:leads_delete",
    "crm:deals_manage",
    "crm:pipeline_move",
    "crm:tasks_manage",
    "crm:notes_manage",
    "analytics:view",
    "team:manage",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
    "leads:view_all",
    "leads:create",
    "leads:edit",
  ],
  SALES_AGENT: [
    // Assigned leads, contacts, activities, tasks, deals, communication history
    "dashboard:view",
    "crm:view_assigned",
    "crm:leads_manage",
    "crm:deals_manage",
    "crm:pipeline_move",
    "crm:tasks_manage",
    "crm:notes_manage",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "leads:view_assigned",
    "leads:create",
    "leads:edit",
  ],
  MARKETING_MANAGER: [
    "dashboard:view",
    "content:view",
    "content:create",
    "content:approve",
    "social:publish",
    "campaigns:manage",
    "analytics:view",
    "crm:view_all",
    "leads:view_all",
  ],
  CONTENT_MANAGER: [
    // Social content, campaigns, content calendar, analytics
    "dashboard:view",
    "content:view",
    "content:create",
    "social:publish",
    "campaigns:manage",
    "analytics:view",
  ],
  SUPPORT_AGENT: [
    "dashboard:view",
    "conversations:view",
    "conversations:takeover",
    "appointments:view",
    "crm:view_all",
    "leads:view_all",
  ],
  VIEWER: [
    // Strictly read-only access across all operational modules
    "dashboard:view",
    "crm:view_all",
    "leads:view_all",
    "appointments:view",
    "conversations:view",
    "analytics:view",
    "content:view",
  ],
  ADMIN: [
    "dashboard:view",
    "crm:view_all",
    "crm:view_assigned",
    "crm:leads_manage",
    "crm:deals_manage",
    "crm:pipeline_move",
    "crm:tasks_manage",
    "crm:notes_manage",
    "content:view",
    "content:create",
    "content:approve",
    "social:publish",
    "campaigns:manage",
    "analytics:view",
    "team:manage",
    "audit:view",
    "knowledge:curate",
    "ai_config:manage",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
    "leads:view_all",
    "leads:create",
    "leads:edit",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(roles: UserRole[], permissions: Permission[]): boolean {
  return roles.some((role) => permissions.some((p) => hasPermission(role, p)));
}

export function hasAllPermissions(roles: UserRole[], permissions: Permission[]): boolean {
  return permissions.every((p) => roles.some((role) => hasPermission(role, p)));
}
