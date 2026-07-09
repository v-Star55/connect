import { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Search, MessageSquare } from "lucide-react";
import { getUserConnectionApi, getChatsByUserApi } from "../api/api";

import ChatScreen from "../components/ChatScreen";

interface Chat {
    otherUserId: string;
    name: string;
    username: string;
    profilePicture?: string;
    type: "private" | "group";
    chatId?: string;
    lastMessage?: {
        content: string;
        createdAt?: string;
    };
    lastMessageAt?: string;
    unreadCount?: number;
    vibes?: string[];
    isBlockedByMe?: boolean;
    isBlockedByOther?: boolean;
}

interface Connection {
    _id: string;
    requester: {
        _id: string;
        name: string;
        username: string;
        profilePicture?: string;
    };
    receiver: {
        _id: string;
        name: string;
        username: string;
        profilePicture?: string;
    };
}

const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d`;
};

const Home = () => {
    const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
    const userId = user?.id || user?._id;
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const { setIsChatOpen } = useOutletContext<{ setIsChatOpen: (open: boolean) => void }>();

    useEffect(() => {
        setIsChatOpen(!!activeChat);
        return () => setIsChatOpen(false);
    }, [activeChat, setIsChatOpen]);

    const { 
        data: chatsData, 
        fetchNextPage: fetchNextChats, 
        hasNextPage: hasMoreChats, 
        isFetchingNextPage: isFetchingMoreChats 
    } = useInfiniteQuery({
        queryKey: ['my-chats'],
        queryFn: ({ pageParam }) => getChatsByUserApi(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.next,
    });

    const { 
        data: connectionsData,
    } = useInfiniteQuery({
        queryKey: ['connections'],
        queryFn: ({ pageParam }) => getUserConnectionApi(pageParam as number),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.next,
    });

    const chats = chatsData?.pages.flatMap(page => page.chats) || [];
    const connections = connectionsData?.pages.flatMap(page => page.connections || page) || [];

    // Filtered lists for search
    const filteredChats = searchQuery.trim() === "" 
        ? chats 
        : chats.filter(chat => 
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.username?.toLowerCase().includes(searchQuery.toLowerCase())
          );

    const filteredConnections = searchQuery.trim() === "" 
        ? [] 
        : connections.filter(conn => {
            const otherUser = conn.requester._id === userId ? conn.receiver : conn.requester;
            return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   otherUser.username.toLowerCase().includes(searchQuery.toLowerCase());
          });

    return (
        <div className="flex-1 h-full p-3 md:p-4 md:pl-2 overflow-hidden bg-transparent flex flex-row gap-4 font-outfit z-10 relative">
            
            {/* List Selection Area - Standalone Glass Card */}
            <div className={`w-full md:w-80 lg:w-96 flex flex-col backdrop-blur-2xl border border-white/15 rounded-[32px] overflow-hidden h-full relative ${
                activeChat ? "hidden md:flex" : "flex"
            }`}>
                <div className="p-6 space-y-6 shrink-0 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-black text-white">Messages</h1>
                            <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black tracking-wide bg-violet-500/30 text-white border border-white/10">
                                {chats.length}
                            </div>
                        </div>
                        <button 
                            onClick={() => searchInputRef.current?.focus()}
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white shadow-sm transition-all hover:scale-[1.05] cursor-pointer"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 group-focus-within:text-white transition-colors z-10" />
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative w-full bg-white/10 border border-white/15 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/15 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-8 space-y-3 scrollbar-hide relative z-10">
                    {/* Existing Chats Section */}
                    {filteredChats.length > 0 && (
                        <div className="space-y-1.5">
                            {filteredChats.map((chat: Chat) => (
                                <button 
                                    key={chat.chatId} 
                                    onClick={() => setActiveChat(chat)}
                                    className={`w-full group flex items-center gap-4.5 p-3.5 rounded-[24px] cursor-pointer transition-all duration-300 border text-left relative overflow-hidden ${
                                        activeChat?.chatId === chat.chatId 
                                            ? "bg-gradient-to-r from-violet-500/25 to-indigo-500/25 border-white/20 shadow-lg text-white" 
                                            : "bg-transparent border-transparent text-white/85 hover:text-white hover:bg-white/10 hover:border-white/10"
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img 
                                            src={chat.profilePicture || "/default-avatar.png"} 
                                            alt={chat.name} 
                                            className={`relative w-12 h-12 rounded-full object-cover ring-2 transition-all duration-300 ${
                                                activeChat?.chatId === chat.chatId ? "ring-white/50 scale-105" : "ring-white/10 group-hover:ring-white/30"
                                            }`}
                                        />
                                        {/* Status dot */}
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#40c057] rounded-full border-2 border-white/40 shadow-xs"></span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-bold truncate text-[14px]">
                                                {chat.name}
                                            </p>
                                            <span className="text-[10px] text-white/45 font-medium shrink-0 ml-2">
                                                {formatRelativeTime(chat.lastMessage?.createdAt || chat.lastMessageAt)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <p className="text-xs text-white/60 truncate font-medium flex-1">
                                                {chat.lastMessage?.content || "Start the conversation..."}
                                            </p>
                                            {(chat.unreadCount ?? 0) > 0 && (
                                                <span className="min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[9px] font-black flex items-center justify-center rounded-full shrink-0 border border-white/10 shadow-xs">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty state when no chats */}
                    {filteredChats.length === 0 && searchQuery.trim() === "" && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border border-white/15 text-white/60">
                                <MessageSquare className="w-7 h-7" />
                            </div>
                            <p className="text-white font-medium">No conversations yet</p>
                            <p className="text-white/50 text-xs mt-1">Search for people to start chatting</p>
                        </div>
                    )}

                    {/* New Connections Search Section */}
                    {searchQuery.trim() !== "" && filteredConnections.length > 0 && (
                        <div className="space-y-1.5 pt-4">
                            <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#40c057] animate-pulse" />
                                Start New Chat
                            </p>
                            {filteredConnections.map((conn: Connection) => {
                                const otherUser = conn.requester._id === userId ? conn.receiver : conn.requester;
                                
                                if (chats.some(c => c.otherUserId === otherUser._id)) return null;

                                const handleStartChat = () => {
                                    setActiveChat({
                                        otherUserId: otherUser._id,
                                        name: otherUser.name,
                                        username: otherUser.username,
                                        profilePicture: otherUser.profilePicture,
                                        type: "private"
                                    });
                                    setSearchQuery("");
                                };

                                return (
                                    <button 
                                        key={conn._id} 
                                        onClick={handleStartChat}
                                        className="w-full group flex items-center gap-4.5 p-3.5 rounded-[24px] cursor-pointer hover:bg-white/10 hover:border-white/15 transition-all duration-300 border border-transparent text-left text-white/85"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                src={otherUser.profilePicture || "/default-avatar.png"} 
                                                alt={otherUser.name} 
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-white/35 transition-all duration-300"
                                            />
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#40c057] rounded-full border border-white/40"></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate group-hover:text-white transition-colors text-[14px]">{otherUser.name}</p>
                                            <p className="text-xs text-white/50 truncate font-medium">@{otherUser.username}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-white/10 text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {searchQuery.trim() !== "" && filteredChats.length === 0 && filteredConnections.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 border border-white/15 text-white/50">
                                <Search className="w-6 h-6" />
                            </div>
                            <p className="text-white font-medium">No results found</p>
                            <p className="text-white/40 text-xs mt-1">Try a different search term</p>
                        </div>
                    )}

                    {/* Load More Button for Chats */}
                    {!searchQuery && hasMoreChats && (
                        <button 
                            onClick={() => fetchNextChats()}
                            className="w-full py-4 text-xs text-center text-white/50 hover:text-white transition-colors duration-300 font-medium cursor-pointer"
                        >
                            {isFetchingMoreChats ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Loading...
                                </span>
                            ) : "Load more chats"}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Chat Area - Standalone Glass Card */}
            <div className={`flex-1 h-full overflow-hidden  backdrop-blur-2xl border border-white/25 rounded-[32px] relative ${
                !activeChat ? "hidden md:block" : "block"
            }`}>
                <ChatScreen 
                    key={activeChat?.chatId || activeChat?.otherUserId} 
                    activeChat={activeChat} 
                    currentUserId={userId}
                    onBack={() => setActiveChat(null)}
                />
            </div>

        </div>
    );
};

export default Home;