import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi, updateVibeApi } from "../api/api";
import { 
  Edit2, Save, Flame, Zap, Star, Camera, Check, Search, 
  Award, Sparkles, X, MessageSquare, Trophy, Clock
} from "lucide-react";
import { useDispatch } from "react-redux";
import { login } from "../slice/auth/authSlice";
import toast from "react-hot-toast";

const VIBES = [
  "😎 Chill", "🌿 Peaceful", "🌙 Low-Key", "🧘 Zen", "☕ Cozy", "🔥 Hype",
  "⚡ Electric", "🎉 Party Mode", "😜 Goofy", "💃 Vibing", "🚀 Hustle",
  "📚 Studying", "💼 Working", "🧠 Deep Focus", "⏳ Busy", "🛸 Alien Mode",
  "🐙 Squishy", "🍕 Pizza Brain", "🐢 Turtle Pace", "💬 Chatty", "🗣 Let’s Talk",
  "🎤 In My Talk Era", "🤝 Social", "🧡 Open", "😴 AFK", "👻 Ghost Mode",
  "🔕 Do Not Disturb", "📴 Offline Brain", "🛌 Sleeping", "💔 Moody",
  "🥹 Soft", "🌧 In My Feelings", "💭 Thinking", "❤️ Loving", "🌀 Chaos",
  "🤡 Clown Energy", "🐒 Monkey Mode", "🧃 Main Character", "🪩 Slay Mode",
  "🐸 Froggy", "🍓 Sweet", "🫧 Floating"
];

const VIBE_CATEGORIES = {
  All: VIBES,
  "Chill & Quiet": ["😎 Chill", "🌿 Peaceful", "🌙 Low-Key", "🧘 Zen", "☕ Cozy", "😴 AFK", "👻 Ghost Mode", "🔕 Do Not Disturb", "📴 Offline Brain", "🛌 Sleeping", "🫧 Floating"],
  "Active & Hype": ["🔥 Hype", "⚡ Electric", "🎉 Party Mode", "💃 Vibing", "🚀 Hustle", "🪩 Slay Mode", "🌀 Chaos", "🤝 Social", "🧡 Open"],
  "Work & Study": ["💼 Working", "📚 Studying", "🧠 Deep Focus", "⏳ Busy", "💭 Thinking"],
  "Playful & Fun": ["😜 Goofy", "🛸 Alien Mode", "🐙 Squishy", "🍕 Pizza Brain", "🐢 Turtle Pace", "💬 Chatty", "🗣 Let’s Talk", "🎤 In My Talk Era", "🤡 Clown Energy", "🐒 Monkey Mode", "🧃 Main Character", "🐸 Froggy", "🍓 Sweet"],
  "Moods & Chaos": ["💔 Moody", "🥹 Soft", "🌧 In My Feelings", "❤️ Loving"]
};

const STREAK_MILESTONES = [
  { name: "Novice", days: 1, color: "from-blue-500 to-indigo-500", desc: "Start your journey!" },
  { name: "Vibe Starter", days: 3, color: "from-emerald-500 to-teal-500", desc: "Vibe for 3 days." },
  { name: "Phoenix Elite", days: 7, color: "from-orange-500 to-red-500", desc: "Unlock the Phoenix Badge!" },
  { name: "Architect", days: 14, color: "from-purple-500 to-pink-500", desc: "Maintain a 2-week streak." },
  { name: "Legionnaire", days: 30, color: "from-yellow-400 to-amber-600", desc: "Become a Legend!" }
];

const getPresets = (username: string) => [
  { name: "Cyber Bot", url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}-bot` },
  { name: "Retro Pixel", url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}-pixel` },
  { name: "Cute Avatar", url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}-avatar` },
  { name: "Neon Spark", url: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}-neon` },
  { name: "Hype Emoji", url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}-emoji` },
  { name: "Explorer", url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}-explorer` },
  { name: "Lorelei", url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${username}-lorelei` },
  { name: "Shapes", url: `https://api.dicebear.com/7.x/shapes/svg?seed=${username}-shapes` }
];

const getCurrentRank = (streak: number) => {
  if (streak >= 30) return { name: "Legendary Connector 👑", color: "text-amber-800 border-amber-200 bg-amber-50/80 shadow-xs" };
  if (streak >= 14) return { name: "Network Architect 🧠", color: "text-purple-800 border-purple-200 bg-purple-50/80 shadow-xs" };
  if (streak >= 7) return { name: "Phoenix Active 🔥", color: "text-orange-800 border-orange-200 bg-orange-50/80 shadow-xs" };
  if (streak >= 3) return { name: "Vibe Master ⚡", color: "text-emerald-800 border-emerald-200 bg-emerald-50/80 shadow-xs" };
  return { name: "Novice Connector 🌱", color: "text-blue-800 border-blue-200 bg-blue-50/80 shadow-xs" };
};

const ProfilePage = () => {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");
    
    // Avatar selector state
    const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [customAvatarUrl, setCustomAvatarUrl] = useState("");
    
    // Vibe filter state
    const [activeCategory, setActiveCategory] = useState<keyof typeof VIBE_CATEGORIES>("All");
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfileApi,
    });

    useEffect(() => {
        if (data?.user) {
            setEditName(data.user.name || "");
            setEditBio(data.user.bio || "");
            setSelectedAvatar(data.user.profilePicture || "");
        }
    }, [data]);

    const updateProfileMutation = useMutation({
        mutationFn: async (vars: { name?: string; bio?: string; profilePicture?: string } = {}) => {
            const nameToUpdate = vars.name !== undefined ? vars.name : editName;
            const bioToUpdate = vars.bio !== undefined ? vars.bio : editBio;
            const pictureToUpdate = vars.profilePicture !== undefined ? vars.profilePicture : selectedAvatar;
            return updateProfileApi(nameToUpdate, bioToUpdate, pictureToUpdate);
        },
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["me"] });
            if (updatedUser) {
                dispatch(login(updatedUser));
            }
            setIsEditing(false);
            toast.success("Profile updated!");
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    });

    const updateVibeMutation = useMutation({
        mutationFn: updateVibeApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            toast.success("Vibe check pass! ✨");
        },
    });

    const handleVibeToggle = (vibe: string) => {
        const currentVibes = data?.stats?.vibe || [];
        if (currentVibes.includes(vibe)) {
            updateVibeMutation.mutate(currentVibes.filter((v: string) => v !== vibe));
        } else {
            if (currentVibes.length >= 3) {
                toast.error("You can only have 3 vibes at a time!");
                return;
            }
            updateVibeMutation.mutate([...currentVibes, vibe]);
        }
    };

    const handleSaveAvatar = async () => {
        try {
            const avatarToSave = customAvatarUrl.trim() || selectedAvatar;
            await updateProfileMutation.mutateAsync({ profilePicture: avatarToSave });
            setIsAvatarPickerOpen(false);
        } catch (err) {
            console.error("Save avatar error:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-[#0c0c0e] flex flex-col font-outfit">
                <div className="flex-1 bg-white text-black rounded-[24px] overflow-hidden flex items-center justify-center h-full border border-gray-100 shadow-2xl">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            </div>
        );
    }

    const { user, stats } = data || {};
    const currentStreak = stats?.appStreak || 0;
    const rank = getCurrentRank(currentStreak);

    // Calculate milestone progress
    const currentMilestoneIndex = STREAK_MILESTONES.findIndex(m => m.days > currentStreak);
    let nextMilestone = null;
    let prevMilestoneDays = 0;
    let progressPct = 100;
    let milestoneDesc = "Ultimate Rank Unlocked! You are a Legendary Connector! 👑";

    if (currentMilestoneIndex !== -1) {
        nextMilestone = STREAK_MILESTONES[currentMilestoneIndex];
        if (currentMilestoneIndex > 0) {
            prevMilestoneDays = STREAK_MILESTONES[currentMilestoneIndex - 1].days;
        }
        const range = nextMilestone.days - prevMilestoneDays;
        const currentDiff = currentStreak - prevMilestoneDays;
        progressPct = Math.min(100, Math.max(0, (currentDiff / range) * 100));
        milestoneDesc = `${nextMilestone.days - currentStreak} more days to unlock the ${nextMilestone.name} rank.`;
    }

    const filteredVibes = VIBE_CATEGORIES[activeCategory].filter(v => 
        v.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const presets = getPresets(user?.username || "vaibhav");

    return (
        <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-[#0c0c0e] flex flex-col font-outfit">
            <div className="flex-1 bg-white text-black rounded-[24px] overflow-hidden flex flex-col h-full border border-gray-100 shadow-2xl relative">
                
                <div className="relative h-full overflow-y-auto py-10 px-6 lg:px-10 custom-scrollbar z-10">
                    <div className="w-full space-y-8">
                        
                        {/* Main Profile Dashboard Card */}
                        <div className="relative rounded-3xl bg-white border border-zinc-200/70 overflow-hidden shadow-xs transition-all duration-300">
                            
                            {/* Premium Minimal Dot-Grid Banner (No Gradients) */}
                            <div className="h-36 w-full bg-zinc-50/50 bg-[radial-gradient(#e4e4e7_1.2px,transparent_1.2px)] [background-size:20px_20px] border-b border-zinc-200 relative flex items-end px-8">
                                
                                {/* Selected vibes overlays on cover */}
                                <div className="absolute top-4 right-4 flex flex-wrap gap-2">
                                    {stats?.vibe?.map((v: string) => (
                                        <span key={v} className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-zinc-700 border border-zinc-200/80 shadow-sm transition-all">
                                            {v}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Avatar and Identity Info with Improved Spacing */}
                            <div className="relative px-8 pb-8 pt-4 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 z-10">
                                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                                    
                                    {/* Avatar Frame Container */}
                                    <div className="relative mt-[-3.5rem] md:mt-[-4.5rem] group/avatar select-none cursor-pointer" onClick={() => setIsAvatarPickerOpen(true)}>
                                        <div className="w-32 h-32 rounded-[24px] bg-white p-1.5 shadow-lg border border-zinc-200/80 transition-all hover:scale-102 duration-300">
                                            <div className="w-full h-full rounded-[18px] bg-zinc-50 flex items-center justify-center overflow-hidden relative border border-zinc-250/20">
                                                 {user?.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                                 ) : (
                                                    <span className="text-4xl font-extrabold text-zinc-700">
                                                        {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
                                                    </span>
                                                 )}
                                                 
                                                 {/* Hover Edit Overlay */}
                                                 <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                                                     <Camera className="w-6 h-6 text-white mb-1" />
                                                     <span className="text-[9px] text-zinc-250 font-bold uppercase tracking-widest">Change</span>
                                                 </div>
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1.5 border border-zinc-200 shadow-sm">
                                            <div className="bg-emerald-500 w-3 h-3 rounded-full border-2 border-white animate-pulse"></div>
                                        </div>
                                    </div>

                                    {/* User Text Info */}
                                    <div className="space-y-1.5 pb-2">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                            {isEditing ? (
                                                <input 
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-1.5 text-2xl font-bold text-zinc-950 focus:outline-none focus:border-zinc-300 w-full md:w-auto"
                                                    placeholder="Your Name"
                                                    maxLength={25}
                                                />
                                            ) : (
                                                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950">{user?.name || user?.username || "Connect User"}</h1>
                                            )}
                                            
                                            {/* Calculated Tier Badge */}
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${rank.color}`}>
                                                {rank.name}
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 font-bold text-sm">@{user?.username || "username"}</p>
                                    </div>
                                </div>

                                {/* Sleek Outline Edit Button */}
                                <div className="pb-2">
                                    <button 
                                        onClick={() => isEditing ? updateProfileMutation.mutate({}) : setIsEditing(true)}
                                        className={`px-5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95 border ${
                                            isEditing 
                                            ? "bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900" 
                                            : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200"
                                        }`}
                                    >
                                        {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                        {isEditing ? "Save Changes" : "Edit Profile"}
                                    </button>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div className="border-t border-zinc-200/60 px-8 py-6 bg-zinc-50/20">
                                <div className="max-w-3xl">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2.5">About Me</h3>
                                    {isEditing ? (
                                        <div className="relative">
                                            <textarea 
                                                value={editBio}
                                                onChange={(e) => setEditBio(e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-zinc-900 focus:outline-none focus:border-zinc-350 resize-none h-20 text-sm font-medium"
                                                placeholder="Write a short bio..."
                                                maxLength={50}
                                            />
                                            <span className="absolute bottom-2 right-4 text-xs text-zinc-400">{editBio.length}/50</span>
                                        </div>
                                    ) : (
                                        <p className="text-zinc-800 text-sm leading-relaxed font-semibold">
                                            {user?.bio || "No bio yet. Write something cool!"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Stats & Milestone Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* App Streak Card */}
                            <div className="bg-white border border-zinc-200/70 rounded-3xl p-5 flex items-center gap-5 group hover:border-zinc-300 transition-all shadow-xs">
                                <div className="p-4 bg-orange-50/70 text-orange-600 rounded-2xl border border-orange-100/50 group-hover:scale-105 transition-transform duration-305">
                                    <Flame className="w-7 h-7 fill-current drop-shadow-xs" />
                                </div>
                                <div>
                                    <span className="block text-2xl font-black text-zinc-950">{stats?.appStreak || 0}</span>
                                    <span className="text-xs font-semibold text-zinc-550 uppercase tracking-wider">Current Day Streak</span>
                                </div>
                            </div>

                            {/* Messages Today Card */}
                            <div className="bg-white border border-zinc-200/70 rounded-3xl p-5 flex items-center gap-5 group hover:border-zinc-300 transition-all shadow-xs">
                                <div className="p-4 bg-emerald-50/70 text-emerald-600 rounded-2xl border border-emerald-100/50 group-hover:scale-105 transition-transform duration-305">
                                    <Zap className="w-7 h-7" />
                                </div>
                                <div>
                                    <span className="block text-2xl font-black text-zinc-950">{stats?.messagesToday || 0}</span>
                                    <span className="text-xs font-semibold text-zinc-550 uppercase tracking-wider">Messages Sent Today</span>
                                </div>
                            </div>

                            {/* Streak Points Card */}
                            <div className="bg-white border border-zinc-200/70 rounded-3xl p-5 flex items-center gap-5 group hover:border-zinc-300 transition-all shadow-xs">
                                <div className="p-4 bg-purple-50/70 text-purple-600 rounded-2xl border border-purple-100/50 group-hover:scale-105 transition-transform duration-305">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                                <div>
                                    <span className="block text-2xl font-black text-zinc-950">{stats?.streakPoints || 0}</span>
                                    <span className="text-xs font-semibold text-zinc-550 uppercase tracking-wider">Streak Points Earned</span>
                                </div>
                            </div>
                        </div>

                        {/* Milestone Progress Bar */}
                        <div className="bg-white border border-zinc-200/70 rounded-3xl p-6 shadow-xs relative overflow-hidden">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
                                        <Award className="w-4 h-4 text-purple-500" /> Milestone Progression
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-0.5">{milestoneDesc}</p>
                                </div>
                                {nextMilestone && (
                                    <span className="text-xs font-bold text-purple-650 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                                        Next: {nextMilestone.name} ({nextMilestone.days}d)
                                    </span>
                                )}
                            </div>
                            
                            {/* Progress Track (Flat Color) */}
                            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden border border-zinc-200/40">
                                <div 
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000 shadow-xs"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Grid Visualizer & Streaks Container */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Weekly Activity Grid */}
                            <div className="lg:col-span-2 bg-white border border-zinc-200/70 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5 mb-2">
                                        <Clock className="w-4 h-4 text-orange-500" /> Weekly Activity Streak
                                    </h3>
                                    <p className="text-xs text-zinc-500 mb-6">Visual display of your connection check-ins</p>
                                </div>

                                <div className="grid grid-cols-7 gap-3 mb-6">
                                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, index) => {
                                        const today = new Date();
                                        const currentDayIndex = (today.getDay() + 6) % 7; 
                                        const isFuture = index > currentDayIndex;
                                        const isActive = !isFuture && (currentDayIndex - index) < currentStreak;
                                        
                                        return (
                                            <div key={day} className="flex flex-col items-center gap-2 group/day">
                                                <div className={`w-full aspect-square rounded-lg transition-all duration-500 relative ${
                                                    isActive 
                                                    ? "bg-orange-500 shadow-sm border border-orange-600 scale-100" 
                                                    : "bg-zinc-50 border border-zinc-200 border-dashed"
                                                }`}>
                                                    <div className="absolute opacity-0 group-hover/day:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-[9px] font-black uppercase text-white rounded-md whitespace-nowrap shadow-md border border-zinc-800 transition-opacity pointer-events-none z-30">
                                                        {isActive ? "Active Day" : isFuture ? "Future Day" : "Missed Checkin"}
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-bold tracking-wider ${isActive ? "text-zinc-800" : "text-zinc-400"}`}>{day}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                 <div className="bg-orange-500/5 border border-orange-100 rounded-2xl p-4 flex items-center gap-3.5">
                                    <Flame className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <p className="text-xs text-zinc-650 leading-relaxed font-semibold">
                                        Maintain your streak daily. Your longest streak record is <span className="text-zinc-900 font-bold">{stats?.longestStreak || 0}</span> days.
                                    </p>
                                 </div>
                            </div>

                            {/* Top Friend Streaks */}
                            <div className="bg-white border border-zinc-200/70 rounded-3xl p-6 space-y-4 shadow-xs">
                                <div>
                                    <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-1.5">
                                        <Trophy className="w-4 h-4 text-yellow-600" /> Best Streaks
                                    </h3>
                                    <p className="text-xs text-zinc-500">Highest daily streaks with friends</p>
                                </div>

                                <div className="space-y-3.5">
                                    {stats?.topChatStreaks && stats.topChatStreaks.length > 0 ? (
                                        stats.topChatStreaks.map((streakData: any) => {
                                            const partner = streakData.user;
                                            if (!partner) return null;
                                            return (
                                                <div key={partner._id} className="relative group bg-zinc-50/50 border border-zinc-100 rounded-2xl p-3 flex items-center gap-3.5 transition-all hover:bg-zinc-50">
                                                    {/* Avatar */}
                                                    <div className="w-10 h-10 rounded-xl bg-zinc-100 flex-shrink-0 overflow-hidden border border-zinc-200 flex items-center justify-center">
                                                        {partner.profilePicture ? (
                                                            <img src={partner.profilePicture} alt={partner.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-sm font-bold text-zinc-550">{partner.name?.[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-zinc-850 truncate text-xs">{partner.name}</h4>
                                                        <p className="text-[10px] text-zinc-400 truncate font-semibold">@{partner.username}</p>
                                                    </div>
                                                    {/* Streak */}
                                                    <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg text-[10px] font-black border border-orange-100">
                                                        <Flame className="w-3 h-3 fill-current" />
                                                        <span>{streakData.days}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200 rounded-2xl">
                                            <MessageSquare className="w-8 h-8 text-zinc-300 mb-2" />
                                            <span className="text-xs text-zinc-500 font-medium">No active chat streaks</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Vibe Check Panel */}
                        <div className="bg-white border border-zinc-200/70 rounded-3xl p-6 space-y-6 shadow-xs">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-850">
                                        <Star className="w-5 h-5 text-yellow-500 fill-current" /> Vibe Check
                                    </h2>
                                    <p className="text-xs text-zinc-500">Pick up to 3 vibes that represent your profile theme</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {/* Search bar */}
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search vibes..."
                                            className="bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-300 w-full sm:w-44 focus:ring-2 focus:ring-zinc-100"
                                        />
                                    </div>
                                    <span className="text-xs text-zinc-500 bg-zinc-100 border border-zinc-200/60 px-3 py-1.5 rounded-xl shrink-0 font-bold">
                                        {stats?.vibe?.length || 0}/3 Selects
                                    </span>
                                </div>
                            </div>

                            {/* Vibe categories navigation */}
                            <div className="flex flex-wrap gap-1.5 border-b border-zinc-100 pb-4">
                                {(Object.keys(VIBE_CATEGORIES) as Array<keyof typeof VIBE_CATEGORIES>).map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            activeCategory === cat 
                                            ? "bg-zinc-950 text-white shadow-xs" 
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Vibes Buttons List */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {filteredVibes.map((vibe) => {
                                    const isSelected = stats?.vibe?.includes(vibe);
                                    return (
                                        <button
                                            key={vibe}
                                            onClick={() => handleVibeToggle(vibe)}
                                            className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left border cursor-pointer active:scale-95 flex items-center justify-between gap-1 ${
                                                isSelected 
                                                ? "bg-zinc-950 text-white border-zinc-950 shadow-sm font-bold" 
                                                : "bg-zinc-50/50 text-zinc-650 border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300"
                                            }`}
                                        >
                                            <span className="truncate">{vibe}</span>
                                            {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 text-white stroke-[3px]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Avatar Selection Dialog */}
            {isAvatarPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white border border-zinc-200 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black flex items-center gap-2 text-zinc-900">
                                <Camera className="w-5 h-5 text-emerald-500" /> Choose Profile Avatar
                            </h3>
                            <button 
                                onClick={() => setIsAvatarPickerOpen(false)} 
                                className="p-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-600"
                            >
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Selected Preview */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-3xl bg-zinc-250 p-0.5 shadow-md relative">
                                <div className="w-full h-full rounded-[22px] bg-zinc-50 flex items-center justify-center overflow-hidden border border-white">
                                    {(customAvatarUrl.trim() || selectedAvatar) ? (
                                        <img 
                                            src={customAvatarUrl.trim() || selectedAvatar} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "vaibhav"}`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-zinc-800">
                                            {user?.name?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preset Options Grid */}
                        <div className="space-y-4 mb-6">
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Preset Seeds (Dicebear)</h4>
                            <div className="grid grid-cols-4 gap-3">
                                {presets.map((preset) => {
                                    const isCurrentPreset = selectedAvatar === preset.url && !customAvatarUrl;
                                    return (
                                        <button
                                            key={preset.name}
                                            onClick={() => {
                                                setSelectedAvatar(preset.url);
                                                setCustomAvatarUrl("");
                                            }}
                                            className={`aspect-square rounded-2xl bg-zinc-50 border p-1 flex items-center justify-center relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                                                isCurrentPreset 
                                                ? "border-emerald-500 bg-emerald-50/50 shadow-xs" 
                                                : "border-zinc-200 hover:border-zinc-300"
                                            }`}
                                        >
                                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-xl" />
                                            {isCurrentPreset && (
                                                <div className="absolute top-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                                                    <Check className="w-2.5 h-2.5 stroke-[4px]" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Image URL */}
                        <div className="space-y-2 mb-6">
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">Or Paste Image URL</h4>
                            <input
                                type="url"
                                value={customAvatarUrl}
                                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAvatarPickerOpen(false)}
                                className="flex-1 py-2.5 rounded-2xl bg-zinc-100 text-zinc-600 border border-zinc-200 font-bold text-xs hover:bg-zinc-200/80 active:scale-95 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAvatar}
                                className="flex-1 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                            >
                                Apply & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
