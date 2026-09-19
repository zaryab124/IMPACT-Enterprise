"use client";

import React, { useState, useEffect } from "react";
import { Contact, Search, Plus, Mail, Phone, Building2, RefreshCw, X } from "lucide-react";
import { CrmContact } from "@/packages/growth-os/crm";

export default function CrmContactsPage() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    job_title: "",
    city: "",
    country: "",
  });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/contacts${search ? `?search=${encodeURIComponent(search)}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/crm/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });
      if (res.ok) {
        setShowAdd(false);
        setNewContact({ first_name: "", last_name: "", email: "", phone: "", job_title: "", city: "", country: "" });
        fetchContacts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <Contact className="w-4 h-4 text-brand-accent" />
            <span>Contacts Directory</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {contacts.length} Contacts
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Decision makers and primary client stakeholders.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-brand-border text-xs focus:outline-hidden"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent text-white text-xs font-bold hover:bg-brand-accentHover transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-accent mb-2" />
            <span className="text-xs">Loading contacts...</span>
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No contacts found.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface/70 text-[11px] font-bold text-brand-muted uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-brand-surface/40">
                  <td className="py-3 px-4 font-bold text-brand-dark">
                    {c.first_name} {c.last_name}
                  </td>
                  <td className="py-3 px-4 text-brand-charcoal">{c.job_title || "—"}</td>
                  <td className="py-3 px-4 text-brand-muted">{c.email || "—"}</td>
                  <td className="py-3 px-4 font-mono">{c.phone || "—"}</td>
                  <td className="py-3 px-4 text-brand-muted">{[c.city, c.country].filter(Boolean).join(", ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-brand-dark">Add New Contact</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-brand-muted" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <input
                placeholder="First Name *"
                required
                value={newContact.first_name}
                onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <input
                placeholder="Last Name *"
                required
                value={newContact.last_name}
                onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <input
                type="email"
                placeholder="Email *"
                required
                value={newContact.email}
                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <input
                placeholder="Phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <input
                placeholder="Job Title"
                value={newContact.job_title}
                onChange={(e) => setNewContact({ ...newContact, job_title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-brand-border"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-brand-accent text-white font-bold">Save Contact</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
