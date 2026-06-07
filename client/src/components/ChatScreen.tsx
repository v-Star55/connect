import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { getMessagesApi, blockUserApi, unblockUserApi, clearChatApi, toggleMuteApi, toggleReadReceiptsApi, createChatApi, sendMessageApi, editMessageApi, deleteMessageApi } from "../api/api";
import { Send, MoreVertical, Phone, Video, Smile, Paperclip, Loader2, ShieldAlert, Trash2, Eye, BellOff, Copy, Pencil, Check, X, MoreHorizontal, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";

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
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  type: "danger" | "warning";
  isPending: boolean;
}

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  type,
  isPending
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${type === "danger" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"}`}>
          {type === "danger" ? <ShieldAlert className="w-7 h-7" /> : <Trash2 className="w-7 h-7" />}
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">{description}</p>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 px-4 py-3 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-50 ${
              type === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-orange-600 hover:bg-orange-500"
            }`}
          >
            {isPending ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


const ChatScreen = ({ activeChat, currentUserId }: ChatScreenProps) => {
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
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [openMessageOptionsId, setOpenMessageOptionsId] = useState<string | null>(null);
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
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
           <Smile className="w-10 h-10 text-purple-500" />
        </div>
        <h2 className="text-xl font-medium text-white">Select a conversation</h2>
        <p className="max-w-xs text-center">Choose a friend from the sidebar to start a new conversation and stay connected.</p>
      </div>
    );
  }

  const messages = [...(data?.pages.flatMap((page) => page.messages) || [])].reverse();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/20 backdrop-blur-md border-l border-white/5">
      {/* Header */}
      <div className="h-20 px-6 flex items-center justify-between border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={activeChat.profilePicture || "/default-avatar.png"}
              alt={activeChat.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white leading-tight">{activeChat.name}</h3>
            {activeChat.vibes && activeChat.vibes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                    {activeChat.vibes.slice(0, 3).map((vibe, i) => (
                        <span key={i} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 font-medium">
                            {vibe}
                        </span>
                    ))}
                    {activeChat.vibes.length > 3 && (
                        <span className="text-[10px] text-gray-500 px-1">+{activeChat.vibes.length - 3}</span>
                    )}
                </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <Video className="w-5 h-5" />
          </button>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOptionsOpen(!isOptionsOpen)}
              className={`p-2.5 rounded-xl transition-all ${isOptionsOpen ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/10"}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {isOptionsOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                <div className="p-2">
                  <button 
                    onClick={() => { muteMutation.mutate(!isMuted); setIsOptionsOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <BellOff className={`w-4 h-4 ${isMuted ? "text-orange-500" : "text-gray-500"}`} />
                      <span>Mute Notifications</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${isMuted ? "bg-orange-500/50" : "bg-white/10"}`}>
                      <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all duration-200 ${isMuted ? "right-1" : "left-1"}`}></div>
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => { readReceiptsMutation.mutate(!readReceipts); setIsOptionsOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className={`w-4 h-4 ${readReceipts ? "text-blue-500" : "text-gray-500"}`} />
                      <span>Read Receipts</span>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors duration-200 ${readReceipts ? "bg-purple-600/50" : "bg-white/10"}`}>
                      <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all duration-200 ${readReceipts ? "right-1" : "left-1"}`}></div>
                    </div>
                  </button>
                </div>

                <div className="p-2 border-t border-white/5">
                  <button 
                    onClick={() => { setIsOptionsOpen(false); setShowClearConfirm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                    <span>Clear Chat</span>
                  </button>
                  
                  <button 
                    onClick={() => { setIsOptionsOpen(false); if (isBlockedByMe) handleUnblockUser(); else setShowBlockConfirm(true); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
                      isBlockedByMe ? "text-green-400 hover:bg-green-500/10" : "text-red-400 hover:bg-red-500/10"
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
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        ) : (
          <>
            {hasNextPage && (
              <div className="flex justify-center py-2">
                <button 
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  {isFetchingNextPage ? "Loading older messages..." : "Load older messages"}
                </button>
              </div>
            )}
            {(() => {
              const now = Date.now();
              return messages.map((msg: Message, index: number) => {
                if (msg.isDeleted) return null;

                const isMine = msg.sender._id === currentUserId;
                const isEditing = editingMessageId === msg._id;
                const isMenuOpen = openMessageOptionsId === msg._id;
                const isHovered = hoveredMessageId === msg._id;
                const isDeleting = deletingMessageId === msg._id;

                // Check if under 30 minutes
                const messageDate = new Date(msg.createdAt).getTime();
                const canEdit = (now - messageDate) < 30 * 60 * 1000;
                
                const isFirstFewMessages = index < 3; // Oldest messages at the top

                return (
                <div 
                  key={msg._id} 
                  className={`flex ${isMine ? "justify-end" : "justify-start"} group/msg relative transition-all duration-300 ${
                    isDeleting ? "opacity-0 scale-95 -translate-y-4" : "opacity-100 scale-100"
                  }`}
                  onMouseEnter={() => setHoveredMessageId(msg._id)}
                  onMouseLeave={() => {
                    setHoveredMessageId(null);
                    if (!isMenuOpen) setOpenMessageOptionsId(null);
                  }}
                >
                  <div className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"} relative`}>
                    
                    {/* Message Content / Edit UI */}
                    <div className="flex items-center gap-2 group">
                      {isMine && !isEditing && (isHovered || isMenuOpen) && (
                        <div className="relative">
                          <button 
                            onClick={() => setOpenMessageOptionsId(isMenuOpen ? null : msg._id)}
                            className="p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className={`absolute right-0 ${isFirstFewMessages ? 'top-full mt-2' : 'bottom-full mb-2'} w-32 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200`}>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  toast.success("Copied to clipboard");
                                  setOpenMessageOptionsId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </button>
                              
                              {canEdit && (
                                <button 
                                  onClick={() => {
                                    setEditingMessageId(msg._id);
                                    setEditingContent(msg.content);
                                    setOpenMessageOptionsId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                              )}

                              <button 
                                onClick={() => {
                                  handleDeleteMessage(msg._id);
                                  setOpenMessageOptionsId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-white/5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {isEditing ? (
                        <div className="flex flex-col bg-white/10 rounded-2xl border border-purple-500/30 overflow-hidden">
                          <textarea
                            className="bg-transparent p-3 text-sm text-white focus:outline-none min-w-[200px] resize-none"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-1 p-1 bg-black/20">
                            <button 
                              onClick={() => setEditingMessageId(null)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditMessage(msg._id)}
                              className="p-1.5 rounded-lg hover:bg-purple-600/20 text-purple-400 transition-all"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          isMine 
                            ? "bg-linear-to-tr from-purple-600 to-fuchsia-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20" 
                            : "bg-white/10 text-gray-100 rounded-tl-none border border-white/5"
                        }`}>
                          {msg.content}
                        </div>
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMine ? "justify-end" : "justify-start"}`}>
                      {msg.isEdited && (
                        <span className="text-[9px] text-gray-500 italic opacity-70">edited</span>
                      )}
                      <span className="text-[10px] text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
            <div className="p-8 bg-black/60 backdrop-blur-md border-t border-white/10 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-3 bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20 shadow-2xl">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span className="text-gray-200 text-sm font-semibold tracking-wide">You have blocked this user. Unblock to send messages.</span>
               </div>
               <button 
                onClick={handleUnblockUser}
                className="group px-10 py-3.5 bg-linear-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-purple-900/30 active:scale-95 flex items-center gap-2 hover:gap-3"
               >
                 <span>Unblock to Chat</span>
                 <ChevronRight className="w-4 h-4" />
               </button>
            </div>
          );
        }

        if (isBlockedByOther) {
          return (
            <div className="p-8 bg-black/60 backdrop-blur-md border-t border-white/10 flex flex-col items-center gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center gap-3 bg-red-500/10 px-6 py-3 rounded-full border border-red-500/20 shadow-2xl">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  <span className="text-gray-200 text-sm font-semibold tracking-wide">You are blocked by this user. You cannot send messages.</span>
               </div>
               <p className="text-gray-500 text-xs italic">Messaging is disabled for this conversation.</p>
            </div>
          );
        }

        return (
          <div className="p-6 bg-white/5 border-t border-white/5">
            <form 
              className="flex items-center gap-4 bg-white/5 p-2 px-4 rounded-2xl border border-white/10 focus-within:border-purple-500/50 transition-all"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            >
              <button type="button" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button type="button" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
            rows={3}
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Type your message..."
                className="flex-1 bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-gray-600 resize-none max-h-32"
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
            className="px-6 py-8 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
            <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        );
      })()}
    </div>
  );
};

export default ChatScreen;