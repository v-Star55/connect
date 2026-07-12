import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserConnectionRequestApi, acceptConnectionRequestApi, rejectConnectionRequestApi } from "../api/api";
import { X, Check, UserX, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import {
    Sheet,
    SheetContent,
} from "./ui/sheet";

interface ConnectionRequest {
    _id: string;
    requester: {
        _id: string;
        name: string;
        username: string;
        profilePicture?: string;
    };
    status: string;
    createdAt: string;
}

interface ConnectionRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ConnectionRequestsModal = ({ isOpen, onClose }: ConnectionRequestsModalProps) => {
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["connection-requests"],
        queryFn: ({ pageParam }) => getUserConnectionRequestApi(pageParam),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.next,
        enabled: isOpen,
    });

    const acceptMutation = useMutation({
        mutationFn: (requestId: string) => acceptConnectionRequestApi(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
            queryClient.invalidateQueries({ queryKey: ["connections"] });
            toast.success("Connection request accepted!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Failed to accept request");
        },
    });

    const rejectMutation = useMutation({
        mutationFn: (requestId: string) => rejectConnectionRequestApi(requestId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["connection-requests"] });
            toast.success("Connection request rejected");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Failed to reject request");
        },
    });

    const requests = data?.pages.flatMap((page) => page.requests) || [];

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
                </div>
            );
        }

        if (requests.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 flex items-center justify-center mb-6 border border-white/10 text-indigo-300 shadow-md shadow-indigo-500/5">
                        <Users className="w-10 h-10 text-white/35" />
                    </div>
                    <h3 className="text-xl font-extrabold text-white mb-2">No pending requests</h3>
                    <p className="text-sm text-white/50 max-w-xs font-outfit leading-relaxed">
                        You don't have any connection requests at the moment. Check back later!
                    </p>
                </div>
            );
        }

        return (
            <div className="p-4 space-y-3">
                {requests.map((request: ConnectionRequest) => (
                    <div
                        key={request._id}
                        className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[24px] transition-all duration-300 shadow-xs hover:shadow-md hover:border-white/15"
                    >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="relative">
                                <img
                                    src={request.requester.profilePicture || "/userFallback.png"}
                                    alt={request.requester.name}
                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-violet-500/30 transition-all"
                                />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#40c057] border border-white/40 rounded-full animate-pulse shadow-xs"></div>
                            </div>
                            <div className="flex-1 min-w-0 font-outfit">
                                <h3 className="font-extrabold text-white truncate text-[14px]">{request.requester.name}</h3>
                                <p className="text-xs text-white/50 truncate">@{request.requester.username}</p>
                                <p className="text-[10px] text-white/30 mt-1 font-semibold">
                                    {new Date(request.createdAt).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            <button
                                onClick={() => acceptMutation.mutate(request._id)}
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                                className="p-2.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer shadow-sm shadow-indigo-500/20"
                                title="Accept"
                            >
                                {acceptMutation.isPending && acceptMutation.variables === request._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Check className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                onClick={() => rejectMutation.mutate(request._id)}
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                                className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-red-400 rounded-xl border border-white/10 hover:border-red-500/30 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed group/btn cursor-pointer shadow-xs"
                                title="Reject"
                            >
                                {rejectMutation.isPending && rejectMutation.variables === request._id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <UserX className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Load More Button */}
                {hasNextPage && (
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="w-full py-3.5 text-xs font-bold text-center text-white/50 hover:text-white hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                        {isFetchingNextPage ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                                Loading more...
                            </span>
                        ) : (
                            "Load more requests"
                        )}
                    </button>
                )}
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent 
                side="right" 
                className="bg-violet-500/5 backdrop-blur-2xl !inset-y-4 !right-4 !h-auto !border border-white/15 text-white w-full sm:max-w-md p-0 flex flex-col shadow-2xl rounded-[32px] overflow-hidden" 
                showCloseButton={false}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 shrink-0 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-white/10 rounded-xl">
                            <Users className="w-5 h-5 text-indigo-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Connection Requests</h2>
                            <p className="text-xs text-white/50 font-medium font-outfit">
                                {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {renderContent()}
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default ConnectionRequestsModal;
