import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { logout } from "../slice/auth/authSlice";
import { logoutApi, getUserConnectionRequestApi } from "../api/api";
import { 
  Search, 
  UserPlus, 
  User, 
  LogOut, 
  Settings, 
  MessageSquare,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import ConfirmationModal from "./ui/ConfirmationModal";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";

const Sidebar = ({ onOpenRequests }: { readonly onOpenRequests: () => void }) => {
    const user = useSelector((state: any) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutApi();
            toast.success("Logged out successfully");
        } catch (error) {
            console.log("Logout error:", error);
        } finally {
            setIsLoggingOut(false);
            setIsLogoutConfirmOpen(false);
            dispatch(logout());
            queryClient.removeQueries();
            navigate("/login");
        }
    };

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

    const menuItems = [
        { 
            icon: MessageSquare, 
            label: "Messages", 
            type: "link", 
            path: "/" 
        },
        { 
            icon: Search, 
            label: "Search", 
            type: "link", 
            path: "/search" 
        },
        { 
            icon: UserPlus, 
            label: "Requests", 
            type: "button", 
            onClick: onOpenRequests
        },
        { 
            icon: User, 
            label: "Profile", 
            type: "link", 
            path: "/profile",
            isProfile: true 
        },
    ];

    return (
        <TooltipProvider>
            <ShadcnSidebar 
                collapsible="none" 
                className="!bg-transparent !border-none !shadow-none p-0 select-none relative h-full hidden xl:flex flex-col"
            >
                {/* Floating glassmorphic card container */}
                <div className="flex-1 flex flex-col justify-between m-4 mr-2  backdrop-blur-md border border-white/15 rounded-[32px] overflow-hidden relative font-outfit">
                    
                    {/* Upper Half: Logo & Main Navigation */}
                    <div className="flex flex-col flex-1">
                        {/* Logo / Header */}
                        <SidebarHeader className="p-6 mb-2 shrink-0">
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="p-2 bg-gradient-to-tr from-violet-500 to-indigo-500 rounded-xl shadow-md shadow-indigo-500/25">
                                    {/* Custom gradient cloud SVG */}
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <defs>
                                            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#c084fc" />
                                                <stop offset="100%" stopColor="#6366f1" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.48 0-.92.07-1.34.2-1.12-3-4.14-5.2-7.66-5.2A8 8 0 0 0 1 14a5.5 5.5 0 0 0 5.5 5.5z" fill="url(#cloudGrad)" stroke="none" />
                                        <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.48 0-.92.07-1.34.2-1.12-3-4.14-5.2-7.66-5.2A8 8 0 0 0 1 14a5.5 5.5 0 0 0 5.5 5.5z" fill="none" stroke="white" strokeWidth="1.5" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-white leading-none tracking-wide animate-in fade-in duration-300">
                                        Connect
                                    </span>
                                    <span className="text-[9px] font-extrabold text-white/60 leading-none tracking-wider uppercase mt-1">
                                        Always Connected
                                    </span>
                                </div>
                            </Link>
                        </SidebarHeader>

                        {/* Navigation Menu */}
                        <SidebarContent className="px-4 py-2 flex-1">
                            <SidebarGroup className="p-0">
                                <SidebarGroupContent>
                                    <SidebarMenu className="gap-2">
                                        {menuItems.map((item) => {
                                            const isActive = item.path ? location.pathname === item.path : false;
                                            const Icon = item.icon;

                                            return (
                                                <SidebarMenuItem key={item.label}>
                                                    <SidebarMenuButton
                                                        isActive={isActive}
                                                        tooltip={item.label}
                                                        className={`flex items-center justify-between p-3.5 h-12 rounded-xl transition-all relative group cursor-pointer w-full text-sm font-semibold border border-transparent ${
                                                            isActive 
                                                                ? "!bg-gradient-to-r !from-violet-500/25 !to-indigo-500/25 !text-white !border-white/20 !shadow-md shadow-indigo-500/5" 
                                                                : "!text-white/70 hover:!text-white hover:!bg-white/10"
                                                        }`}
                                                        render={
                                                            item.type === "link" && item.path ? (
                                                                <Link to={item.path} />
                                                            ) : (
                                                                <button onClick={item.onClick} />
                                                            )
                                                        }>
                                                        <div className="flex items-center gap-3.5">
                                                            {item.isProfile ? (
                                                                <img 
                                                                    src={user?.profilePicture || "/userFallback.png"} 
                                                                    alt="Profile" 
                                                                    className={`w-5 h-5 rounded-full object-cover border ${
                                                                        isActive ? "border-white" : "border-white/20 group-hover:border-white/50"
                                                                    }`} 
                                                                />
                                                            ) : (
                                                                <Icon className="w-5 h-5 flex-shrink-0" />
                                                            )}
                                                            <span>{item.isProfile ? (user?.name || item.label) : item.label}</span>
                                                        </div>

                                                        {/* Requests Badge */}
                                                        {item.label === "Requests" && requestsCount > 0 && (
                                                            <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black tracking-wide ${
                                                                isActive 
                                                                    ? "bg-white text-indigo-750" 
                                                                    : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-white/10"
                                                            }`}>
                                                                {requestsCount}
                                                            </span>
                                                        )}
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </div>

                    {/* Lower Half: Promo Card & Footer */}
                    <div className="shrink-0 flex flex-col">
                        
                        <div className="h-px bg-white/10 mx-6 my-2" />

                        {/* Settings Button */}
                        <div className="px-4 py-1">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Settings"
                                        className="flex items-center gap-3.5 p-3.5 h-12 rounded-xl transition-all relative group cursor-pointer w-full text-sm font-semibold !text-white/70 hover:!text-white hover:!bg-white/10"
                                        render={
                                            <button onClick={() => toast("Settings feature coming soon!", { icon: "⚙️" })} />
                                        }
                                    >
                                        <Settings className="w-5 h-5 flex-shrink-0" />
                                        <span>Settings</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </div>

                        {/* Logout Section */}
                        <SidebarFooter className="p-4 border-t border-white/10 bg-white/5 mt-2">
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        tooltip="Logout"
                                        className="flex items-center gap-3.5 p-3.5 h-12 rounded-xl transition-all relative group cursor-pointer w-full text-sm font-semibold !text-red-400 hover:!text-red-300 hover:!bg-red-500/10"
                                        render={
                                            <button onClick={() => setIsLogoutConfirmOpen(true)} />
                                        }
                                    >
                                        <LogOut className="w-5 h-5 flex-shrink-0" />
                                        <span>Logout</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </div>

                </div>
            </ShadcnSidebar>

            <ConfirmationModal
                isOpen={isLogoutConfirmOpen}
                onClose={() => setIsLogoutConfirmOpen(false)}
                onConfirm={handleLogout}
                title="Log out of Connect?"
                description="Are you sure you want to log out? You will need to sign in again to access your messages and streak active days."
                confirmText="Log Out"
                type="logout"
                isPending={isLoggingOut}
            />
        </TooltipProvider>
    );
};

export default Sidebar;
