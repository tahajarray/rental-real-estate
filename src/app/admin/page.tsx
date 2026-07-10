"use client";

import { AdminRoute } from "@/components/ProtectedRoute";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldOff,
  Building2,
  ScrollText,
  UserRound,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth, type User } from "@/context/AuthContext";
import { getAuditLogs, AUDIT_ACTION_LABELS, type AuditLogEntry } from "@/lib/audit";
import { PhoneInputTN, isValidTNPhone, TN_PHONE_ERROR, formatTNPhone } from "@/components/PhoneInputTN";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface WorkerFormState {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const EMPTY_FORM: WorkerFormState = { name: "", email: "", phone: "", password: "" };

function AdminDashboard() {
  const router = useRouter();
  const { user, getWorkers, createWorker, setWorkerActive } = useAuth();
  const [workers, setWorkers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<WorkerFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = () => {
    setWorkers(getWorkers());
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const active = workers.filter((a) => a.active !== false).length;
    return {
      total: workers.length,
      active,
      inactive: workers.length - active,
      events: logs.length,
    };
  }, [workers, logs]);

  // Group the audit log by who did it, most-recently-active person first —
  // this is what makes the feed "organized by worker" instead of one long
  // mixed chronological list.
  const groupedLogs = useMemo(() => {
    const groups = new Map<string, { actorName: string; actorRole: string; entries: AuditLogEntry[] }>();
    for (const log of logs) {
      if (!groups.has(log.actorName)) {
        groups.set(log.actorName, { actorName: log.actorName, actorRole: log.actorRole, entries: [] });
      }
      groups.get(log.actorName)!.entries.push(log);
    }
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.entries[0].timestamp).getTime() - new Date(a.entries[0].timestamp).getTime()
    );
  }, [logs]);

  const initials = (name: string) =>
    name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const STAT_CARDS = [
    { label: "Total Workers", value: stats.total, icon: Users, color: "#2563EB", bg: "#EFF6FF" },
    { label: "Active", value: stats.active, icon: ShieldCheck, color: "#10B981", bg: "#ECFDF5" },
    { label: "Deactivated", value: stats.inactive, icon: ShieldOff, color: "#EF4444", bg: "#FEF2F2" },
    { label: "Audit Events", value: stats.events, icon: ScrollText, color: "#8B5CF6", bg: "#F5F3FF" },
  ];

  const handleToggleActive = async (worker: User) => {
    const nextActive = !(worker.active !== false);
    const result = await setWorkerActive(worker.id, nextActive);
    if (result.success) refresh();
  };

  const jumpToActivity = (workerName: string) => {
    const el = document.getElementById(`activity-${encodeURIComponent(workerName)}`);
    if (el) {
      if (el instanceof HTMLDetailsElement) el.open = true;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.email || !form.phone || !form.password) {
      setFormError("All fields are required.");
      return;
    }
    if (!isValidTNPhone(form.phone)) {
      setFormError(TN_PHONE_ERROR);
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    setSubmitting(true);
    const result = await createWorker(form.name, form.email, formatTNPhone(form.phone), form.password);
    setSubmitting(false);
    if (!result.success) {
      setFormError(result.message || "Could not create worker.");
      return;
    }
    setForm(EMPTY_FORM);
    setAddOpen(false);
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-[#1F2937] font-bold" style={{ fontSize: "1.75rem" }}>Admin Dashboard</h1>
            <p className="text-[#64748B] text-sm mt-1">
              You supervise every worker in the system, {user?.name.split(" ")[0]}.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/worker")}
              variant="outline"
              className="rounded-xl border-[#E2E8F0] flex items-center gap-2"
            >
              <Building2 size={16} /> Worker Dashboard
            </Button>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex items-center gap-2"
            >
              <UserPlus size={16} /> New Worker
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <div className="font-bold text-[#1F2937]" style={{ fontSize: "1.4rem" }}>{value}</div>
              <div className="text-[#64748B] text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Workers list */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <Users size={17} className="text-[#2563EB]" />
            <h2 className="font-semibold text-[#1F2937]">Workers {workers.length > 0 && `(${workers.length})`}</h2>
          </div>
          {workers.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#94A3B8] text-sm">
              No workers yet. Create the first one to get started.
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {workers.map((worker) => {
                const active = worker.active !== false;
                return (
                  <div key={worker.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                      <UserRound size={18} className="text-[#2563EB]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-[#1F2937] text-sm truncate">{worker.name}</h3>
                        <Badge variant={active ? "default" : "destructive"} className={active ? "bg-[#ECFDF5] text-[#10B981] border-transparent" : ""}>
                          {active ? "Active" : "Deactivated"}
                        </Badge>
                      </div>
                      <div className="text-[#64748B] text-xs mt-0.5 truncate">{worker.email} · {worker.phone}</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => jumpToActivity(worker.name)}
                        className="text-[#2563EB] hover:text-[#1D4ED8] text-xs font-medium transition-colors"
                      >
                        View Activity
                      </button>
                      <span className="text-xs text-[#94A3B8]">{active ? "On" : "Off"}</span>
                      <Switch checked={active} onCheckedChange={() => handleToggleActive(worker)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Audit log — grouped by worker */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <ScrollText size={17} className="text-[#8B5CF6]" />
            <h2 className="font-semibold text-[#1F2937]">
              Activity by Worker {logs.length > 0 && `(${logs.length})`}
            </h2>
          </div>
          {groupedLogs.length === 0 ? (
            <div className="px-5 py-10 text-center text-[#94A3B8] text-sm">No activity recorded yet.</div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {groupedLogs.map((group, i) => (
                <details key={group.actorName} id={`activity-${encodeURIComponent(group.actorName)}`} open={i === 0} className="group/details">
                  <summary className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none list-none hover:bg-[#F8FAFC] transition-colors">
                    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                      {initials(group.actorName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-[#1F2937] text-sm">{group.actorName}</h3>
                        <Badge variant="default" className="bg-[#F5F3FF] text-[#8B5CF6] border-transparent capitalize">
                          {group.actorRole}
                        </Badge>
                        <span className="text-[#94A3B8] text-xs">
                          {group.entries.length} action{group.entries.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-[#94A3B8] text-xs mt-0.5">
                        Last active {timeAgo(group.entries[0].timestamp)}
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-[#94A3B8] transition-transform group-open/details:rotate-180 flex-shrink-0" />
                  </summary>
                  <div className="divide-y divide-[#F1F5F9] bg-[#F8FAFC]/60">
                    {group.entries.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 pl-16 pr-5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-[#1F2937]">
                            {AUDIT_ACTION_LABELS[log.action]}
                            {log.targetName && <> · <span className="font-medium">{log.targetName}</span></>}
                          </p>
                          {log.details && <p className="text-xs text-[#94A3B8] mt-0.5 truncate">{log.details}</p>}
                        </div>
                        <div className="text-[#94A3B8] flex-shrink-0" style={{ fontSize: "0.72rem" }}>
                          {timeAgo(log.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Add worker dialog */}
        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) { setForm(EMPTY_FORM); setFormError(""); } }}>
          <DialogContent className="rounded-2xl border border-[#E2E8F0]">
            <DialogHeader>
              <DialogTitle>Create Worker Account</DialogTitle>
              <DialogDescription>
                New workers are automatically linked to you as their admin and start active.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="worker-name" className="text-sm font-medium mb-1.5 block">Full name</Label>
                <Input
                  id="worker-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl border-[#E2E8F0]"
                  placeholder="e.g. Sarah Ben Ali"
                />
              </div>
              <div>
                <Label htmlFor="worker-email" className="text-sm font-medium mb-1.5 block">Email</Label>
                <Input
                  id="worker-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border-[#E2E8F0]"
                  placeholder="worker@nestfinder.com"
                />
              </div>
              <div>
                <Label htmlFor="worker-phone" className="text-sm font-medium mb-1.5 block">Phone</Label>
                <PhoneInputTN
                  id="worker-phone"
                  value={form.phone}
                  onChange={(digits) => setForm({ ...form, phone: digits })}
                />
              </div>
              <div>
                <Label htmlFor="worker-password" className="text-sm font-medium mb-1.5 block">Temporary password</Label>
                <Input
                  id="worker-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="rounded-xl border-[#E2E8F0]"
                  placeholder="At least 6 characters"
                />
              </div>
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">
                  {formError}
                </div>
              )}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl">
                  {submitting ? "Creating..." : "Create Worker"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function admin_Guard() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
