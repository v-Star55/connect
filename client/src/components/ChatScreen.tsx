import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { getMessagesApi, blockUserApi, unblockUserApi, removeConnectionApi, clearChatApi, toggleReadReceiptsApi, createChatApi, sendMessageApi, editMessageApi, deleteMessageApi, uploadFileApi, markChatAsReadApi, getChatStatsApi } from "../api/api";
import { Send, MoreVertical, Smile, Paperclip, Loader2, ShieldAlert, Trash2, Eye, Copy, Pencil, Check, X, ChevronRight, Download, ArrowDown, Gamepad2, Phone, Video, Calendar, MapPin, MessageCircle, Moon, Star, Image as ImageIcon, ListTodo, UserMinus } from "lucide-react";
import { toast } from "react-hot-toast";
import SparksPanel from "./SparksPanel";
import BucketListPanel from "./BucketListPanel";
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
  media?: string;
  mediaType?: "image" | "video" | "audio" | "document" | null;
  isRead?: boolean;
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
    isOnline?: boolean;
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
  const [showRemoveConnectionConfirm, setShowRemoveConnectionConfirm] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [isSparksOpen, setIsSparksOpen] = useState(false);
  const [isSparksClosing, setIsSparksClosing] = useState(false);
  const [hasSparksActivity, setHasSparksActivity] = useState(false);
  const [isBucketListOpen, setIsBucketListOpen] = useState(false);
  const [isBucketListClosing, setIsBucketListClosing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(activeChat?.chatId || null);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isContactInfoClosing, setIsContactInfoClosing] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);

  const { data: connectionStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["chat-stats", chatId],
    queryFn: () => getChatStatsApi(chatId!),
    enabled: !!chatId && isContactInfoOpen,
  });

  useEffect(() => {
    if (isContactInfoOpen) {
      const frame = requestAnimationFrame(() => setAnimateOpen(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setAnimateOpen(false);
    }
  }, [isContactInfoOpen]);

  const handleCloseContactInfo = () => {
    setAnimateOpen(false);
    setIsContactInfoClosing(true);
    setTimeout(() => {
      setIsContactInfoOpen(false);
      setIsContactInfoClosing(false);
    }, 280);
  };

  useEffect(() => {
    setIsContactInfoOpen(false);
    setIsSparksOpen(false);
    setIsBucketListOpen(false);
  }, [activeChat?.otherUserId]);

  const handleCloseSparks = () => {
    setIsSparksClosing(true);
    setTimeout(() => {
      setIsSparksOpen(false);
      setIsSparksClosing(false);
    }, 280);
  };

  const handleCloseBucketList = () => {
    setIsBucketListClosing(true);
    setTimeout(() => {
      setIsBucketListOpen(false);
      setIsBucketListClosing(false);
    }, 280);
  };

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [isBlockedByMe, setIsBlockedByMe] = useState(activeChat?.isBlockedByMe || false);
  const [showScrollDownButton, setShowScrollDownButton] = useState(false);
  const [isBlockedByOther, setIsBlockedByOther] = useState(activeChat?.isBlockedByOther || false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [attachment, setAttachment] = useState<{ url: string; type: "image" | "video" | "audio" | "document"; name: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


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
      creationStartedRef.current = null;
    }
  });

  const removeConnectionMutation = useMutation({
    mutationFn: () => {
      if (!activeChat?.otherUserId) throw new Error("Other user ID is required");
      return removeConnectionApi(activeChat.otherUserId);
    },
    onSuccess: (res) => {
      toast.success(res.message);
      setShowRemoveConnectionConfirm(false);
      setIsOptionsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-chats"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      // Navigate back to chat list immediately
      if (onBack) onBack();
    },
    onError: () => {
      toast.error("Failed to remove connection");
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
  }, [chatId, activeChat?.otherUserId, activeChat?.type]);


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

      queryClient.invalidateQueries({ queryKey: ["my-chats"] });

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

    const handleSparksNotify = (data: any) => {
      if (data.senderId === currentUserId) return;
      if (data.action === "START") {
        if (!isSparksOpen) {
          setHasSparksActivity(true);
          toast(`Friend started a game of ${data.gameType}! Click the gamepad icon to play.`, {
            icon: "🎮",
            duration: 5000,
          });
        }
      }
    };

    const handleConnectionRemoved = (data: any) => {
      if (String(data.chatId) !== String(chatId)) return;
      // The other user removed the connection — navigate away and refresh
      queryClient.invalidateQueries({ queryKey: ["my-chats"] });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      toast("Connection removed.", { icon: "👋" });
      if (onBack) onBack();
    };

    socket.on("sparksStateUpdate", handleSparksNotify);
    socket.on("connectionRemoved", handleConnectionRemoved);
    console.log("Attempting to join socket room:", chatId);
    socket.emit("joinChat", chatId);

    return () => {
      socket.off("sparksStateUpdate", handleSparksNotify);
      socket.off("connectionRemoved", handleConnectionRemoved);
      console.log("Leaving socket room:", chatId);
      socket.emit("leaveChat", chatId);
    };
  }, [chatId, currentUserId, isSparksOpen, onBack, queryClient]);

  useEffect(() => {
    if (isSparksOpen) {
      setHasSparksActivity(false);
    }
  }, [isSparksOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File size exceeds the 50MB limit");
      return;
    }

    let type: "image" | "video" | "audio" | "document" = "document";
    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("video/")) {
      type = "video";
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setIsUploading(true);
      try {
        const res = await uploadFileApi(base64Data);
        setAttachment({
          url: res.fileUrl,
          type,
          name: file.name,
        });
      } catch (err: any) {
        console.error(err);
        toast.error("Failed to upload attachment");
      } finally {
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download attachment", error);
      window.open(url, "_blank");
    }
  };

  const handleSendMessage = async () => {
    console.log("Attempting to send message. chatId:", chatId, "messageText:", messageText, "attachment:", attachment);
    if ((!messageText.trim() && !attachment) || !chatId) return;

    try {
      const res = await sendMessageApi(
        chatId,
        messageText,
        attachment?.url || "",
        attachment?.type || null
      );
      const savedMessage = res.message;

      queryClient.setQueryData(["messages", chatId], (oldData: any) => {
        if (!oldData) return oldData;
        const newPages = [...oldData.pages];
        if (newPages.length > 0) {
          const exists = newPages.some(page => page.messages.some((m: any) => m._id === savedMessage._id));
          if (exists) return oldData;

          newPages[0] = {
            ...newPages[0],
            messages: [savedMessage, ...newPages[0].messages],
          };
        }
        return { ...oldData, pages: newPages };
      });

      queryClient.invalidateQueries({ queryKey: ["my-chats"] });

      socket.emit("sendMessage", {
        chatId: chatId,
        message: savedMessage,
      });

      setMessageText("");
      setAttachment(null);
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
        queryClient.invalidateQueries({ queryKey: ["my-chats"] });
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

    const handleChatRead = (data: any) => {
      console.log("Socket chatRead received:", data);
      if (String(data.chatId) === String(chatId)) {
        if (String(data.userId) !== String(currentUserId)) {
          queryClient.setQueryData(["messages", chatId], (oldData: { pages: any[] } | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                messages: page.messages.map((m: any) => {
                  const isRead = new Date(m.createdAt) <= new Date(data.lastReadMessageTime);
                  return isRead ? { ...m, isRead: true } : m;
                })
              }))
            };
          });
        }
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("userBlocked", handleUserBlocked);
    socket.on("userUnblocked", handleUserUnblocked);
    socket.on("chatRead", handleChatRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("userBlocked", handleUserBlocked);
      socket.off("userUnblocked", handleUserUnblocked);
      socket.off("chatRead", handleChatRead);
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

  const messagesList = data?.pages.flatMap(page => page.messages) || [];
  const latestMessageId = messagesList[0]?._id;

  useEffect(() => {
    if (!chatId || !latestMessageId) return;

    const latestMessage = messagesList[0];
    const senderId = latestMessage?.sender?._id || latestMessage?.sender;

    if (latestMessage && senderId !== currentUserId) {
      console.log(`[Declarative markAsRead] Triggered by latestMessageId: ${latestMessageId} from sender: ${senderId}`);
      const markAsRead = async () => {
        try {
          await markChatAsReadApi(chatId);
          queryClient.invalidateQueries({ queryKey: ["my-chats"] });
        } catch (err) {
          console.error("Failed to mark chat as read declaratively:", err);
        }
      };
      markAsRead();
    }
  }, [chatId, latestMessageId, currentUserId, queryClient]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
      setShowScrollDownButton(false);
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;
    setShowScrollDownButton(isScrolledUp);
  };

  useEffect(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 300;

      const latestMessage = messagesList[0];
      const isLastMessageMine = latestMessage?.sender?._id === currentUserId || latestMessage?.sender === currentUserId;

      if (!isScrolledUp || isLastMessageMine) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [data, currentUserId, messagesList]);



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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent text-white relative">
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
          <div
            onClick={() => {
              if (isContactInfoOpen) {
                handleCloseContactInfo();
              } else {
                setIsContactInfoOpen(true);
                if (isSparksOpen) handleCloseSparks();
              }
            }}
            className="flex items-center gap-2.5 md:gap-4 cursor-pointer hover:opacity-85 active:scale-[0.99] transition-all"
          >
            <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-white/40">
              <AvatarImage src={activeChat.profilePicture} alt={activeChat.name} />
              <AvatarFallback>
                <img src="/userFallback.png" alt={activeChat.name} className="w-full h-full rounded-full object-cover" />
              </AvatarFallback>
              {activeChat.isOnline && (
                <AvatarBadge className="bg-[#40c057] w-3.5 h-3.5 border-2 border-[#1e1c31]" />
              )}
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
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (isBucketListOpen) {
                handleCloseBucketList();
              } else {
                setIsBucketListOpen(true);
                setIsSparksOpen(false);
                setIsContactInfoOpen(false);
              }
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer relative group ${
              isBucketListOpen 
                ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-500/25" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title="Shared Bucket List"
          >
            <ListTodo className="w-5 h-5" />
          </button>

          <button 
            onClick={() => {
              if (isSparksOpen) {
                handleCloseSparks();
              } else {
                setIsSparksOpen(true);
                setIsBucketListOpen(false);
                setIsContactInfoOpen(false);
              }
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer relative group ${
              isSparksOpen 
                ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/25" 
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
            title="Connection Sparks"
          >
            <Gamepad2 className="w-5 h-5" />
            {hasSparksActivity && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
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
                    onClick={() => { setIsOptionsOpen(false); if (isBlockedByMe) handleUnblockUser(); else setShowBlockConfirm(true); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all cursor-pointer border border-transparent ${isBlockedByMe ? "text-green-400 hover:bg-white/10" : "text-red-400 hover:bg-white/10"
                      }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isBlockedByMe ? "Unblock User" : "Block User"}</span>
                  </button>
                  <button
                    onClick={() => { setIsOptionsOpen(false); setShowRemoveConnectionConfirm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all cursor-pointer border border-transparent text-orange-400 hover:bg-white/10"
                  >
                    <UserMinus className="w-4 h-4" />
                    <span>Remove Connection</span>
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

      <ConfirmationModal
        isOpen={showRemoveConnectionConfirm}
        onClose={() => setShowRemoveConnectionConfirm(false)}
        onConfirm={() => removeConnectionMutation.mutate()}
        title={`Remove ${activeChat.name}?`}
        description={`You and ${activeChat.name} will no longer be connected. You can send a new connection request later if you change your mind.`}
        confirmText="Remove"
        type="danger"
        isPending={removeConnectionMutation.isPending}
      />

      {/* Main Workspace Area: Holds Chat pane and Sparks pane */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Chat Pane */}
        <div className="flex-1 flex flex-col h-full min-w-0 order-2 md:order-1 relative bg-transparent">
          {/* Connection Stats Drop-down Overlay */}
          {(isContactInfoOpen || isContactInfoClosing) && (
            <div className={`absolute inset-0 z-40 bg-[#0c0717]/97 backdrop-blur-xl border-t border-white/10 transition-all duration-300 ease-out flex flex-col ${
              animateOpen && !isContactInfoClosing
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Connection Stats</h3>
                </div>
                <button 
                  onClick={handleCloseContactInfo}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white cursor-pointer transition-all active:scale-95"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {isStatsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    <span className="text-xs text-white/50 font-bold">Unlocking connection insights...</span>
                  </div>
                ) : !connectionStats ? (
                  <div className="text-center py-10 text-white/50 text-xs font-semibold">Failed to load connection statistics.</div>
                ) : (() => {
                  const partner = connectionStats.partner;
                  const stats = connectionStats.stats;
                  
                  return (
                    <div className="max-w-2xl mx-auto space-y-6">
                      {/* Partner Profile card */}
                      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/15 transition-colors"></div>
                        <Avatar className="w-20 h-20 md:w-24 md:h-24 border-2 border-violet-500/30 shadow-2xl relative z-10 flex-shrink-0">
                          <AvatarImage src={partner?.profilePicture || activeChat?.profilePicture} />
                          <AvatarFallback>
                            <img src="/userFallback.png" className="w-full h-full rounded-full object-cover" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2 relative z-10 flex-1 min-w-0">
                          <div className="space-y-0.5">
                            <h4 className="text-xl font-black text-white leading-snug">{partner?.name || activeChat?.name}</h4>
                            <p className="text-xs text-white/40 font-bold">@{partner?.username || activeChat?.username}</p>
                          </div>
                          <p className="text-xs text-white/70 font-medium leading-relaxed max-w-lg">{partner?.bio || "No status bio set."}</p>
                          
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[10px] text-white/50 font-extrabold uppercase pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {stats.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Joined {partner?.createdAt ? new Date(partner.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Connection Tracker Badge */}
                      <div className="bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/30 rounded-3xl p-6 text-center space-y-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent)]"></div>
                        <span className="text-[10px] font-extrabold text-violet-300 uppercase tracking-widest relative z-10">Friendship Milestones</span>
                        <h5 className="text-xl font-black text-white relative z-10">Connected for {stats.friendsSince}</h5>
                        <p className="text-[11px] text-white/60 font-semibold relative z-10 flex items-center justify-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-violet-400" /> First message spark: {stats.firstMessageDate ? new Date(stats.firstMessageDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}
                        </p>
                      </div>

                      {/* Quick statistics metrics grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
                          <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5 text-white/45" /> Total Messages
                          </span>
                          <div className="text-3xl font-black text-white">{stats.totalMessages.toLocaleString()}</div>
                          <p className="text-[10px] text-white/55 font-medium leading-snug">Total messages exchanged in this conversation</p>
                        </div>
                        
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 flex flex-col justify-between">
                          <span className="text-[9px] font-extrabold text-violet-300 uppercase tracking-wider flex items-center gap-1">
                            <Moon className="w-3.5 h-3.5 text-violet-400" /> Late-Night Chats
                          </span>
                          <div className="text-3xl font-black text-violet-400">{stats.lateNightCount.toLocaleString()}</div>
                          <p className="text-[10px] text-white/55 font-medium leading-snug">Messages sent between 12 AM and 5 AM</p>
                        </div>
                      </div>

                      {/* Highlights & Custom prompts cards list */}
                      {partner?.aboutMe && partner.aboutMe.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest">Q&A Highlights</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {partner.aboutMe.map((item: any, idx: number) => {
                              if (!item.value) return null;
                              return (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                                  <span className="text-2xl">✨</span>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider">{item.label}</span>
                                    <span className="text-xs font-bold text-white/90 truncate">{item.value}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Shared Photos grid gallery */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-white/45" /> Shared Photos
                          </h4>
                          <span className="text-xs bg-white/10 border border-white/10 text-white/80 px-2.5 py-0.5 rounded-full font-bold">
                            {stats.photosCount} Photo{stats.photosCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {stats.photoPreviews && stats.photoPreviews.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {stats.photoPreviews.map((url: string, i: number) => (
                              <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-2xl overflow-hidden group relative shadow-md">
                                <img src={url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed border-white/15 rounded-2xl text-white/40 text-xs font-medium">
                            No photos shared in this chat yet.
                          </div>
                        )}
                      </div>

                      {/* Back/Close drawer footer button */}
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={handleCloseContactInfo}
                          className="py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold text-xs tracking-wider border border-white/10 hover:border-white/15 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                        >
                          <ChevronRight className="w-4 h-4 -rotate-90" />
                          <span>Close Stats</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Messages area */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
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
                    className={`flex ${isMine ? "justify-end" : "justify-start"} group/msg relative transition-all duration-300 ${isDeleting ? "opacity-0 scale-95 -translate-y-4" : "opacity-100 scale-100"
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
                                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed cursor-context-menu select-none md:select-text ${isMine
                                    ? "bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-tr-none shadow-md border border-white/20"
                                    : "bg-white backdrop-blur-md text-black rounded-tl-none shadow-md border border-white/15"
                                  }`}
                              >
                                {msg.media && (
                                  <div className="mb-2 max-w-[280px] sm:max-w-xs md:max-w-md rounded-xl overflow-hidden border border-white/10 shadow-md relative group/media">
                                    {msg.mediaType === "image" && (
                                      <img src={msg.media} alt="Attachment" className="w-full object-cover max-h-60" />
                                    )}
                                    {msg.mediaType === "video" && (
                                      <video src={msg.media} controls className="w-full max-h-60" />
                                    )}
                                    {msg.mediaType === "audio" && (
                                      <audio src={msg.media} controls className="w-full" />
                                    )}
                                    {msg.mediaType === "document" && (
                                      <a
                                        href={msg.media}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-black/20 hover:bg-black/35 text-white transition-all text-xs font-semibold"
                                      >
                                        <span>📄 Download File</span>
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => handleDownload(msg.media!, `attachment-${msg._id}`)}
                                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all opacity-0 group-hover/media:opacity-100 shadow-md cursor-pointer flex items-center justify-center z-10"
                                      title="Download attachment"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                                {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-36 bg-[#180f2a]/60 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                              <ContextMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content || msg.media || "");
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
                          <span className={`${msg.isRead ? "text-sky-400" : "text-violet-300"} font-semibold text-[10px] ml-0.5`}>✓✓</span>
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

      {/* Down arrow to scroll to latest messages */}
      {showScrollDownButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 p-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full shadow-lg border border-white/20 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center animate-bounce"
          style={{ animationDuration: "2s" }}
          title="Scroll to latest"
        >
          <ArrowDown className="w-5 h-5 text-white" />
        </button>
      )}

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
            {isUploading && (
              <div className="mb-4 p-3 bg-white/10 rounded-2xl border border-white/15 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Loader2 className="w-5 h-5 animate-spin text-violet-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-white/70">Uploading attachment...</span>
              </div>
            )}
            {attachment && (
              <div className="mb-4 p-3 bg-white/10 rounded-2xl border border-white/15 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3 min-w-0">
                  {attachment.type === "image" && (
                    <img src={attachment.url} alt="Upload preview" className="w-12 h-12 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                  )}
                  {attachment.type === "video" && (
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}
                  {attachment.type === "audio" && (
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                  )}
                  {attachment.type === "document" && (
                    <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                      <Paperclip className="w-5 h-5 text-amber-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-white/50 font-semibold">Attachment uploaded</p>
                    <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">{attachment.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <form
              className="flex items-center gap-4 bg-white/10 border border-white/15 p-2.5 px-4.5 rounded-[22px] focus-within:border-white/25 focus-within:bg-white/15 transition-all"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="relative flex items-center" ref={emojiPickerRef}>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-12 left-0 z-50 shadow-2xl rounded-2xl border border-white/10 overflow-hidden backdrop-blur-3xl">
                    <EmojiPicker
                      theme={Theme.DARK}
                      onEmojiClick={(emojiData) => {
                        setMessageText((prev) => prev + emojiData.emoji);
                      }}
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-white/60 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-violet-400" /> : <Paperclip className="w-5 h-5" />}
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
                disabled={(!messageText.trim() && !attachment) || isUploading}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>
        );
      })()}
        </div>

        {/* Sparks Pane */}
        {(isSparksOpen || isSparksClosing) && (
          <div className={`absolute md:relative inset-0 md:inset-auto md:w-[450px] md:h-full bg-[#0d0619]/95 backdrop-blur-lg md:border-l border-white/15 order-1 md:order-2 shrink-0 z-50 flex flex-col ${
            isSparksClosing
              ? "animate-out slide-out-to-right duration-300 fill-mode-forwards"
              : "animate-in slide-in-from-right duration-300"
          }`}>
            <SparksPanel 
              chatId={chatId}
              currentUserId={currentUserId}
              otherUserId={activeChat?.otherUserId || null}
              otherUserName={activeChat?.name || "Friend"}
              onClose={handleCloseSparks}
            />
          </div>
        )}

        {/* Bucket List Pane */}
        {(isBucketListOpen || isBucketListClosing) && (
          <div className={`absolute md:relative inset-0 md:inset-auto md:w-[450px] md:h-full bg-[#070311]/95 backdrop-blur-lg md:border-l border-white/15 order-1 md:order-2 shrink-0 z-50 flex flex-col ${
            isBucketListClosing
              ? "animate-out slide-out-to-right duration-300 fill-mode-forwards"
              : "animate-in slide-in-from-right duration-300"
          }`}>
            <BucketListPanel
              chatId={chatId}
              currentUserId={currentUserId}
              otherUserName={activeChat?.name || "Friend"}
              onClose={handleCloseBucketList}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatScreen;