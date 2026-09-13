import { db } from "../index";

export interface CustomerRecord {
  id: string;
  company_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export const customerRepository = {
  async findById(id: string): Promise<CustomerRecord | null> {
    const res = await db.query<CustomerRecord>("SELECT * FROM customers WHERE id = $1;", [id]);
    return res.rows[0] || null;
  },

  async findByEmail(email: string): Promise<CustomerRecord | null> {
    const res = await db.query<CustomerRecord>("SELECT * FROM customers WHERE email = $1;", [
      email.toLowerCase().trim(),
    ]);
    return res.rows[0] || null;
  },

  async findByPhone(phone: string): Promise<CustomerRecord | null> {
    const cleaned = phone.replace(/[^0-9+]/g, "");
    const res = await db.query<CustomerRecord>(
      "SELECT * FROM customers WHERE phone = $1 OR phone = $2 LIMIT 1;",
      [phone, cleaned]
    );
    return res.rows[0] || null;
  },

  async upsert(data: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    companyId?: string;
    source?: string;
  }): Promise<CustomerRecord> {
    const cleanEmail = data.email.toLowerCase().trim();
    const res = await db.query<CustomerRecord>(
      `INSERT INTO customers (name, email, phone, country, company_id, source)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         phone = COALESCE(EXCLUDED.phone, customers.phone),
         country = COALESCE(EXCLUDED.country, customers.country),
         updated_at = NOW()
       RETURNING *;`,
      [
        data.name,
        cleanEmail,
        data.phone || null,
        data.country || null,
        data.companyId || null,
        data.source || "web_chat",
      ]
    );
    return res.rows[0];
  },

  async list(limit = 50, offset = 0): Promise<CustomerRecord[]> {
    const res = await db.query<CustomerRecord>(
      "SELECT * FROM customers ORDER BY created_at DESC LIMIT $1 OFFSET $2;",
      [limit, offset]
    );
    return res.rows;
  },
};
