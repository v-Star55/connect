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
        <div className="relative h-full bg-[#030303] text-white overflow-hidden">
            
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <div className="relative h-full overflow-y-auto py-10 px-6 lg:px-10 scrollbar-hide">
                <div className="max-w-7xl mx-auto space-y-10">
                    
                    {/* Header */}
                    <div className="space-y-4 text-center animate-[fadeInUp_0.6s_ease-out]">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Find <span className="text-transparent bg-clip-text bg-linear-to-r from-green-400 to-blue-500">Connections</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Discover friends, family, and colleagues to stay close. Expand your network with just a few clicks.
                        </p>
                    </div>

                    {/* Search Input */}
                    <div className="sticky top-2 z-10 max-w-2xl mx-auto animate-[fadeInUp_0.8s_ease-out]">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20 text-gray-500 group-focus-within:text-green-500 transition-colors">
                                <Search className="h-6 w-6" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full relative z-10 bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 focus:ring-2 focus:ring-green-500/20 focus:bg-[#1a1a1a] transition-all shadow-lg hover:border-white/20"
                                autoFocus
                            />
                            {/* Glow effect */}
                            <div className="absolute -inset-0.5 bg-linear-to-r from-green-500 to-blue-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500 pointer-events-none z-0"></div>
                        </div>
                    </div>
                    
                    {/* Results Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeInUp_1s_ease-out]">
                        {(() => {
                            if (isLoading) {
                                return Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-6 flex items-center gap-4 animate-pulse border border-white/5">
                                        <div className="w-14 h-14 rounded-full bg-white/10"></div>
                                        <div className="space-y-3 flex-1">
                                            <div className="h-4 w-2/3 bg-white/10 rounded"></div>
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
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 space-y-4">
                                        <Search className="w-12 h-12 opacity-20" />
                                        <p className="text-xl">No users found matching "{debouncedSearchQuery}"</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                        <Search className="w-8 h-8 text-white/20" />
                                    </div>
                                    <p className="text-gray-500">Start typing to search for people...</p>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Load More Button */}
                    {hasNextPage && (
                        <div className="flex justify-center pt-8 pb-12">
                            <button
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                                className="group flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Load More Results</span>
                                        <Search className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
