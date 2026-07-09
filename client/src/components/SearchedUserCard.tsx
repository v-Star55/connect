import { UserPlus, Clock, Check, CheckCircle2 } from "lucide-react";
import { addFriendApi } from "../api/api";
import toast from "react-hot-toast";

type User = {
    _id: string;
    name: string;
    username: string;
    profilePicture: string | null;
    connectionStatus?: "pending" | "accepted" | "rejected" | "blocked" | null;
    isOnline?: boolean;
    stats?: {
        vibe?: string[];
    };
};

export default function SearchedUserCard({ user }: { readonly user: User }) {

    const addFriend = async () => {
        try {
            const res = await addFriendApi(user._id);
            toast.success(res.message);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add friend");
        }
    };

    const renderAction = () => {
        if (user.connectionStatus === "accepted") {
            return (
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 text-xs font-bold select-none shrink-0">
                    <Check className="w-4 h-4" />
                    <span>Connected</span>
                </div>
            );
        }
        if (user.connectionStatus === "pending") {
            return (
                <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-bold select-none shrink-0">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <span>Pending</span>
                </div>
            );
        }
        return (
            <button 
                onClick={addFriend} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/10 hover:scale-[1.03] active:scale-[0.97] cursor-pointer shrink-0"
            >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
            </button>
        );
    };

    // Determine subtag details based on name to keep it dynamic but stable
    const mockTags = [
        "Designer • Coffee Enthusiast • Traveler",
        "Photographer • Dreamer • Music Lover",
        "Developer • Gamer • Anime Fan",
        "Writer • Book Lover • Explorer",
        "Creator • Tech Enthusiast • Runner"
    ];
    const userIndex = user.name.charCodeAt(0) % mockTags.length;
    const tagString = mockTags[userIndex];

    return (
        <div className="group relative flex items-center justify-between p-4 bg-black/5 hover:bg-white/10 border border-white/10 hover:border-white/15 rounded-2xl transition-all duration-300 shadow-xs hover:shadow-md font-outfit">
            {/* Left side: Avatar and details */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Squirclish/Rounded Avatar wrapper */}
                <div className="relative shrink-0 select-none">
                    <div className="w-14 h-14 rounded-2xl p-[2px] bg-white/10 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-indigo-500 transition-all duration-300">
                        <div className="w-full h-full rounded-[14px] bg-[#18112e]/90 flex items-center justify-center overflow-hidden border border-white/5">
                            {user.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                            ) : (
                                <span className="font-extrabold text-lg text-white/40 group-hover:text-white transition-colors">
                                    {user.name[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Active Status Indicator Dot */}
                    {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#120b24] rounded-full shadow-md animate-pulse"></div>
                    )}
                </div>

                {/* Text Details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-extrabold text-white text-base leading-none truncate">
                            {user.name}
                        </h3>
                        {/* Verified badge */}
                        <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/10 shrink-0" />
                    </div>
                    <p className="text-xs text-white/55 mt-1 truncate">@{user.username}</p>
                    {user.stats?.vibe && user.stats.vibe.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                            {user.stats.vibe.map((vibeTag) => (
                                <span key={vibeTag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/70 font-semibold font-outfit">
                                    {vibeTag}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-white/40 mt-1 truncate font-medium">
                            {tagString}
                        </p>
                    )}
                </div>
            </div>

            {/* Right side: Connect CTA */}
            <div className="ml-4 shrink-0">
                {renderAction()}
            </div>
        </div>
    );
}