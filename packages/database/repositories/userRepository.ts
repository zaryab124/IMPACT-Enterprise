import { db } from "../index";
import { UserRole } from "../../auth/roles";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRoles extends UserRecord {
  roles: UserRole[];
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserWithRoles | null> {
    const userRes = await db.query<UserRecord>(
      "SELECT * FROM users WHERE email = $1 AND is_active = TRUE;",
      [email.toLowerCase().trim()]
    );
    if (userRes.rows.length === 0) return null;

    const user = userRes.rows[0];
    const rolesRes = await db.query<{ role_id: UserRole }>(
      "SELECT role_id FROM user_roles WHERE user_id = $1;",
      [user.id]
    );

    return {
      ...user,
      roles: rolesRes.rows.map((r) => r.role_id),
    };
  },

  async findById(id: string): Promise<UserWithRoles | null> {
    const userRes = await db.query<UserRecord>(
      "SELECT * FROM users WHERE id = $1 AND is_active = TRUE;",
      [id]
    );
    if (userRes.rows.length === 0) return null;

    const user = userRes.rows[0];
    const rolesRes = await db.query<{ role_id: UserRole }>(
      "SELECT role_id FROM user_roles WHERE user_id = $1;",
      [user.id]
    );

    return {
      ...user,
      roles: rolesRes.rows.map((r) => r.role_id),
    };
  },

  async create(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    roles?: UserRole[];
  }): Promise<UserWithRoles> {
    const res = await db.query<UserRecord>(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [data.email.toLowerCase().trim(), data.passwordHash, data.firstName, data.lastName]
    );
    const user = res.rows[0];
    const assignedRoles: UserRole[] = data.roles && data.roles.length > 0 ? data.roles : ["VIEWER"];

    for (const role of assignedRoles) {
      await db.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;",
        [user.id, role]
      );
    }

    return {
      ...user,
      roles: assignedRoles,
    };
  },
};
