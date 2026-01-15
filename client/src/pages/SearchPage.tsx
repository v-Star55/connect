import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchUsers } from "../api/api";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Loader2 } from "lucide-react";
import SearchedUserCard from "../components/SearchedUserCard";

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { 
        data, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useInfiniteQuery({
        queryKey: ["users", debouncedSearchQuery],
        queryFn: ({ pageParam }) => searchUsers(debouncedSearchQuery, pageParam as number),
        enabled: !!debouncedSearchQuery,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.next,
    });

    return (
        <div className="h-full bg-[#030303] text-white overflow-y-auto py-10 px-6 lg:px-10 scrollbar-hide">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight">
                        Find <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-blue-500">Connections</span>
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Discover friends, family, and colleagues to stay close.
                    </p>
                </div>

                {/* Search Input */}
                <div className="relative max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or username..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:bg-white/10 transition-all font-medium"
                        autoFocus
                    />
                </div>
                
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {(() => {
                        if (isLoading) {
                            return Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                                    <div className="w-12 h-12 rounded-full bg-white/10"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                                        <div className="h-3 w-1/3 bg-white/10 rounded"></div>
                                    </div>
                                </div>
                            ));
                        }

                        if (data?.pages?.[0]?.users?.length > 0) {
                            return data?.pages.map((page) => (
                                page.users.map((user: any) => (
                                    <SearchedUserCard key={user._id} user={user} />
                                ))
                            ));
                        }

                        if (debouncedSearchQuery) {
                            return (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    No users found matching "{debouncedSearchQuery}"
                                </div>
                            );
                        }

                        return null;
                    })()}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                    <div className="flex justify-center pt-8 pb-12">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                "Load More Results"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
