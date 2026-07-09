import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi, updateVibeApi } from "../api/api";
import { 
  Edit2, Save, Flame, Zap, Star, Camera, Check, Search, 
  Award, Sparkles, X, MessageSquare, Trophy, Clock, UserCheck, Loader2
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
  if (streak >= 30) return { name: "Legendary Active", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
  if (streak >= 14) return { name: "Architect Active", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
  if (streak >= 7) return { name: "Phoenix Active", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
  if (streak >= 3) return { name: "Vibe Active", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
  return { name: "Novice Active", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
};

const FloatingIslandSVG = () => (
  <svg viewBox="0 0 120 120" className="w-24 h-24 md:w-28 md:h-28 drop-shadow-[0_10px_20px_rgba(99,102,241,0.25)] select-none">
      {/* Floating Island Base shadow/glowing mist */}
      <ellipse cx="60" cy="102" rx="25" ry="5" fill="#4f46e5" fillOpacity="0.35" className="blur-xs" />
      {/* Ground layers */}
      <path d="M 22 82 Q 60 98 98 82 L 88 98 Q 60 108 32 98 Z" fill="#2d1f54" />
      <path d="M 26 82 Q 60 94 94 82 L 88 88 Q 60 98 32 88 Z" fill="#44327d" />
      {/* Grass Top */}
      <ellipse cx="60" cy="82" rx="36" ry="9" fill="#059669" />
      <ellipse cx="60" cy="82" rx="30" ry="7" fill="#10b981" />
      {/* Temple Columns */}
      <rect x="44" y="56" width="3.5" height="20" fill="#e2e8f0" rx="1" />
      <rect x="52" y="53" width="3.5" height="23" fill="#ffffff" rx="1" />
      <rect x="64" y="53" width="3.5" height="23" fill="#ffffff" rx="1" />
      <rect x="72" y="56" width="3.5" height="20" fill="#e2e8f0" rx="1" />
      {/* Temple Roof */}
      <path d="M 40 56 L 80 56 L 60 41 Z" fill="#cbd5e1" />
      <path d="M 46 56 L 74 56 L 60 46 Z" fill="#f1f5f9" />
      {/* Temple Base */}
      <rect x="38" y="75" width="44" height="4" fill="#cbd5e1" rx="1" />
  </svg>
);

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
            <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-transparent flex flex-col font-outfit">
                <div className="flex-1 bg-violet-500/10 backdrop-blur-2xl text-white rounded-[32px] overflow-hidden flex items-center justify-center h-full border border-white/15 shadow-2xl">
                    <Loader2 className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-violet-500"></Loader2>
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
        <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-transparent flex flex-col font-outfit z-10">
            <div className="flex-1  backdrop-blur-2xl text-white rounded-[32px] overflow-hidden flex flex-col h-full border border-white/15 shadow-2xl relative p-6 lg:p-8 gap-6">
                
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] mix-blend-normal" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-normal" />
                </div>

                <div className="relative h-full overflow-y-auto pr-1 flex flex-col gap-6 scrollbar-hide z-10">
                    
                    {/* Profile Header Block */}
                    <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6 shrink-0 z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            
                            {/* Avatar Frame Container */}
                            <div className="relative group/avatar select-none cursor-pointer" onClick={() => setIsAvatarPickerOpen(true)}>
                                <div className="w-28 h-28 rounded-3xl bg-white/10 p-[3px] border border-white/20 transition-all hover:scale-[1.02] hover:border-white/30 duration-300">
                                    <div className="w-full h-full rounded-[20px] bg-[#18112e]/90 flex items-center justify-center overflow-hidden relative border border-white/5">
                                         {user?.profilePicture ? (
                                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                         ) : (
                                            <span className="text-3xl font-extrabold text-white/40">
                                                {user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || "U"}
                                            </span>
                                         )}
                                         
                                         {/* Hover Edit Overlay */}
                                         <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                                             <Camera className="w-5 h-5 text-white mb-1" />
                                             <span className="text-[8px] text-white/80 font-bold uppercase tracking-widest">Change</span>
                                         </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 bg-[#120b24] rounded-full p-[2px] border border-white/10 shadow-md">
                                    <div className="bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#120b24]"></div>
                                </div>
                            </div>

                            {/* User Identity Info */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                                    {isEditing ? (
                                        <input 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xl font-bold text-white focus:outline-none focus:border-white/20 w-full md:w-auto"
                                            placeholder="Your Name"
                                            maxLength={25}
                                        />
                                    ) : (
                                        <h1 className="text-3xl font-black tracking-tight text-white">{user?.name || user?.username || "Connect User"}</h1>
                                    )}
                                    
                                    {/* Phoenix Badge / Tier */}
                                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider flex items-center gap-1 ${rank.color}`}>
                                        <span>{rank.name}</span>
                                        <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
                                    </span>
                                </div>
                                <p className="text-white/50 text-sm font-bold">@{user?.username || "username"}</p>
                                
                                {isEditing ? (
                                    <textarea 
                                        value={editBio}
                                        onChange={(e) => setEditBio(e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white/85 focus:outline-none focus:border-white/20 w-full md:w-80 h-12 mt-1.5 resize-none"
                                        placeholder="Your bio..."
                                        maxLength={50}
                                    />
                                ) : (
                                    <p className="text-white/80 text-sm font-semibold">{user?.bio || "No bio yet. Write something cool!"}</p>
                                )}

                                {/* Location and Joining Info */}
                                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-white/40 font-semibold pt-1">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/10" />
                                        <span>India</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>Joined May 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="shrink-0">
                            <button 
                                onClick={() => isEditing ? updateProfileMutation.mutate({}) : setIsEditing(true)}
                                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                            >
                                {isEditing ? (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Save Profile</span>
                                    </>
                                ) : (
                                    <>
                                        <Edit2 className="w-3.5 h-3.5" />
                                        <span>Edit Profile</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Dashboard Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        {/* Day Streak */}
                        <div className="bg-white/15 border border-white/10 backdrop-blur-md rounded-[20px] p-5 flex items-center gap-5 group hover:border-white/15 transition-all">
                            <div className="p-4 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Flame className="w-7 h-7 fill-current drop-shadow-xs" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white leading-none">{stats?.appStreak || 0}</span>
                                <span className="text-xs font-bold text-white/90 mt-1">Day Streak</span>
                                <span className="text-[10px] text-white/40 font-semibold mt-0.5">Keep it going!</span>
                            </div>
                        </div>

                        {/* Messages Sent Today */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[20px] p-5 flex items-center gap-5 group hover:border-white/15 transition-all">
                            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Zap className="w-7 h-7 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white leading-none">{stats?.messagesToday || 0}</span>
                                <span className="text-xs font-bold text-white/90 mt-1">Messages Sent Today</span>
                                <span className="text-[10px] text-white/40 font-semibold mt-0.5">Keep the conversations flow!</span>
                            </div>
                        </div>

                        {/* Streak Points */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[20px] p-5 flex items-center gap-5 group hover:border-white/15 transition-all">
                            <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white leading-none">{stats?.streakPoints || 0}</span>
                                <span className="text-xs font-bold text-white/90 mt-1">Streak Points</span>
                                <span className="text-[10px] text-white/40 font-semibold mt-0.5">Earn more by staying active</span>
                            </div>
                        </div>

                        {/* Connections Count */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[20px] p-5 flex items-center gap-5 group hover:border-white/15 transition-all">
                            <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                                <UserCheck className="w-7 h-7" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-white leading-none">{stats?.connectionsCount || 0}</span>
                                <span className="text-xs font-bold text-white/90 mt-1">Connections</span>
                                <span className="text-[10px] text-white/40 font-semibold mt-0.5">People in your network</span>
                            </div>
                        </div>
                    </div>

                    {/* Milestone Progression Card */}
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center relative overflow-hidden gap-4 shrink-0">
                        {/* Background subtle mesh glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <div className="relative z-10 flex-1 space-y-4 w-full">
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5 text-violet-400" />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                    Milestone Progression
                                </h3>
                            </div>
                            <p className="text-xs text-white/55 font-medium">{milestoneDesc}</p>
                            
                            {/* Milestone Progress Bar */}
                            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5 max-w-2xl">
                                <div 
                                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-1000 shadow-sm"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Right side next indicator & Temple representation */}
                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                            <div className="text-center sm:text-right space-y-2">
                                {nextMilestone && (
                                    <span className="inline-block text-[10px] font-extrabold text-violet-300 bg-violet-500/20 border border-violet-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                                        Next: {nextMilestone.name} ({nextMilestone.days}d)
                                    </span>
                                )}
                                <p className="text-xs font-bold text-white/60">
                                    {currentStreak} / {nextMilestone ? nextMilestone.days : 30} days
                                </p>
                            </div>
                            <FloatingIslandSVG />
                        </div>
                    </div>

                    {/* Weekly Activity Streak & Best Streaks */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                        
                        {/* Weekly Activity Streak Grid */}
                        <div className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 flex flex-col justify-between gap-6">
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1.5">
                                    <Clock className="w-4 h-4 text-orange-400" /> Weekly Activity Streak
                                </h3>
                                <p className="text-xs text-white/55 font-medium">Visual display of your connection check-ins</p>
                            </div>

                            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 my-2">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                                    const today = new Date();
                                    const currentDayIndex = (today.getDay() + 6) % 7; 
                                    const isFuture = index > currentDayIndex;
                                    const isActive = !isFuture && (currentDayIndex - index) < currentStreak;
                                    
                                    return (
                                        <div key={day} className="flex flex-col items-center gap-2 group/day">
                                            <div className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-305 relative border ${
                                                isActive 
                                                ? "bg-white/15 border border-white/25 scale-100 shadow-sm" 
                                                : "bg-white/5 border-white/10 border-dashed opacity-40"
                                            }`}>
                                                {isActive ? (
                                                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-[#f97316] fill-[#fdba74]" />
                                                ) : (
                                                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white/20" />
                                                )}
                                                
                                                {/* Tooltip */}
                                                <div className="absolute opacity-0 group-hover/day:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-[9px] font-black uppercase text-white rounded-md whitespace-nowrap shadow-md border border-zinc-800 transition-opacity pointer-events-none z-30">
                                                    {isActive ? "Active Day" : isFuture ? "Future Day" : "Missed Checkin"}
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-extrabold tracking-wide uppercase ${isActive ? "text-orange-300" : "text-white/40"}`}>{day}</span>
                                        </div>
                                    );
                                })}
                            </div>

                             <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3">
                                <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                <p className="text-xs text-white/60 leading-relaxed font-semibold">
                                    Maintain your streak daily. Your longest streak record is <span className="text-white font-black">{stats?.longestStreak || 0}</span> days.
                                </p>
                             </div>
                        </div>

                        {/* Top Friend Streaks */}
                        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 space-y-4 flex flex-col justify-between">
                            <div className="space-y-1">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-400" /> Best Streaks
                                </h3>
                                <p className="text-xs text-white/50 font-medium">Highest daily streaks with friends</p>
                            </div>

                            <div className="space-y-3 mt-3 flex-1 overflow-y-auto scrollbar-hide">
                                {stats?.topChatStreaks && stats.topChatStreaks.length > 0 ? (
                                    stats.topChatStreaks.map((streakData: any) => {
                                        const partner = streakData.user;
                                        if (!partner) return null;
                                        return (
                                            <div key={partner._id} className="relative group bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3 transition-all hover:bg-white/10">
                                                {/* Avatar */}
                                                <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                                                    {partner.profilePicture ? (
                                                        <img src={partner.profilePicture} alt={partner.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-white/40">{partner.name?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white truncate text-xs">{partner.name}</h4>
                                                    <p className="text-[10px] text-white/50 truncate font-semibold">@{partner.username}</p>
                                                </div>
                                                {/* Streak */}
                                                <div className="flex items-center gap-1 bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-lg text-[10px] font-black border border-orange-500/20">
                                                    <Flame className="w-3 h-3 fill-current" />
                                                    <span>{streakData.days} days</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/15 rounded-2xl gap-3">
                                        <MessageSquare className="w-8 h-8 text-white/20" />
                                        <div className="space-y-1">
                                            <span className="block text-xs text-white/50 font-semibold">No active chat streaks</span>
                                            <button className="text-[10px] font-black text-violet-300 uppercase tracking-widest bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 px-3 py-1.5 rounded-xl transition-all cursor-pointer">
                                                Start a conversation!
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vibe Check Panel */}
                    <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-6 space-y-6 shadow-xs shrink-0 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h2 className="text-lg font-black flex items-center gap-2 text-white uppercase tracking-wider">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" /> Vibe Check
                                </h2>
                                <p className="text-xs text-white/50 font-medium">Pick up to 3 vibes that represent your profile theme</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                {/* Search bar */}
                                <div className="relative flex-1 sm:flex-none">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search vibes..."
                                        className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 w-full sm:w-44 focus:ring-2 focus:ring-white/5"
                                    />
                                </div>
                                <span className="text-xs text-white/80 bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl shrink-0 font-bold">
                                    {stats?.vibe?.length || 0}/3 Selects
                                </span>
                            </div>
                        </div>

                        {/* Vibe categories navigation */}
                        <div className="flex flex-wrap gap-1.5 border-b border-white/10 pb-4">
                            {(Object.keys(VIBE_CATEGORIES) as Array<keyof typeof VIBE_CATEGORIES>).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        activeCategory === cat 
                                        ? "bg-white/15 text-white shadow-xs" 
                                        : "text-white/50 hover:text-white hover:bg-white/5"
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
                                            ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-transparent shadow-sm font-bold" 
                                            : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/15"
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

            {/* Avatar Selection Dialog */}
            {isAvatarPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/15 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 text-white">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-black flex items-center gap-2 text-white">
                                <Camera className="w-5 h-5 text-indigo-400" /> Choose Profile Avatar
                            </h3>
                            <button 
                                onClick={() => setIsAvatarPickerOpen(false)} 
                                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-white/40 hover:text-white"
                            >
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Selected Preview */}
                        <div className="flex justify-center mb-6">
                            <div className="w-24 h-24 rounded-3xl bg-white/10 p-[2px] shadow-md relative">
                                <div className="w-full h-full rounded-[22px] bg-[#18112e] flex items-center justify-center overflow-hidden border border-white/5">
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
                                        <span className="text-3xl font-black text-white/40">
                                            {user?.name?.[0]?.toUpperCase() || "U"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preset Options Grid */}
                        <div className="space-y-4 mb-6">
                            <h4 className="text-xs font-black uppercase tracking-wider text-white/40">Preset Seeds (Dicebear)</h4>
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
                                            className={`aspect-square rounded-2xl bg-white/5 border p-1 flex items-center justify-center relative overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                                                isCurrentPreset 
                                                ? "border-indigo-500 bg-indigo-500/10 shadow-xs" 
                                                : "border-white/10 hover:border-white/20"
                                            }`}
                                        >
                                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded-xl" />
                                            {isCurrentPreset && (
                                                <div className="absolute top-1 right-1 bg-indigo-505 text-white bg-indigo-500 rounded-full p-0.5">
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
                            <h4 className="text-xs font-black uppercase tracking-wider text-white/40">Or Paste Image URL</h4>
                            <input
                                type="url"
                                value={customAvatarUrl}
                                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-indigo-500 focus:bg-white/10"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsAvatarPickerOpen(false)}
                                className="flex-1 py-2.5 rounded-2xl bg-white/5 text-white/80 border border-white/10 font-bold text-xs hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveAvatar}
                                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold text-xs hover:scale-[1.01] active:scale-95 transition-all cursor-pointer border border-white/10 shadow-sm"
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
