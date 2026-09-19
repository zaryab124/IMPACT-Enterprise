"use client";

import React, { useState, useEffect } from "react";
import { CheckSquare, Plus, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { CrmTaskExtended } from "@/packages/growth-os/crm";

export default function CrmTasksPage() {
  const [tasks, setTasks] = useState<CrmTaskExtended[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crm/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const res = await fetch(`/api/crm/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-brand-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-brand-dark flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand-accent" />
            <span>Tasks & Follow-up Reminders</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-surface text-brand-charcoal">
              {tasks.length} Tasks
            </span>
          </h2>
          <p className="text-xs text-brand-muted mt-0.5">Execution items, proposal deadlines, and follow-up reminders.</p>
        </div>
        <button
          onClick={fetchTasks}
          className="p-2 rounded-xl border border-brand-border text-brand-charcoal hover:bg-brand-surface"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white border border-brand-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-brand-muted text-xs">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-brand-muted text-xs">No tasks recorded.</div>
        ) : (
          <div className="divide-y divide-brand-border">
            {tasks.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-brand-surface/40 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleComplete(t.id, t.status)}
                    className="text-brand-muted hover:text-brand-accent"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${t.status === "COMPLETED" ? "text-emerald-500 fill-emerald-100" : ""}`}
                    />
                  </button>
                  <div className="space-y-0.5">
                    <span className={`font-bold ${t.status === "COMPLETED" ? "line-through text-brand-muted" : "text-brand-dark"}`}>
                      {t.title}
                    </span>
                    <span className="text-[11px] text-brand-muted font-mono block">
                      Due: {t.due_date ? new Date(t.due_date).toLocaleString() : "No deadline"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      t.priority === "URGENT"
                        ? "bg-rose-100 text-rose-800"
                        : t.priority === "HIGH"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
