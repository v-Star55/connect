import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Search, MessageSquare, ChevronRight } from "lucide-react";
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
    };
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

const Home = () => {
    const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
    const userId = user?.id || user?._id;
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

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
        <div className="flex h-full bg-gradient-to-br from-[#030303] via-[#0a0512] to-[#030303] text-white overflow-hidden font-outfit">
            {/* List Selection Area */}
            <div className="w-80 lg:w-96 flex flex-col border-r border-white/5 bg-gradient-to-b from-[#080808] to-[#050505] h-full overflow-hidden relative">
                {/* Decorative gradient orb */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="p-6 space-y-6 shrink-0 relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Messages</h1>
                            <p className="text-[11px] text-gray-500 mt-0.5">Stay connected with everyone</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/20 via-fuchsia-600/10 to-purple-600/20 flex items-center justify-center text-sm font-black text-purple-400 border border-purple-500/20 shadow-lg shadow-purple-900/10">
                            {chats.length}
                        </div>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-fuchsia-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-400 transition-colors z-10" />
                        <input 
                            type="text" 
                            placeholder="Search messages or people..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="relative w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.05] transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-8 space-y-3 scrollbar-hide relative z-10">
                    {/* Existing Chats Section */}
                    {filteredChats.length > 0 && (
                        <div className="space-y-1.5">
                            {searchQuery.trim() !== "" && (
                                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Recent Chats</p>
                            )}
                            {filteredChats.map((chat: Chat) => (
                                <button 
                                    key={chat.chatId} 
                                    onClick={() => setActiveChat(chat)}
                                    className={`w-full group flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border text-left relative overflow-hidden ${
                                        activeChat?.chatId === chat.chatId 
                                            ? "bg-gradient-to-r from-purple-600/15 via-purple-600/10 to-transparent border-purple-500/30 shadow-lg shadow-purple-900/10" 
                                            : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5"
                                    }`}
                                >
                                    {activeChat?.chatId === chat.chatId && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-fuchsia-500 rounded-full" />
                                    )}
                                    <div className="relative">
                                        <div className={`absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-fuchsia-600/30 rounded-2xl blur-lg transition-opacity ${activeChat?.chatId === chat.chatId ? "opacity-100" : "opacity-0"}`} />
                                        <img 
                                            src={chat.profilePicture || "/default-avatar.png"} 
                                            alt={chat.name} 
                                            className={`relative w-12 h-12 rounded-2xl object-cover ring-2 transition-all duration-300 ${
                                                activeChat?.chatId === chat.chatId ? "ring-purple-500/50 scale-105" : "ring-white/5 group-hover:ring-white/10"
                                            }`}
                                        />
                                        {(chat.unreadCount ?? 0) > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-[10px] font-black flex items-center justify-center rounded-full border-2 border-[#050505] shadow-lg shadow-purple-900/50">
                                                {chat.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className={`font-bold truncate transition-colors ${activeChat?.chatId === chat.chatId ? "text-white" : "text-gray-200 group-hover:text-white"}`}>
                                                {chat.name}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate font-medium">
                                            {chat.lastMessage?.content || "Start the conversation..."}
                                        </p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-all duration-300 ${activeChat?.chatId === chat.chatId ? "opacity-100 translate-x-0 text-purple-400" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 text-gray-600"}`} />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Empty state when no chats */}
                    {filteredChats.length === 0 && searchQuery.trim() === "" && (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600/10 to-fuchsia-600/10 flex items-center justify-center mb-4 border border-purple-500/10">
                                <MessageSquare className="w-8 h-8 text-purple-500/50" />
                            </div>
                            <p className="text-gray-400 font-medium">No conversations yet</p>
                            <p className="text-gray-600 text-sm mt-1">Search for people to start chatting</p>
                        </div>
                    )}

                    {/* New Connections Search Section */}
                    {searchQuery.trim() !== "" && filteredConnections.length > 0 && (
                        <div className="space-y-1.5 pt-4">
                            <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Start New Chat
                            </p>
                            {filteredConnections.map((conn: Connection) => {
                                const otherUser = conn.requester._id === userId ? conn.receiver : conn.requester;
                                
                                // Skip if already in chat list (we already showed them above if matching)
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
                                        className="w-full group flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer hover:bg-gradient-to-r hover:from-green-600/5 hover:to-transparent transition-all duration-300 border border-transparent hover:border-green-500/20 text-left"
                                    >
                                        <img 
                                            src={otherUser.profilePicture || "/default-avatar.png"} 
                                            alt={otherUser.name} 
                                            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-green-500/30 transition-all duration-300"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-200 truncate group-hover:text-white transition-colors">{otherUser.name}</p>
                                            <p className="text-xs text-gray-500 truncate font-medium">@{otherUser.username}</p>
                                        </div>
                                        <div className="p-2.5 rounded-xl bg-green-600/10 text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {searchQuery.trim() !== "" && filteredChats.length === 0 && filteredConnections.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6 text-gray-600" />
                            </div>
                            <p className="text-gray-400 font-medium">No results found</p>
                            <p className="text-gray-600 text-sm mt-1">Try a different search term</p>
                        </div>
                    )}

                    {/* Load More Button for Chats */}
                    {!searchQuery && hasMoreChats && (
                        <button 
                            onClick={() => fetchNextChats()}
                            className="w-full py-4 text-xs text-center text-gray-500 hover:text-purple-400 transition-colors duration-300 font-medium"
                        >
                            {isFetchingMoreChats ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                    Loading...
                                </span>
                            ) : "Load more chats"}
                        </button>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 h-full overflow-hidden bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
                <ChatScreen 
                    key={activeChat?.chatId || activeChat?.otherUserId} 
                    activeChat={activeChat} 
                    currentUserId={userId} 
                />
            </div>
        </div>
    );
};

export default Home;