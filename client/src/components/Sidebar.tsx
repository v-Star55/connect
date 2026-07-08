import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { logout } from "../slice/auth/authSlice";
import { logoutApi } from "../api/api";
import { 
  Search, 
  UserPlus, 
  User, 
  LogOut, 
  Settings, 
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import ConnectionRequestsModal from "./ConnectionRequestsModal";

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
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";

const Sidebar = () => {
    const user = useSelector((state: any) => state.auth.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    const { state } = useSidebar();
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

    const isExpanded = state === "expanded";

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
            onClick: () => setIsRequestsModalOpen(true)
        },
        { 
            icon: User, 
            label: "Profile", 
            type: "link", 
            path: "/profile",
            isProfile: true 
        },
    ];

    const bottomItems = [
        { 
            icon: Settings, 
            label: "Settings", 
            type: "button", 
            onClick: () => toast("Settings feature coming soon!", { icon: "⚙️" }) 
        },
        { 
            icon: LogOut, 
            label: "Logout", 
            type: "button", 
            onClick: handleLogout,
            isDanger: true 
        },
    ];

    return (
        <TooltipProvider>
            <ShadcnSidebar 
                collapsible="icon" 
                className="border-r border-zinc-900 bg-[#0c0c0e] py-6 select-none relative"
            >
                {/* Floating expand/collapse trigger button */}
                <SidebarTrigger className="absolute top-8 -right-3.5 w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-gray-400 hover:text-white transition-all shadow-md z-50 cursor-pointer hover:bg-zinc-700" />

                {/* Logo / Header */}
                <SidebarHeader className={`mb-6 w-full ${isExpanded ? "px-4" : "flex items-center justify-center p-0"}`}>
                    <Link to="/" className="flex items-center gap-3.5 group">
                        {isExpanded ? (
                            <span className="text-xl font-black text-white tracking-wide animate-in fade-in duration-300">
                                Connect
                            </span>
                        ) : (
                            <span className="text-xl font-black text-[#c5ff1a] tracking-wide animate-in fade-in duration-300">
                                C
                            </span>
                        )}
                    </Link>
                </SidebarHeader>

                {/* Main Content / Navigation Group */}
                <SidebarContent className={isExpanded ? "px-2" : "px-1"}>
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1.5">
                                {menuItems.map((item) => {
                                    const isActive = item.path ? location.pathname === item.path : false;
                                    const Icon = item.icon;

                                    return (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton
                                                isActive={isActive}
                                                tooltip={item.label}
                                                className="flex items-center gap-3.5 p-3 h-11 rounded-xl transition-all relative group cursor-pointer w-full text-zinc-400 hover:text-white hover:bg-zinc-800/40 data-active:bg-zinc-800/80 data-active:text-white data-active:font-semibold"
                                                render={
                                                    item.type === "link" && item.path ? (
                                                        <Link to={item.path} />
                                                    ) : (
                                                        <button onClick={item.onClick} />
                                                    )
                                                }
                                            >
                                                {item.isProfile && user?.profilePicture ? (
                                                    <img 
                                                        src={user.profilePicture} 
                                                        alt="Profile" 
                                                        className="w-5 h-5 rounded-full object-cover border border-zinc-700" 
                                                    />
                                                ) : (
                                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                                )}
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Bottom Footer Actions */}
                <SidebarFooter className={`mt-auto pt-6 border-t border-zinc-900/60 ${isExpanded ? "px-2" : "px-1"}`}>
                    <SidebarMenu className="gap-1.5">
                        {bottomItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <SidebarMenuItem key={item.label}>
                                    <SidebarMenuButton
                                        tooltip={item.label}
                                        className={`flex items-center gap-3.5 p-3 h-11 rounded-xl transition-all relative group cursor-pointer w-full ${
                                            item.isDanger 
                                                ? "text-red-400 hover:text-red-300 hover:bg-red-500/10" 
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                                        }`}
                                        render={
                                            <button onClick={item.onClick} />
                                        }
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarFooter>

                <ConnectionRequestsModal 
                    isOpen={isRequestsModalOpen} 
                    onClose={() => setIsRequestsModalOpen(false)} 
                />
            </ShadcnSidebar>
        </TooltipProvider>
    );
};

export default Sidebar;
