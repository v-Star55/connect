import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../slice/auth/authSlice";
import { logoutApi } from "../api/api";
import { 
  Search, 
  Bell, 
  UserPlus, 
  User, 
  LogOut, 
  Settings, 
  LayoutDashboard,
} from "lucide-react";
import toast from "react-hot-toast";
import ConnectionRequestsModal from "./ConnectionRequestsModal";

const Sidebar = () => {
    const user = useSelector((state: any) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryClient = useQueryClient();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        try {
            await logoutApi();
            toast.success("Logged out successfully");
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            dispatch(logout());
            queryClient.removeQueries();
            navigate("/login");
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        { icon: LayoutDashboard, label: "Home", path: "/" },
        { icon: Search, label: "Search", path: "/search" },
    ];

    return (
        <aside className="w-20 lg:w-24 h-screen sticky top-0 flex flex-col items-center py-8 border-r border-white/5 bg-[#080808] z-50">
            {/* Logo */}
            <Link to="/" className="mb-12 group">
                <img src="/onlyLogo.png" alt="Logo" className="w-12 h-12 object-contain transition-transform group-hover:scale-110" />
            </Link>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-6">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`p-4 rounded-2xl transition-all relative group ${
                            location.pathname === item.path 
                                ? "bg-purple-600/20 text-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.1)]" 
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                    >
                        <item.icon className="w-6 h-6" />
                        {/* Tooltip */}
                        <span className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                        </span>
                    </Link>
                ))}

                <button 
                    onClick={() => setIsRequestsModalOpen(true)}
                    className="p-4 rounded-2xl text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-all relative group"
                >
                    <UserPlus className="w-6 h-6" />
                    <span className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full border border-[#080808]"></span>
                    <span className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Requests
                    </span>
                </button>

                <button className="p-4 rounded-2xl text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all relative group">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full border border-[#080808]"></span>
                    <span className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        Notifications
                    </span>
                </button>
            </nav>

            {/* Footer / Profile */}
            <div className="mt-auto relative" ref={profileMenuRef}>
                <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-1 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                    <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-green-400 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-xl bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                             {user?.profilePicture ? (
                                 <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                             ) : (
                                 <span className="text-sm font-bold text-white">{user?.name?.[0].toUpperCase() || "U"}</span>
                             )}
                        </div>
                    </div>
                </button>

                {/* Profile Menu */}
                {isProfileMenuOpen && (
                    <div className="absolute bottom-0 left-full ml-4 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200 z-50">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.username || "@username"}</p>
                        </div>
                        <div className="p-2">
                            <Link 
                                to="/profile" 
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                onClick={() => setIsProfileMenuOpen(false)}
                            >
                                <User className="w-4 h-4" />
                                Profile
                            </Link>
                            <button 
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                                onClick={() => setIsProfileMenuOpen(false)}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                        </div>
                        <div className="p-2 border-t border-white/5">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConnectionRequestsModal 
                isOpen={isRequestsModalOpen} 
                onClose={() => setIsRequestsModalOpen(false)} 
            />
        </aside>
    );
};

export default Sidebar;
