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
        <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-[#0c0c0e] flex flex-col font-outfit">
            <div className="flex-1 bg-white text-black rounded-[24px] overflow-hidden flex flex-col h-full border border-gray-100 shadow-2xl relative">
                
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] mix-blend-multiply" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] mix-blend-multiply" />
                </div>

                <div className="relative h-full overflow-y-auto py-10 px-6 lg:px-10 scrollbar-hide">
                    <div className="max-w-7xl mx-auto space-y-10">
                        
                        {/* Header */}
                        <div className="space-y-3 text-center animate-[fadeInUp_0.6s_ease-out]">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
                                Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-600 to-emerald-600">Connections</span>
                            </h1>
                            <p className="text-zinc-500 text-base max-w-xl mx-auto font-medium">
                                Discover friends, family, and colleagues to stay close. Expand your network with just a few clicks.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="sticky top-2 z-10 max-w-2xl mx-auto animate-[fadeInUp_0.8s_ease-out] w-full">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20 text-zinc-400 group-focus-within:text-zinc-700 transition-colors">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or username..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full relative z-10 bg-zinc-50 border border-zinc-200 rounded-2xl py-4.5 pl-14 pr-6 text-base text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300 focus:bg-zinc-50 focus:ring-2 focus:ring-zinc-100 transition-all shadow-sm hover:border-zinc-250"
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeInUp_1s_ease-out]">
                            {(() => {
                                if (isLoading) {
                                    return Array.from({ length: 8 }).map((_, i) => (
                                        <div key={i} className="bg-zinc-50 rounded-2xl p-5 flex items-center gap-4 animate-pulse border border-zinc-100">
                                            <div className="w-14 h-14 rounded-full bg-zinc-200"></div>
                                            <div className="space-y-3 flex-1">
                                                <div className="h-4 w-2/3 bg-zinc-200 rounded"></div>
                                                <div className="h-3 w-1/3 bg-zinc-200 rounded"></div>
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
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-400 space-y-4">
                                            <Search className="w-12 h-12 opacity-20" />
                                            <p className="text-lg font-medium">No users found matching "{debouncedSearchQuery}"</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-6">
                                        <div className="w-20 h-20 rounded-[28px] bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs">
                                            <Search className="w-9 h-9 text-zinc-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-zinc-800">Find your connections</h3>
                                            <p className="text-zinc-400 text-sm max-w-sm">
                                                Search by their name or username to start a conversation, make calls, or view their profile.
                                            </p>
                                        </div>
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
                                    className="group flex items-center gap-2 px-8 py-3.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-2xl text-zinc-700 font-medium transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Load More Results</span>
                                            <Search className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-zinc-500" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;
