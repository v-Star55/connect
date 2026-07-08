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
        <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-[#0c0c0e] flex flex-col font-outfit">
            <div className="flex-1 bg-white text-black rounded-[24px] overflow-hidden flex h-full border border-gray-100 shadow-2xl relative">
                {/* List Selection Area */}
                <div className="w-80 lg:w-96 flex flex-col border-r border-gray-100 bg-white h-full overflow-hidden relative">
                    <div className="p-6 space-y-6 shrink-0 relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-zinc-950">Messages</h1>
                                <p className="text-[11px] text-zinc-400 mt-0.5">Stay connected with everyone</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-sm font-black text-zinc-600 shadow-xs">
                                {chats.length}
                            </div>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-600 transition-colors z-10" />
                            <input 
                                type="text" 
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="relative w-full bg-zinc-50/50 border border-zinc-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300 focus:bg-zinc-50 transition-all duration-300"
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
                                        className={`w-full group flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer transition-all duration-300 border text-left relative overflow-hidden ${
                                            activeChat?.chatId === chat.chatId 
                                                ? "bg-[#f0f7ec] border-[#d8ecd0] shadow-xs" 
                                                : "bg-transparent border-transparent hover:bg-zinc-50 hover:border-zinc-100"
                                        }`}
                                    >
                                        {activeChat?.chatId === chat.chatId && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#82c91e] rounded-full" />
                                        )}
                                        <div className="relative flex-shrink-0">
                                            <img 
                                                src={chat.profilePicture || "/default-avatar.png"} 
                                                alt={chat.name} 
                                                className={`relative w-12 h-12 rounded-2xl object-cover ring-2 transition-all duration-300 ${
                                                    activeChat?.chatId === chat.chatId ? "ring-[#82c91e]/50 scale-105" : "ring-zinc-100 group-hover:ring-zinc-200"
                                                }`}
                                            />
                                            {/* Green status dot for chats, mockup shows green dot */}
                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#40c057] rounded-full border-2 border-white shadow-xs"></span>
                                            
                                            {(chat.unreadCount ?? 0) > 0 && (
                                                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-[#82c91e] text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-xs">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className={`font-bold truncate transition-colors ${activeChat?.chatId === chat.chatId ? "text-zinc-900" : "text-zinc-800 group-hover:text-zinc-950"}`}>
                                                    {chat.name}
                                                </p>
                                            </div>
                                            <p className="text-xs text-zinc-500 truncate font-medium">
                                                {chat.lastMessage?.content || "Start the conversation..."}
                                            </p>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-all duration-300 ${activeChat?.chatId === chat.chatId ? "opacity-100 translate-x-0 text-[#82c91e]" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 text-zinc-400"}`} />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Empty state when no chats */}
                        {filteredChats.length === 0 && searchQuery.trim() === "" && (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <div className="w-20 h-20 rounded-3xl bg-zinc-50 flex items-center justify-center mb-4 border border-zinc-100">
                                    <MessageSquare className="w-8 h-8 text-zinc-400" />
                                </div>
                                <p className="text-zinc-600 font-medium">No conversations yet</p>
                                <p className="text-zinc-400 text-sm mt-1">Search for people to start chatting</p>
                            </div>
                        )}

                        {/* New Connections Search Section */}
                        {searchQuery.trim() !== "" && filteredConnections.length > 0 && (
                            <div className="space-y-1.5 pt-4">
                                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
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
                                            className="w-full group flex items-center gap-4 p-3.5 rounded-2xl cursor-pointer hover:bg-zinc-50 hover:border-zinc-150 transition-all duration-300 border border-transparent text-left"
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img 
                                                    src={otherUser.profilePicture || "/default-avatar.png"} 
                                                    alt={otherUser.name} 
                                                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-zinc-100 group-hover:ring-zinc-200 transition-all duration-300"
                                                />
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#40c057] rounded-full border border-white"></span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-zinc-800 truncate group-hover:text-zinc-950 transition-colors">{otherUser.name}</p>
                                                <p className="text-xs text-zinc-400 truncate font-medium">@{otherUser.username}</p>
                                            </div>
                                            <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-600 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {searchQuery.trim() !== "" && filteredChats.length === 0 && filteredConnections.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mx-auto mb-4 border border-zinc-100">
                                    <Search className="w-6 h-6 text-zinc-400" />
                                </div>
                                <p className="text-zinc-500 font-medium">No results found</p>
                                <p className="text-zinc-400 text-sm mt-1">Try a different search term</p>
                            </div>
                        )}

                        {/* Load More Button for Chats */}
                        {!searchQuery && hasMoreChats && (
                            <button 
                                onClick={() => fetchNextChats()}
                                className="w-full py-4 text-xs text-center text-zinc-500 hover:text-zinc-800 transition-colors duration-300 font-medium cursor-pointer"
                            >
                                {isFetchingMoreChats ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-3 h-3 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
                                        Loading...
                                    </span>
                                ) : "Load more chats"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 h-full overflow-hidden bg-white">
                    <ChatScreen 
                        key={activeChat?.chatId || activeChat?.otherUserId} 
                        activeChat={activeChat} 
                        currentUserId={userId} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Home;