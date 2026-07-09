import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getMessagesApi, blockUserApi, unblockUserApi, clearChatApi, toggleMuteApi, toggleReadReceiptsApi, createChatApi, sendMessageApi, editMessageApi, deleteMessageApi } from "../api/api";
import { Send, MoreVertical, Phone, Video, Smile, Paperclip, Loader2, ShieldAlert, Trash2, Eye, BellOff, Copy, Pencil, Check, X, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
} from "./ui/avatar";
import ConfirmationModal from "./ui/ConfirmationModal";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  isDeleted?: boolean;
  isEdited?: boolean;
}

interface ChatScreenProps {
  activeChat: {
    otherUserId?: string;
    name: string;
    username: string;
    profilePicture?: string;
    chatId?: string;
    type: "private" | "group";
    isBlockedByMe?: boolean;
    isBlockedByOther?: boolean;
    vibes?: string[];
  } | null;
  currentUserId: string;
  onStartChatClick?: () => void;
  onBack?: () => void;
}

const ChatScreen = ({ activeChat, currentUserId, onStartChatClick, onBack }: ChatScreenProps) => {
  const queryClient = useQueryClient();
  const user = useSelector((state: { auth: { user: any } }) => state.auth.user);
  const [messageText, setMessageText] = useState("");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [readReceipts, setReadReceipts] = useState(true); 
  const [chatId,setChatId] = useState<string | null>(activeChat?.chatId || null);
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [isBlockedByMe, setIsBlockedByMe] = useState(activeChat?.isBlockedByMe || false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(activeChat?.isBlockedByOther || false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const muteMutation = useMutation({
    mutationFn: (muted: boolean) => toggleMuteApi(chatId!, muted),
    onSuccess: (res) => {
      setIsMuted(res.isMuted);
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["my-chats"] });
    }
  });

  const readReceiptsMutation = useMutation({
    mutationFn: (enabled: boolean) => toggleReadReceiptsApi(chatId!, enabled),
    onSuccess: (res) => {
      setReadReceipts(res.showReadReceipts);
      toast.success(res.message);
    }
  });

  const clearChatMutation = useMutation({
    mutationFn: () => clearChatApi(chatId!),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
      queryClient.invalidateQueries({ queryKey: ["my-chats"] });
    }
  });

  useEffect(() => {
    if (user?.blockedUsers && activeChat?.otherUserId) {
      setIsBlockedByMe(user.blockedUsers.includes(activeChat.otherUserId));
    } else if (activeChat?.isBlockedByMe !== undefined) {
      setIsBlockedByMe(activeChat.isBlockedByMe);
    }
    
    if (activeChat?.isBlockedByOther !== undefined) {
      setIsBlockedByOther(activeChat.isBlockedByOther);
    }
  }, [user?.blockedUsers, activeChat?.otherUserId, activeChat?.isBlockedByMe, activeChat?.isBlockedByOther]);

  const blockUserMutation = useMutation({
    mutationFn: () => {
      if (!activeChat?.otherUserId) throw new Error("Other user ID is required");
      return blockUserApi(activeChat.otherUserId);
    },
    onSuccess: (res) => {
      toast.success(res.message);
      setIsBlockedByMe(true);
      setIsOptionsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    }
  });

  const handleUnblockUser = async () => {
    if (!activeChat?.otherUserId) return;
    try {
      await unblockUserApi(activeChat.otherUserId);
      setIsBlockedByMe(false);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("User unblocked");
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  const createChatMutation = useMutation({
    mutationFn: (chatData: { otherUserId: string; type: string }) => createChatApi(chatData.otherUserId, chatData.type),
    onSuccess: (res) => {
      console.log("Chat created/retrieved:", res.chat);
      setChatId(res.chat._id);
      queryClient.invalidateQueries({ queryKey: ["my-chats"] });
    },
    onError: () => {
      creationStartedRef.current = null; // Reset on error to allow retry
    }
  });

  const creationStartedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!chatId && activeChat?.otherUserId && creationStartedRef.current !== activeChat.otherUserId) {
      creationStartedRef.current = activeChat.otherUserId;
      console.log("Starting chat creation for:", activeChat.otherUserId);
      createChatMutation.mutate({ 
        otherUserId: activeChat.otherUserId, 
        type: activeChat.type 
      });
    }
  }, [chatId, activeChat?.otherUserId, activeChat?.type]); // eslint-disable-line react-hooks/exhaustive-deps


  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;
    try {
      const res = await editMessageApi(messageId, editingContent);
      const updatedMessage = res.updatedMessage;

      queryClient.setQueryData(["messages", chatId], (oldData: { pages: { messages: Message[] }[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) => m._id === messageId ? updatedMessage : m)
          }))
        };
      });

      socket.emit("editMessage", {
        chatId: chatId,
        messageId: messageId,
        content: editingContent,
        updatedMessage: updatedMessage
      });

      setEditingMessageId(null);
      setEditingContent("");
      toast.success("Message edited");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to edit message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setDeletingMessageId(messageId);
      
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 300));

      await deleteMessageApi(messageId);

      queryClient.setQueryData(["messages", chatId], (oldData: { pages: { messages: Message[] }[] } | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((m) => m._id === messageId ? { ...m, isDeleted: true } : m)
          }))
        };
      });

      socket.emit("deleteMessage", {
        chatId: chatId,
        messageId: messageId
      });

      setDeletingMessageId(null);
      toast.success("Message deleted");
    } catch (error) {
      
        setDeletingMessageId(null);
        toast.error("Failed to delete message");
    }
  };


  useEffect(() => {
    if (!chatId) return;
    
    console.log("Attempting to join socket room:", chatId);
    socket.emit("joinChat", chatId);
    
    // Cleanup
    return () => {
      console.log("Leaving socket room:", chatId);
      socket.emit("leaveChat", chatId);
    };
  }, [chatId]);

  const handleSendMessage = async () => {
    console.log("Attempting to send message. chatId:", chatId, "messageText:", messageText);
    if (!messageText.trim() || !chatId) return;

    try {
      const res = await sendMessageApi(chatId, messageText);
      const savedMessage = res.message;

      // Update local UI immediately
      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          // Check if already exists (via socket or earlier)
          const exists = newPages.some(page => page.messages.some((m: any) => m._id === savedMessage._id));
          if (exists) return oldData;

          newPages[0] = {
            ...newPages[0],
            messages: [savedMessage, ...newPages[0].messages],
          };
        }
        return { ...oldData, pages: newPages };
      });

      socket.emit("sendMessage", {
        chatId: chatId,
        message: savedMessage,
      });

      setMessageText("");
      // Real-time update locally (optional if socket echoes back)
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    const handleNewMessage = (message: any) => {
      console.log("Socket newMessage received:", message);
      
      const msgChatId = message.chatId?._id || message.chatId;
      
      if (String(msgChatId) === String(chatId)) {
        console.log("Updating local query data for chatId:", chatId);
        queryClient.setQueryData(["messages", chatId], (oldData: { pages: any[] } | undefined) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          if (newPages.length > 0) {
            // Check if message already exists (to avoid duplicates for sender)
            const exists = newPages.some(page => page.messages.some((m: any) => m._id === message._id));
            if (exists) return oldData;

            newPages[0] = {
              ...newPages[0],
              messages: [message, ...newPages[0].messages],
            };
          }
          return { ...oldData, pages: newPages };
        });
      } else {
        console.warn("Received message for different chat:", msgChatId, "Current:", chatId);
      }
    };

    const handleMessageEdited = (data: any) => {
      console.log("Socket messageEdited received:", data);
      if (String(data.chatId) === String(chatId)) {
        queryClient.setQueryData(["messages", chatId], (oldData: { pages: any[] } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((m: any) => m._id === data.messageId ? data.updatedMessage : m)
            }))
          };
        });
      }
    };

    const handleMessageDeleted = (data: any) => {
      console.log("Socket messageDeleted received:", data);
      if (String(data.chatId) === String(chatId)) {
        queryClient.setQueryData(["messages", chatId], (oldData: { pages: any[] } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((m: any) => m._id === data.messageId ? { ...m, isDeleted: true } : m)
            }))
          };
        });
      }
    };

    const handleUserBlocked = (data: any) => {
      if (data.chatId === chatId) {
        if (data.blockedUser === currentUserId) {
          setIsBlockedByOther(true);
        } else if (data.blockedBy === currentUserId) {
          setIsBlockedByMe(true);
          queryClient.invalidateQueries({ queryKey: ["me"] });
        }
      }
    };

    const handleUserUnblocked = (data: any) => {
      if (data.chatId === chatId) {
        if (data.unblockedUser === currentUserId) {
          setIsBlockedByOther(false);
        } else if (data.unblockedBy === currentUserId) {
          setIsBlockedByMe(false);
          queryClient.invalidateQueries({ queryKey: ["me"] });
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("userBlocked", handleUserBlocked);
    socket.on("userUnblocked", handleUserUnblocked);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("userBlocked", handleUserBlocked);
      socket.off("userUnblocked", handleUserUnblocked);
    };
  }, [chatId, queryClient, currentUserId]);

    


  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam }) => getMessagesApi(chatId!, pageParam),
    enabled: !!chatId,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeChat) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center select-none animate-in fade-in zoom-in-95 duration-500 bg-transparent">
        <div className="mb-8 w-16 h-16 flex items-center justify-center">
          {/* Centered Chat Bubble Icon */}
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-400 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/35 border border-white/20 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="8" y1="9" x2="16" y2="9" />
              <line x1="8" y1="13" x2="14" y2="13" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-white tracking-wide">No conversation selected</h2>
        <p className="text-sm text-white/60 mt-2 max-w-sm leading-relaxed font-medium">
          Choose a conversation from the list or start a new one!
        </p>
        
        {onStartChatClick && (
          <button 
            onClick={onStartChatClick}
            className="mt-6 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-500/80 to-indigo-500/80 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wide flex items-center gap-2 border border-white/10 shadow-lg shadow-indigo-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Start New Chat
          </button>
        )}
      </div>
    );
  }

  const messages = [...(data?.pages.flatMap((page) => page.messages) || [])].reverse();

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const touch = e.touches[0];
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    (target as any)._longPressTimer = setTimeout(() => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      const customEvent = new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX,
        clientY
      });
      target.dispatchEvent(customEvent);
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if ((target as any)._longPressTimer) {
      clearTimeout((target as any)._longPressTimer);
      delete (target as any)._longPressTimer;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if ((target as any)._longPressTimer) {
      clearTimeout((target as any)._longPressTimer);
      delete (target as any)._longPressTimer;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent text-white">
      {/* Header */}
      <div className="h-20 px-4 md:px-6 flex items-center justify-between border-b border-white/15 backdrop-blur-3xl relative z-40">
        <div className="flex items-center gap-2.5 md:gap-4">
          {onBack && (
            <button 
              onClick={onBack}
              className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer mr-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
          <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-white/40">
            <AvatarImage src={activeChat.profilePicture} alt={activeChat.name} />
            <AvatarFallback>
              <img src="/userFallback.png" alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
            </AvatarFallback>
            <AvatarBadge className="bg-[#40c057] w-3.5 h-3.5 border-2 border-[#1e1c31]" />
          </Avatar>
          <div>
            <h3 className="font-bold text-lg text-white leading-tight">{activeChat.name}</h3>
            {activeChat.vibes && activeChat.vibes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeChat.vibes.slice(0, 3).map((vibe, i) => (
                        <span key={i} className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full border border-white/10 font-medium">
                            {vibe}
                        </span>
                    ))}
                    {activeChat.vibes.length > 3 && (
                        <span className="text-[10px] text-white/50 px-1">+{activeChat.vibes.length - 3}</span>
                    )}
                </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer">
            <Video className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={`p-2.5 rounded-xl transition-all cursor-pointer ${isOptionsOpen ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#180f2a]/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                <div className="p-2">
                  <button 
                    onClick={() => { muteMutation.mutate(!isMuted); setIsOptionsOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/90 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <BellOff className={`w-4 h-4 ${isMuted ? "text-orange-400" : "text-white/60"}`} />
                      <span>Mute Notifications</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${isMuted ? "bg-orange-500" : "bg-white/20"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${isMuted ? "right-0.5" : "left-0.5"}`}></div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => { readReceiptsMutation.mutate(!readReceipts); setIsOptionsOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/90 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className={`w-4 h-4 ${readReceipts ? "text-blue-400" : "text-white/50"}`} />
                      <span>Read Receipts</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${readReceipts ? "bg-indigo-650" : "bg-white/20"}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-200 ${readReceipts ? "right-0.5" : "left-0.5"}`}></div>
                    </div>
                  </button>
                </div>

                <div className="p-2 border-t border-white/10">
                  <button 
                    onClick={() => { setIsOptionsOpen(false); setShowClearConfirm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/90 hover:bg-white/10 rounded-xl transition-all cursor-pointer border border-transparent"
                  >
                    <Trash2 className="w-4 h-4 text-white/60" />
                    <span>Clear Chat</span>
                  </button>
                  
                  <button 
                    onClick={() => { setIsOptionsOpen(false); if (isBlockedByMe) handleUnblockUser(); else setShowBlockConfirm(true); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all cursor-pointer border border-transparent ${
                      isBlockedByMe ? "text-green-400 hover:bg-white/10" : "text-red-400 hover:bg-white/10"
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isBlockedByMe ? "Unblock User" : "Block User"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showBlockConfirm}
        onClose={() => setShowBlockConfirm(false)}
        onConfirm={() => { blockUserMutation.mutate(); setShowBlockConfirm(false); }}
        title={`Block ${activeChat.name}?`}
        description="They won't be able to message you or find your profile. You can unblock them anytime in settings."
        confirmText="Block"
        type="danger"
        isPending={blockUserMutation.isPending}
      />

      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => { clearChatMutation.mutate(); setShowClearConfirm(false); }}
        title="Clear conversation?"
        description="This will remove all messages for you. This action cannot be undone."
        confirmText="Clear"
        type="warning"
        isPending={clearChatMutation.isPending}
      />

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-transparent"
      >
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
        ) : (
          <>
            {hasNextPage && (
              <div className="flex justify-center py-2">
                <button 
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {isFetchingNextPage ? "Loading older messages..." : "Load older messages"}
                </button>
              </div>
            )}
            {(() => {
              const now = Date.now();
              return messages.map((msg: Message) => {
                if (msg.isDeleted) return null;

                const isMine = msg.sender._id === currentUserId;
                const isEditing = editingMessageId === msg._id;
                const isDeleting = deletingMessageId === msg._id;

                // Check if under 30 minutes
                const messageDate = new Date(msg.createdAt).getTime();
                const canEdit = (now - messageDate) < 30 * 60 * 1000;

                return (
                <div 
                  key={msg._id} 
                  className={`flex ${isMine ? "justify-end" : "justify-start"} group/msg relative transition-all duration-300 ${
                    isDeleting ? "opacity-0 scale-95 -translate-y-4" : "opacity-100 scale-100"
                  }`}
                >
                  <div className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"} relative`}>
                    
                    {/* Message Content / Edit UI */}
                    <div className="flex items-center gap-2 group">
                      {isEditing ? (
                        <div className="flex flex-col bg-slate-950/90 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden">
                          <textarea
                            className="bg-transparent p-3 text-sm text-white focus:outline-none min-w-[200px] resize-none"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-1 p-1 bg-slate-900/50">
                            <button 
                              onClick={() => setEditingMessageId(null)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditMessage(msg._id)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <ContextMenu>
                          <ContextMenuTrigger className="select-text">
                            <div 
                              onTouchStart={handleTouchStart}
                              onTouchEnd={handleTouchEnd}
                              onTouchMove={handleTouchMove}
                              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed cursor-context-menu select-none md:select-text ${
                                isMine 
                                  ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-tr-none shadow-md border border-white/20" 
                                  : "bg-white backdrop-blur-md text-black rounded-tl-none shadow-md border border-white/15"
                              }`}
                            >
                              {msg.content}
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-36 bg-[#180f2a]/60 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <ContextMenuItem 
                              onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                toast.success("Copied to clipboard");
                              }}
                               className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white/20 hover:bg-white/10 transition-all cursor-pointer rounded-lg outline-none"
                            >
                              <Copy className="w-3.5 h-3.5 text-white/50" />
                              <span>Copy</span>
                            </ContextMenuItem>
                            
                            {isMine && canEdit && (
                              <ContextMenuItem 
                                onClick={() => {
                                  setEditingMessageId(msg._id);
                                  setEditingContent(msg.content);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all cursor-pointer rounded-lg outline-none"
                              >
                                <Pencil className="w-3.5 h-3.5 text-white/50" />
                                <span>Edit</span>
                              </ContextMenuItem>
                            )}

                            {isMine && (
                              <ContextMenuItem 
                                onClick={() => {
                                  handleDeleteMessage(msg._id);
                                }}
                                variant="destructive"
                                className="flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer rounded-lg outline-none border-t border-white/10 mt-1 pt-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </ContextMenuItem>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                      {msg.isEdited && (
                        <span className="text-[9px] text-white/30 italic opacity-70">edited</span>
                      )}
                      <span className="text-[10px] text-white">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && (
                          <span className="text-violet-300 font-semibold text-[10px] ml-0.5">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
                );
              });
            })()}
          </>
        )}
      </div>

      {/* Message Input or Blocked UI */}
      {(() => {
        if (isBlockedByMe) {
          return (
            <div className="p-8 bg-white/5 backdrop-blur-md border-t border-white/10 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 shrink-0">
               <div className="flex items-center gap-3 bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20 shadow-xs">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 text-sm font-semibold tracking-wide">You have blocked this user. Unblock to send messages.</span>
               </div>
               <button 
                onClick={handleUnblockUser}
                className="group px-10 py-3.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-2xl text-sm font-black transition-all shadow-md active:scale-95 flex items-center gap-2 hover:gap-3 cursor-pointer"
               >
                 <span>Unblock to Chat</span>
                 <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          );
        }

        if (isBlockedByOther) {
          return (
            <div className="p-8 bg-white/5 backdrop-blur-md border-t border-white/10 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 shrink-0">
               <div className="flex items-center gap-3 bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20 shadow-xs">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 text-sm font-semibold tracking-wide">You are blocked by this user. You cannot send messages.</span>
               </div>
               <p className="text-white/40 text-xs italic">Messaging is disabled for this conversation.</p>
            </div>
          );
        }

        return (
          <div className="p-5 bg-white/5 border-t border-white/10 shrink-0">
            <form 
              className="flex items-center gap-4 bg-white/10 border border-white/15 p-2.5 px-4.5 rounded-[22px] focus-within:border-white/25 focus-within:bg-white/15 transition-all"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            >
              <button type="button" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <Smile className="w-5 h-5" />
              </button>
              <button type="button" className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                rows={1}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent py-1.5 text-sm text-white focus:outline-none placeholder:text-white/40 resize-none max-h-32 min-h-[24px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button 
                type="submit" 
                disabled={!messageText.trim()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        );
      })()}
    </div>
  );
};

export default ChatScreen;