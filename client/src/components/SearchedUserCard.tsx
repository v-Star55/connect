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

    // console.log(user.profilePicture)

    const renderAction = () => {
        if (user.connectionStatus === "accepted") {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 transition-all shadow-sm shadow-green-500/5">
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase">Connected</span>
                </div>
            );
        }
        if (user.connectionStatus === "pending") {
            return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 transition-all shadow-sm shadow-yellow-500/5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold tracking-wide uppercase">Pending</span>
                </div>
            );
        }
        return (
            <button 
                onClick={addFriend} 
                className="group/btn relative px-4 py-2 rounded-xl bg-white/5 hover:bg-green-500 text-gray-400 hover:text-white transition-all overflow-hidden border border-white/5 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
            >
                <span className="relative z-10 flex items-center gap-2 font-medium">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm">Connect</span>
                </span>
            </button>
        );
    };


    return (
        <div className="group relative bg-[#121212]/80 backdrop-blur-md border border-white/10 hover:border-green-500/30 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 overflow-hidden">
            {/* Gradient Glow */}
            <div className="absolute inset-0 bg-linear-to-tr from-green-500/0 via-transparent to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
            
            <div className="relative flex items-center gap-4 z-10 w-full overflow-hidden">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-linear-to-br from-white/10 to-white/5 p-px group-hover:from-green-500 group-hover:to-blue-500 transition-colors duration-300">
                        <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden">
                            {user.profilePicture ? (
                                <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <span className="font-bold text-lg text-green-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-green-400 group-hover:to-blue-500 transition-all">
                                    {user.name[0]?.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Status Dot (Optional - can use isOnline if available) */}
                    {/* <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#121212] rounded-full"></div> */}
                </div>
                
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base truncate group-hover:text-green-400 transition-colors">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">@{user.username}</p>
                    
                    <div className="mt-2 flex justify-start">
                         {renderAction()}
                    </div>
                </div>
            </div>
            
             {/* Decorative Elements */}
             <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
        </div>
    );
}