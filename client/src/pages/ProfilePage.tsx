import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileApi, updateProfileApi, updateVibeApi } from "../api/api";
import { Edit2, Save, Flame, Zap, Star } from "lucide-react";
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

const ProfilePage = () => {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: getProfileApi,
    });

    useEffect(() => {
        if (data?.user) {
            setEditName(data.user.name);
            setEditBio(data.user.bio || "");
        }
    }, [data]);

    const updateProfileMutation = useMutation({
        mutationFn: async () => updateProfileApi(editName, editBio),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
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

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-[#030303] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    const { user, stats } = data || {};

    return (
        <div className="h-full bg-[#030303] text-white overflow-y-auto scrollbar-hide">
            
             {/* Decorative Background */}
             <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 py-12 space-y-12">
                
                {/* Profile Header Card */}
                <div className="relative group p-8 rounded-3xl bg-[#121212]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
                     <div className="absolute inset-0 bg-linear-to-br from-green-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                     
                     <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-linear-to-tr from-green-500 to-purple-600 p-1">
                                <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                                     {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                                     ) : (
                                        <span className="text-4xl font-bold bg-clip-text text-transparent bg-linear-to-r from-green-400 to-purple-500">
                                            {user?.name?.[0]?.toUpperCase()}
                                        </span>
                                     )}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-[#121212] rounded-full p-2 border border-white/10 shadow-lg">
                                <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-[#121212] animate-pulse"></div>
                            </div>
                        </div>

                        {/* Info & Edit */}
                        <div className="flex-1 text-center md:text-left space-y-4 w-full">
                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                                <div className="space-y-1">
                                    {isEditing ? (
                                        <input 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-2xl font-bold text-white focus:outline-none focus:border-green-500 w-full md:w-auto"
                                            placeholder="Your Name"
                                        />
                                    ) : (
                                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user?.name}</h1>
                                    )}
                                    <p className="text-gray-400 font-medium">@{user?.username}</p>
                                </div>
                                
                                <button 
                                    onClick={() => isEditing ? updateProfileMutation.mutate() : setIsEditing(true)}
                                    className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all ${isEditing ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
                                >
                                    {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                    {isEditing ? "Save Changes" : "Edit Profile"}
                                </button>
                            </div>

                            <div className="max-w-xl">
                                {isEditing ? (
                                    <div className="relative">
                                        <textarea 
                                            value={editBio}
                                            onChange={(e) => setEditBio(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-green-500 resize-none h-24"
                                            placeholder="Write a short bio..."
                                            maxLength={50}
                                        />
                                        <span className="absolute bottom-2 right-4 text-xs text-gray-500">{editBio.length}/50</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                            {user?.bio || "No bio yet. Write something cool!"}
                                        </p>
                                        
                                        {/* Vibe Chips */}
                                        {stats?.vibe?.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {stats.vibe.map((v: string) => (
                                                    <span key={v} className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10 shadow-sm">
                                                        {v}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                         <div>
                            <h2 className="text-xl font-bold text-white">Activity Timeline</h2>
                            <div className="flex gap-5 mt-1">
                                <span className="text-sm font-medium text-gray-400">Total Active Days: <span className="text-white">{stats?.appStreak || 0}</span></span>
                                <span className="text-sm font-medium text-gray-400">Message Sent Today - <span className="text-white">{stats?.messagesToday || 0}</span></span>
                            </div>
                         </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Streak Counter */}
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <Flame className="w-24 h-24 text-orange-500 animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
                                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full" />
                            </div>
                            <div className="text-center mt-4">
                                <span className="block text-5xl font-black text-white">{stats?.appStreak || 0}</span>
                                <span className="text-sm font-bold text-orange-500 tracking-widest uppercase">Day Streak</span>
                            </div>
                        </div>

                        {/* Weekly Grid */}
                        <div className="flex-1 w-full">
                            <div className="grid grid-cols-7 gap-3 mb-6">
                                {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, index) => {
                                    const today = new Date();
                                    const currentDayIndex = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun
                                    // Check if this day index is within the active streak range relative to today
                                    // Logic: Day is active if it is today or previous (streak-1) days.
                                    // Limitation: This visualization only works accurately if the streak is within the current week view. 
                                    // For longer streaks, it basically means all days up to today are active.
                                    
                                    // Simple logic for visual:
                                    // If day is in future (index > currentDayIndex) -> Inactive (Empty)
                                    // If day is past or today:
                                    // Check if (currentDayIndex - index) < streak
                                    
                                    const isFuture = index > currentDayIndex;
                                    const isActive = !isFuture && (currentDayIndex - index) < (stats?.appStreak || 0);
                                    
                                    return (
                                        <div key={day} className="flex flex-col items-center gap-3">
                                            <div className={`w-full aspect-square rounded-xl transition-all duration-500 ${
                                                isActive 
                                                ? "bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-100 border border-orange-500/50" 
                                                : "bg-[#1a1a1a] border border-white/5 border-dashed"
                                            }`} />
                                            <span className={`text-[10px] font-bold tracking-wider ${isActive ? "text-white" : "text-gray-600"}`}>{day}</span>
                                        </div>
                                    );
                                })}
                            </div>

                             {/* Footer Banner */}
                             <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 flex items-center gap-4">
                                <div className="p-2 bg-orange-500/10 rounded-full">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                </div>
                                <p className="text-sm text-gray-300">
                                    Complete one activity today to keep your streak alive and unlock the <span className="text-orange-400 font-bold">Phoenix badge</span>!
                                </p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Vibe Check */}
                <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Star className="w-6 h-6 text-yellow-400 fill-current" /> Vibe Check
                        </h2>
                        <span className="text-sm text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                            {stats?.vibe?.length || 0}/3 Selected
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        {VIBES.map((vibe) => {
                            const isSelected = stats?.vibe?.includes(vibe);
                            return (
                                <button
                                    key={vibe}
                                    onClick={() => handleVibeToggle(vibe)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform active:scale-95 border ${
                                        isSelected 
                                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                                        : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    }`}
                                >
                                    {vibe}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
