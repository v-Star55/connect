import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MessageSquare, Search, UserPlus, User } from "lucide-react";
import { getUserConnectionRequestApi } from "../api/api";

interface BottomBarProps {
    readonly onOpenRequests: () => void;
    readonly isChatOpen?: boolean;
}

const BottomBar = ({ onOpenRequests, isChatOpen = false }: BottomBarProps) => {
    const user = useSelector((state: any) => state.auth.user);
    const location = useLocation();

    // Fetch pending requests count dynamically
    const { data: requestsData } = useInfiniteQuery({
        queryKey: ["connection-requests"],
        queryFn: ({ pageParam }) => getUserConnectionRequestApi(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.next,
        staleTime: 5 * 60 * 1000,
    });
    
    const requestsCount = requestsData?.pages
        ? requestsData.pages.reduce((acc, page) => acc + (page?.requests?.length || 0), 0)
        : 0;

    const navItems = [
        {
            icon: MessageSquare,
            label: "Messages",
            type: "link",
            path: "/",
        },
        {
            icon: Search,
            label: "Search",
            type: "link",
            path: "/search",
        },
        {
            icon: UserPlus,
            label: "Requests",
            type: "button",
            onClick: onOpenRequests,
            badge: requestsCount,
        },
        {
            icon: User,
            label: "Profile",
            type: "link",
            path: "/profile",
            isProfile: true,
        },
    ];

    return (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-lg h-16 backdrop-blur-md bg-white/15 border border-white/15 rounded-full shadow-2xl z-50 flex items-center justify-around px-4 xl:hidden font-outfit transition-all duration-300 ${
            isChatOpen 
                ? "translate-y-28 opacity-0 pointer-events-none md:translate-y-0 md:opacity-100 md:pointer-events-auto" 
                : "translate-y-0 opacity-100 pointer-events-auto"
        }`}>
            {navItems.map((item) => {
                const isActive = item.path ? location.pathname === item.path : false;
                const Icon = item.icon;

                const buttonContent = (
                    <div className="relative flex items-center justify-center">
                        {item.isProfile ? (
                            <img 
                                src={user?.profilePicture || "/userFallback.png"} 
                                alt="Profile" 
                                className={`w-6 h-6 rounded-full object-cover border transition-all ${
                                    isActive ? "border-white scale-110" : "border-white/20 group-hover:border-white/50"
                                }`} 
                            />
                        ) : (
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-white/70 group-hover:text-white transition-colors"}`} />
                        )}
                        
                        {/* Request Badge */}
                        {item.badge && item.badge > 0 ? (
                            <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[8px] font-black h-4 min-w-[16px] px-1 rounded-full border border-white/15 flex items-center justify-center shadow-md">
                                {item.badge}
                            </span>
                        ) : null}
                    </div>
                );

                const baseClass = `group relative flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 ${
                    isActive 
                        ? "bg-gradient-to-tr from-violet-500/30 to-indigo-500/30 border border-white/20 scale-110 shadow-lg shadow-indigo-500/10" 
                        : "hover:scale-105"
                }`;

                if (item.type === "link" && item.path) {
                    return (
                        <Link 
                            key={item.label} 
                            to={item.path} 
                            className={baseClass}
                            aria-label={item.label}
                        >
                            {buttonContent}
                        </Link>
                    );
                }

                return (
                    <button 
                        key={item.label} 
                        onClick={item.onClick}
                        className={baseClass}
                        aria-label={item.label}
                    >
                        {buttonContent}
                    </button>
                );
            })}
        </div>
    );
};

export default BottomBar;
