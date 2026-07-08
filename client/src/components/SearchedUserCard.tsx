import { UserPlus, Clock, Check } from "lucide-react";
import { addFriendApi } from "../api/api";
import toast from "react-hot-toast";

type User = {
    _id: string;
    name: string;
    username: string;
    profilePicture: string | null;
    connectionStatus?: "pending" | "accepted" | "rejected" | "blocked" | null;
};

export default function SearchedUserCard({ user }: { readonly user: User }) {

    const addFriend = async () => {
        console.log(user._id)
        try {
            const res = await addFriendApi(user._id)
            toast.success(res.message)
        } catch (error: any) {
            console.log(error)
            toast.error(error.response?.data?.message)
        }
    }

    const renderAction = () => {
        if (user.connectionStatus === "accepted") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-bold select-none">
                    <Check className="w-3.5 h-3.5" />
                    <span>CONNECTED</span>
                </div>
            );
        }
        if (user.connectionStatus === "pending") {
            return (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[11px] font-bold select-none">
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>PENDING</span>
                </div>
            );
        }
        return (
            <button 
                onClick={addFriend} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Connect</span>
            </button>
        );
    };

    return (
        <div className="group relative bg-zinc-50/50 hover:bg-white border border-zinc-150/70 hover:border-zinc-200 hover:shadow-md rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden min-h-[160px]">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-lime-500/5 to-emerald-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-start gap-4">
                {/* Avatar with dynamic border */}
                <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-full p-[2px] bg-zinc-200 group-hover:bg-gradient-to-r group-hover:from-[#c5ff1a] group-hover:to-emerald-400 transition-all duration-300">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                                <img 
                                    src={user.profilePicture} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                            ) : (
                                <span className="font-extrabold text-lg text-zinc-400 group-hover:text-zinc-800 transition-colors">
                                    {user.name[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-950 text-base leading-snug truncate">
                        {user.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">@{user.username}</p>
                </div>
            </div>

            {/* Footer containing the action */}
            <div className="mt-4 pt-3 border-t border-zinc-100/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-zinc-400 font-medium">Connect User</span>
                <div>
                    {renderAction()}
                </div>
            </div>
        </div>
    );
}