import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessagesApi, blockUserApi, clearChatApi, toggleMuteApi, toggleReadReceiptsApi, createChatApi, sendMessageApi } from "../api/api";
import { Send, MoreVertical, Phone, Video, Smile, Paperclip, Loader2, ShieldAlert, Trash2, Eye, BellOff } from "lucide-react";
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
}

interface ChatScreenProps {
  activeChat: {
    otherUserId?: string;
    name: string;
    username: string;
    profilePicture?: string;
    chatId?: string;
    type: "private" | "group";
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
  const [messageText, setMessageText] = useState("");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(false); 
  const [readReceipts, setReadReceipts] = useState(true); 
  const [chatId,setChatId] = useState<string | null>(activeChat?.chatId || null);

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

  const blockUserMutation = useMutation({
    mutationFn: () => blockUserApi(chatId!), // In private chat, chatId is currently same as userId
    onSuccess: (res) => {
      toast.success(res.message);
      setIsOptionsOpen(false);
      // Maybe navigate away or show blocked state
    }
  });

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

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [chatId, queryClient]);

    


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
            <h3 className="font-bold text-lg text-white">{activeChat.name}</h3>
            
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
                    onClick={() => { setIsOptionsOpen(false); setShowBlockConfirm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Block User</span>
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
            {messages.map((msg: Message) => {
              const isMine = msg.sender._id === currentUserId;
              return (
                <div 
                  key={msg._id} 
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMine 
                        ? "bg-linear-to-tr from-purple-600 to-fuchsia-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20" 
                        : "bg-white/10 text-gray-100 rounded-tl-none border border-white/5"
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input area */}
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
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-2 text-sm text-white focus:outline-none placeholder:text-gray-600"
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
    </div>
  );
};

export default ChatScreen;