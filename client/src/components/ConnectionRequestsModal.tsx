import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserConnectionRequestApi, acceptConnectionRequestApi, rejectConnectionRequestApi } from "../api/api";
import { X, Check, UserX, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

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

    if (!isOpen) return null;

    return createPortal(
        <>
            {/* Backdrop */}
            <button
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200 cursor-default"
                onClick={onClose}
                aria-label="Close modal"
            ></button>

            {/* Modal */}
            <div 
                className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                            <Users className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Connection Requests</h2>
                            <p className="text-xs text-gray-500 font-medium">
                                {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(80vh-88px)] scrollbar-hide">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                                <Users className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">No pending requests</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                You don't have any connection requests at the moment. Check back later!
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            {requests.map((request: ConnectionRequest) => (
                                <div
                                    key={request._id}
                                    className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="relative">
                                            <img
                                                src={request.requester.profilePicture || "/default-avatar.png"}
                                                alt={request.requester.name}
                                                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 group-hover:border-green-500/30 transition-all"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">{request.requester.name}</h3>
                                            <p className="text-sm text-gray-500 truncate">@{request.requester.username}</p>
                                            <p className="text-xs text-gray-600 mt-1 font-medium">
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
                                            className="p-2.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
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
                                            className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
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
                                    className="w-full py-3 text-sm text-center text-gray-600 hover:text-green-500 transition-colors disabled:opacity-50"
                                >
                                    {isFetchingNextPage ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading more...
                                        </span>
                                    ) : (
                                        "Load more requests"
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
};

export default ConnectionRequestsModal;
