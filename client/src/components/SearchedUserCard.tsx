import { UserPlus } from "lucide-react";
import { addFriendApi } from "../api/api";
import toast from "react-hot-toast";

type User = {
    _id: string;
    name: string;
    username: string;
    profilePicture: string | null;
};

export default function SearchedUserCard({ user }: { user: User }) {

    const addFriend=async()=>{
        console.log(user._id)
        try {
            const res=await addFriendApi(user._id)

            toast.success(res.message)
        } catch (error:any) {
            console.log(error)
            toast.error(error.response?.data?.message)
        }
    }

    console.log(user.profilePicture)


    return (
        <div className="group bg-[#0a0a0a] border border-white/5 hover:border-green-500/30 rounded-2xl p-5 flex items-center justify-between transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-400/20 to-blue-500/20 p-px">
                    <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                        {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-green-500">{user.name[0]?.toUpperCase()}</span>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{user.name}</h3>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
            </div>
            <button onClick={addFriend} className="p-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-green-500 hover:text-white transition-all transform active:scale-95">
                <UserPlus className="w-5 h-5" />
            </button>
        </div>
    );
}