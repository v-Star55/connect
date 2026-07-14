import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, CheckCircle2, Clock, Sparkles, Target, ChevronDown } from "lucide-react";
import socket from "../socket";
import { toast } from "react-hot-toast";
import {
  getBucketListApi,
  createBucketListItemApi,
  toggleBucketListItemApi,
  deleteBucketListItemApi,
} from "../api/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface BucketListItem {
  _id: string;
  title: string;
  completed: boolean;
  completedBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  } | null;
  createdBy: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  timeframe: "normal" | "week" | "month" | "year" | "custom";
  startDate: string;
  endDate: string | null;
}

const getUpcomingMonths = () => {
  const months = [];
  const date = new Date();
  for (let i = 1; i <= 12; i++) {
    const futureDate = new Date(date.getFullYear(), date.getMonth() + i, 1);
    const label = `Before ${futureDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
    const value = futureDate.toISOString();
    months.push({ label, value });
  }
  return months;
};
const upcomingMonths = getUpcomingMonths();

interface BucketListPanelProps {
  chatId: string | null;
  currentUserId: string;
  otherUserName: string;
  onClose: () => void;
}

// Timeframe config: colors + emoji
const TIMEFRAME_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string; label: string }> = {
  normal:  { color: "text-slate-300",  bg: "bg-slate-500/15",  border: "border-slate-500/25",  emoji: "∞",  label: "Anytime" },
  week:    { color: "text-cyan-300",   bg: "bg-cyan-500/15",   border: "border-cyan-500/25",   emoji: "⚡", label: "This Week" },
  month:   { color: "text-amber-300",  bg: "bg-amber-500/15",  border: "border-amber-500/25",  emoji: "📅", label: "This Month" },
  year:    { color: "text-rose-300",   bg: "bg-rose-500/15",   border: "border-rose-500/25",   emoji: "🗓️", label: "This Year" },
  custom:  { color: "text-violet-300", bg: "bg-violet-500/15", border: "border-violet-500/25", emoji: "🎯", label: "Target Date" },
};

export default function BucketListPanel({
  chatId,
  currentUserId,
  otherUserName,
  onClose,
}: BucketListPanelProps) {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newTimeframe, setNewTimeframe] = useState<"normal" | "week" | "month" | "year" | "custom">("normal");
  const [selectedMonth, setSelectedMonth] = useState(upcomingMonths[0].value);
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chatId) return;
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getBucketListApi(chatId);
        setItems(data.items || []);
      } catch {
        toast.error("Failed to load bucket list");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const handleBucketListUpdated = (data: any) => {
      if (data.chatId !== chatId) return;
      if (data.action === "add") {
        setItems((prev) => [data.item, ...prev]);
        toast.success(`"${data.item.title}" added by ${otherUserName} ✨`);
      } else if (data.action === "toggle") {
        setItems((prev) => prev.map((item) => (item._id === data.item._id ? data.item : item)));
        if (data.item.completed) toast.success(`"${data.item.title}" completed! 🎉`);
      } else if (data.action === "delete") {
        setItems((prev) => prev.filter((item) => item._id !== data.itemId));
      }
    };
    socket.on("bucketListUpdated", handleBucketListUpdated);
    return () => { socket.off("bucketListUpdated", handleBucketListUpdated); };
  }, [chatId, otherUserName]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId || !newTitle.trim() || submitting) return;
    try {
      setSubmitting(true);
      const customEndDate = newTimeframe === "custom" ? selectedMonth : undefined;
      const res = await createBucketListItemApi(chatId, newTitle.trim(), newTimeframe, customEndDate);
      const createdItem = res.item;
      setItems((prev) => [createdItem, ...prev]);
      socket.emit("bucketListUpdate", { chatId, action: "add", item: createdItem });
      setNewTitle("");
      setNewTimeframe("normal");
      toast.success("Goal added! 🎯");
    } catch {
      toast.error("Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!chatId) return;
    try {
      const res = await toggleBucketListItemApi(itemId);
      const updatedItem = res.item;
      setItems((prev) => prev.map((item) => (item._id === itemId ? updatedItem : item)));
      socket.emit("bucketListUpdate", { chatId, action: "toggle", item: updatedItem });
      if (updatedItem.completed) toast.success("Goal completed! 🎉");
    } catch {
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!chatId) return;
    try {
      await deleteBucketListItemApi(itemId);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      socket.emit("bucketListUpdate", { chatId, action: "delete", itemId });
      toast.success("Item removed");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const getTimeframeBadge = (item: BucketListItem) => {
    const isExpired = item.endDate && new Date(item.endDate) < new Date() && !item.completed;
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
          ⏰ Overdue
        </span>
      );
    }

    const cfg = TIMEFRAME_CONFIG[item.timeframe] ?? TIMEFRAME_CONFIG.normal;
    let label = cfg.label;
    if (item.timeframe === "custom" && item.endDate) {
      label = `Before ${new Date(item.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
        {cfg.emoji} {label}
      </span>
    );
  };

  const getDeadlineDays = (item: BucketListItem) => {
    if (!item.endDate || item.completed) return null;
    const diff = new Date(item.endDate).getTime() - Date.now();
    if (diff < 0) return null;
    const days = Math.ceil(diff / 86400000);
    if (days <= 1) return "Ends today";
    if (days <= 7) return `${days}d left`;
    if (days <= 30) return `${Math.ceil(days / 7)}w left`;
    return `${Math.ceil(days / 30)}mo left`;
  };

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.completed).length;
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const activeItems = items.filter((i) => !i.completed);
  const completedList = items.filter((i) => i.completed);

  // SVG circle progress ring
  const R = 22;
  const CIRC = 2 * Math.PI * R;
  const dash = (pct / 100) * CIRC;

  return (
    <div
      className="flex flex-col h-full text-white overflow-hidden"
      style={{ background: "linear-gradient(160deg, #06020f 0%, #0d0820 50%, #08040f 100%)" }}
    >
      {/* ── HEADER ── */}
      <div
        className="shrink-0 px-4 pt-4 pb-3"
        style={{ borderBottom: "1px solid rgba(139,92,246,0.12)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600/40 to-indigo-700/40 border border-violet-500/40 shadow-lg shadow-violet-500/10">
                <Target className="w-4 h-4 text-violet-300" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border border-black/40" />
            </div>
            <div>
              <p className="text-[10px] text-white/35 font-semibold uppercase tracking-widest leading-none mb-0.5">
                Shared with {otherUserName}
              </p>
              <h3 className="text-sm font-black tracking-wide bg-gradient-to-r from-violet-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent leading-none">
                Bucket List
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/8">
                <svg width="28" height="28" viewBox="0 0 56 56" className="-rotate-90">
                  <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r={R} fill="none"
                    stroke="url(#pg)" strokeWidth="4"
                    strokeDasharray={`${dash} ${CIRC}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                  <defs>
                    <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-right leading-none">
                  <p className="text-[11px] font-black text-violet-300">{pct}%</p>
                  <p className="text-[9px] text-white/35 font-semibold">{completedItems}/{totalItems}</p>
                </div>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/8 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">

        {/* ── ADD FORM ── */}
        <form
          onSubmit={handleAddItem}
          className="rounded-2xl overflow-hidden border transition-all duration-200"
          style={{
            background: formOpen
              ? "linear-gradient(135deg, rgba(139,92,246,0.09) 0%, rgba(99,102,241,0.05) 100%)"
              : "transparent",
            borderColor: formOpen ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)",
          }}
        >
          {/* Toggle button — the entire header row */}
          <button
            type="button"
            onClick={() => {
              setFormOpen((o) => !o);
              if (!formOpen) setTimeout(() => titleInputRef.current?.focus(), 150);
            }}
            className="w-full px-4 py-3 flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-white/4 group"
          >
            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 ${
              formOpen
                ? "bg-violet-500/30 border border-violet-500/50"
                : "bg-white/6 border border-white/10 group-hover:bg-violet-500/15 group-hover:border-violet-500/30"
            }`}>
              <Plus className={`w-3 h-3 transition-all duration-200 ${
                formOpen ? "text-violet-300 rotate-45" : "text-white/50 group-hover:text-violet-300"
              }`} />
            </div>
            <span className={`text-xs font-bold tracking-wide transition-colors duration-150 flex-1 text-left ${
              formOpen ? "text-violet-300" : "text-white/45 group-hover:text-white/70"
            }`}>
              {formOpen ? "New Goal" : "Add a goal…"}
            </span>
            {formOpen && <Sparkles className="w-3 h-3 text-violet-400/60" />}
            <ChevronDown className={`w-3.5 h-3.5 text-white/30 transition-transform duration-200 ${
              formOpen ? "rotate-180 text-violet-400/60" : ""
            }`} />
          </button>

          {/* Collapsible body — always rendered, animated via max-height + opacity */}
          <div
            style={{
              maxHeight: formOpen ? "400px" : "0px",
              opacity: formOpen ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
              borderTop: formOpen ? "1px solid rgba(139,92,246,0.10)" : "none",
            }}
          >
            <div className="px-3.5 pb-3.5 space-y-3">
              {/* Title input */}
              <div className="pt-3">
                <input
                  ref={titleInputRef}
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Go paragliding together 🪂"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/40 focus:bg-white/6 transition-all"
                />
              </div>

              {/* Selects row */}
              <div className="flex gap-2">
                <div className="flex-1 min-w-0">
                  <Select value={newTimeframe} onValueChange={(val) => setNewTimeframe(val as any)}>
                    <SelectTrigger className="w-full bg-white/4 border border-white/8 rounded-xl text-xs text-white/80 h-9 hover:bg-white/8 focus:ring-0 focus:border-violet-500/30 select-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#14092a] border border-violet-500/20 rounded-xl text-white p-1 shadow-2xl backdrop-blur-2xl z-[9999]">
                      <SelectItem value="normal"  className="text-xs cursor-pointer rounded-lg text-white/80">∞ No deadline</SelectItem>
                      <SelectItem value="week"    className="text-xs cursor-pointer rounded-lg text-white/80">⚡ This week</SelectItem>
                      <SelectItem value="month"   className="text-xs cursor-pointer rounded-lg text-white/80">📅 This month</SelectItem>
                      <SelectItem value="year"    className="text-xs cursor-pointer rounded-lg text-white/80">🗓️ This year</SelectItem>
                      <SelectItem value="custom"  className="text-xs cursor-pointer rounded-lg text-white/80">🎯 Pick a month…</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newTimeframe === "custom" && (
                  <div className="flex-1 min-w-0">
                    <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val || "")}>
                      <SelectTrigger className="w-full bg-white/4 border border-violet-500/25 rounded-xl text-xs text-violet-200 h-9 hover:bg-white/8 focus:ring-0 select-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#14092a] border border-violet-500/20 rounded-xl text-white p-1 shadow-2xl backdrop-blur-2xl max-h-52 overflow-y-auto z-[9999]">
                        {upcomingMonths.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-xs cursor-pointer rounded-lg text-white/80">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !newTitle.trim()}
                className="w-full h-9 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-500/20"
              >
                {submitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Bucket List</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ── ITEMS ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 border-2 border-violet-500/40 border-t-violet-400 rounded-full animate-spin" />
            <p className="text-[11px] text-white/30">Loading goals…</p>
          </div>

        ) : totalItems === 0 ? (
          <div className="flex flex-col items-center text-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-600/15 to-indigo-700/10 border border-violet-500/20 mb-4 text-2xl">
              🎯
            </div>
            <p className="text-xs font-bold text-white/60">No goals yet!</p>
            <p className="text-[10px] text-white/30 mt-1 max-w-[180px] leading-relaxed">
              Add goals you and <span className="text-violet-300">{otherUserName}</span> want to achieve together.
            </p>
          </div>

        ) : (
          <div className="space-y-5">

            {/* Active items */}
            {activeItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-0.5">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">
                    To Do
                  </span>
                  <span className="text-[9px] font-bold text-violet-400/60 bg-violet-500/10 rounded-full px-1.5 py-0.5">
                    {activeItems.length}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {activeItems.map((item) => {
                  const deadline = getDeadlineDays(item);
                  const isExpired = item.endDate && new Date(item.endDate) < new Date();
                  return (
                    <div
                      key={item._id}
                      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                        isExpired
                          ? "bg-red-500/5 border-red-500/15 hover:border-red-500/25"
                          : "bg-white/[0.03] border-white/7 hover:bg-white/[0.05] hover:border-white/12"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleItem(item._id)}
                        className="mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 border-white/20 hover:border-violet-400 flex items-center justify-center transition-all cursor-pointer hover:bg-violet-500/10 group/cb"
                        title="Mark complete"
                      >
                        <div className="w-2 h-2 rounded-full bg-violet-400 opacity-0 group-hover/cb:opacity-100 scale-0 group-hover/cb:scale-100 transition-all" />
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white/90 leading-snug break-words pr-6">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {getTimeframeBadge(item)}
                          {deadline && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-white/35 font-semibold">
                              <Clock className="w-2.5 h-2.5" />
                              {deadline}
                            </span>
                          )}
                          <span className="text-[9px] text-white/25">
                            · {item.createdBy._id === currentUserId ? "You" : otherUserName}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Completed items */}
            {completedList.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-0.5">
                  <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">
                    Completed
                  </span>
                  <span className="text-[9px] font-bold text-emerald-400/60 bg-emerald-500/10 rounded-full px-1.5 py-0.5">
                    {completedList.length}
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {completedList.map((item) => (
                  <div
                    key={item._id}
                    className="group relative flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/10 hover:border-emerald-500/20 transition-all"
                  >
                    {/* Checkmark */}
                    <button
                      onClick={() => handleToggleItem(item._id)}
                      className="mt-0.5 shrink-0 cursor-pointer"
                      title="Mark incomplete"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/15" />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/35 line-through break-words pr-6 leading-snug">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/12 text-emerald-400 border border-emerald-500/20">
                          ✓ Done
                        </span>
                        <span className="text-[9px] text-white/25">
                          · {item.completedBy?._id === currentUserId ? "You" : otherUserName}
                        </span>
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
