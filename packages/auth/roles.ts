export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SALES_MANAGER"
  | "SALES_AGENT"
  | "SUPPORT_AGENT"
  | "VIEWER";

export type Permission =
  | "dashboard:view"
  | "leads:view_all"
  | "leads:view_assigned"
  | "leads:create"
  | "leads:edit"
  | "appointments:manage"
  | "appointments:view"
  | "conversations:view"
  | "conversations:takeover"
  | "knowledge:curate"
  | "ai_config:manage"
  | "team:manage"
  | "audit:view"
  | "system:manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "dashboard:view",
    "leads:view_all",
    "leads:create",
    "leads:edit",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
    "knowledge:curate",
    "ai_config:manage",
    "team:manage",
    "audit:view",
    "system:manage",
  ],
  ADMIN: [
    "dashboard:view",
    "leads:view_all",
    "leads:create",
    "leads:edit",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
    "knowledge:curate",
    "ai_config:manage",
    "team:manage",
    "audit:view",
  ],
  SALES_MANAGER: [
    "dashboard:view",
    "leads:view_all",
    "leads:create",
    "leads:edit",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
  ],
  SALES_AGENT: [
    "dashboard:view",
    "leads:view_assigned",
    "leads:create",
    "leads:edit",
    "appointments:manage",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
  ],
  SUPPORT_AGENT: [
    "dashboard:view",
    "appointments:view",
    "conversations:view",
    "conversations:takeover",
  ],
  VIEWER: [
    "dashboard:view",
    "leads:view_all",
    "appointments:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
