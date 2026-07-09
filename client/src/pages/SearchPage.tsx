import { useState, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchUsers } from "../api/api";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Loader2, Sparkles, ChevronDown, SlidersHorizontal, X, Check } from "lucide-react";
import SearchedUserCard from "../components/SearchedUserCard";

const VIBES = [
  "😎 Chill", "🌿 Peaceful", "🌙 Low-Key", "🧘 Zen", "☕ Cozy", "🔥 Hype",
  "⚡ Electric", "🎉 Party Mode", "😜 Goofy", "💃 Vibing", "🚀 Hustle",
  "📚 Studying", "💼 Working", "🧠 Deep Focus", "⏳ Busy", "🛸 Alien Mode",
  "🐙 Squishy", "🍕 Pizza Brain", "🐢 Turtle Pace", "💬 Chatty", "🗣 Let’s Talk",
  "🎤 In My Talk Era", "🤝 Social", "🧡 Open", "😴 AFK", "👻 Ghost Mode",
  "🔕 Do Not Disturb", "📴 Offline Brain", "🛌 Sleeping", "💔 Moody",
  "🥹 Soft", "🌧 In My Feelings", "💭 Thinking", "❤️ Loving", "🌀 Chaos",
  "🤡 Clown Energy", "🐒 Monkey Mode", "🧃 Main Character", "🪩 Slay Mode",
  "🐸 Froggy", "🍓 Sweet", "🫧 Floating"
];

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVibe, setSelectedVibe] = useState("All");
    const [sortBy, setSortBy] = useState("suggested");
    
    // Custom Dropdown States
    const [isVibeDropdownOpen, setIsVibeDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [vibeSearchQuery, setVibeSearchQuery] = useState("");

    const [showTip, setShowTip] = useState(true);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { 
        data, 
        isLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useInfiniteQuery({
        queryKey: ["users", debouncedSearchQuery, selectedVibe, sortBy],
        queryFn: ({ pageParam }) => searchUsers(debouncedSearchQuery, pageParam as number, selectedVibe, sortBy),
        enabled: !!debouncedSearchQuery || selectedVibe !== "All",
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.next,
    });

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest(".vibe-dropdown-container")) {
                setIsVibeDropdownOpen(false);
            }
            if (!target.closest(".sort-dropdown-container")) {
                setIsSortDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Reset vibe search query when dropdown closes
    useEffect(() => {
        if (!isVibeDropdownOpen) {
            setVibeSearchQuery("");
        }
    }, [isVibeDropdownOpen]);

    const filteredVibes = VIBES.filter((vibe) =>
        vibe.toLowerCase().includes(vibeSearchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 h-full p-4 pl-2 overflow-hidden bg-transparent flex flex-col font-outfit z-10">
            <div className="flex-1 backdrop-blur-2xl text-white rounded-[32px] overflow-hidden flex flex-col h-full border border-white/15 shadow-2xl relative p-6 lg:p-8 gap-6 bg-violet-500/10">
                
                {/* Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px] mix-blend-normal" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-normal" />
                </div>

                {/* Header Row */}
                <div className="relative z-10 flex items-center justify-between gap-6 shrink-0">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                                Find Connections
                            </h1>
                        </div>
                        <p className="text-white/60 text-xs md:text-sm max-w-xl font-medium font-outfit leading-relaxed">
                            Discover friends, family, and colleagues to stay close. Expand your network with just a few clicks.
                        </p>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="relative z-30 flex flex-col sm:flex-row items-center gap-3 w-full bg-white/5 border border-white/10 p-3 rounded-2xl shrink-0">
                    {/* Search Input */}
                    <div className="relative group flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-white transition-colors">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                            autoFocus
                        />
                    </div>
                    {/* Dropdowns & Filter Buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                        
                        {/* Vibe Dropdown */}
                        <div className="relative vibe-dropdown-container">
                            <button 
                                onClick={() => {
                                    setIsVibeDropdownOpen(!isVibeDropdownOpen);
                                    setIsSortDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/80 font-medium transition-all cursor-pointer select-none active:scale-[0.98]"
                            >
                                <span>{selectedVibe === "All" ? "All Vibes" : selectedVibe}</span>
                                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${isVibeDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isVibeDropdownOpen && (
                                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-[#18112e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 z-[9999] shadow-2xl animate-[fadeInUp_0.15s_ease-out] flex flex-col gap-2">
                                    {/* Search Input within Dropdown */}
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                                            <Search className="h-3.5 w-3.5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search vibes..."
                                            value={vibeSearchQuery}
                                            onChange={(e) => setVibeSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-white/45 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                                            autoFocus
                                        />
                                        {vibeSearchQuery && (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setVibeSearchQuery("");
                                                }}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white cursor-pointer"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Scrollable Vibes List */}
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-0.5">
                                        <button
                                            onClick={() => {
                                                setSelectedVibe("All");
                                                setIsVibeDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer hover:bg-white/10 flex items-center justify-between ${selectedVibe === "All" ? 'text-violet-400 font-bold bg-white/5' : 'text-white/80'}`}
                                        >
                                            <span>All Vibes</span>
                                            {selectedVibe === "All" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                                        </button>
                                        
                                        {filteredVibes.map((vibe) => (
                                            <button
                                                key={vibe}
                                                onClick={() => {
                                                    setSelectedVibe(vibe);
                                                    setIsVibeDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer hover:bg-white/10 flex items-center justify-between ${selectedVibe === vibe ? 'text-violet-400 font-bold bg-white/5' : 'text-white/80'}`}
                                            >
                                                <span>{vibe}</span>
                                                {selectedVibe === vibe && <Check className="w-3.5 h-3.5 text-violet-400" />}
                                            </button>
                                        ))}

                                        {filteredVibes.length === 0 && (
                                            <div className="text-center py-4 text-white/45 text-xs font-medium">
                                                No vibes match "{vibeSearchQuery}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative sort-dropdown-container">
                            <button
                                onClick={() => {
                                    setIsSortDropdownOpen(!isSortDropdownOpen);
                                    setIsVibeDropdownOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/80 font-medium transition-all cursor-pointer select-none active:scale-[0.98]"
                            >
                                <span className="text-white/45">Sort by:</span>
                                <span className="text-white">
                                    {sortBy === "suggested" ? "Suggested" : 
                                     sortBy === "recentlyActive" ? "Recently Active" : "Newest Members"}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSortDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-60 bg-[#18112e]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 z-[9999] shadow-2xl animate-[fadeInUp_0.15s_ease-out] flex flex-col gap-0.5">
                                    <button
                                        onClick={() => {
                                            setSortBy("suggested");
                                            setIsSortDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors cursor-pointer hover:bg-white/10 flex items-center justify-between ${sortBy === "suggested" ? 'text-violet-400 font-bold bg-white/5' : 'text-white/80'}`}
                                    >
                                        <span>Suggested / Match Relevance</span>
                                        {sortBy === "suggested" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy("recentlyActive");
                                            setIsSortDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors cursor-pointer hover:bg-white/10 flex items-center justify-between ${sortBy === "recentlyActive" ? 'text-violet-400 font-bold bg-white/5' : 'text-white/80'}`}
                                    >
                                        <span>Recently Active</span>
                                        {sortBy === "recentlyActive" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSortBy("newest");
                                            setIsSortDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 text-xs rounded-lg transition-colors cursor-pointer hover:bg-white/10 flex items-center justify-between ${sortBy === "newest" ? 'text-violet-400 font-bold bg-white/5' : 'text-white/80'}`}
                                    >
                                        <span>Newest Members</span>
                                        {sortBy === "newest" && <Check className="w-3.5 h-3.5 text-violet-400" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Reset Filter Button */}
                        <button 
                            onClick={() => {
                                setSelectedVibe("All");
                                setSortBy("suggested");
                                setSearchQuery("");
                            }}
                            title="Reset filters"
                            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-all cursor-pointer active:scale-95"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content Pane (scrollable) */}
                <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide pr-1">
                    <div className="max-w-7xl mx-auto flex flex-col gap-3">
                        {(() => {
                               if (isLoading) {
                                   return Array.from({ length: 4 }).map((_, i) => (
                                       <div key={i} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between animate-pulse border border-white/10">
                                           <div className="flex items-center gap-4 flex-1">
                                               <div className="w-14 h-14 rounded-2xl bg-white/10"></div>
                                               <div className="space-y-2 flex-1 max-w-md">
                                                   <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                                                   <div className="h-3 w-1/4 bg-white/5 rounded"></div>
                                                   <div className="h-3 w-1/2 bg-white/5 rounded"></div>
                                               </div>
                                           </div>
                                           <div className="w-24 h-9 bg-white/10 rounded-xl"></div>
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

                               if (debouncedSearchQuery || selectedVibe !== "All") {
                                   return (
                                       <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/50 space-y-4">
                                           <Search className="w-12 h-12 text-white/20" />
                                           <p className="text-lg font-bold font-outfit">
                                               No users found
                                               {debouncedSearchQuery && ` matching "${debouncedSearchQuery}"`}
                                               {selectedVibe !== "All" && ` with vibe "${selectedVibe}"`}
                                           </p>
                                       </div>
                                   );
                               }

                               return (
                                   <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                                       <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500/10 to-indigo-500/10 border border-white/10 flex items-center justify-center shadow-md shadow-indigo-500/5">
                                           <Search className="w-8 h-8 text-indigo-300" />
                                       </div>
                                       <div className="space-y-2">
                                           <h3 className="text-2xl font-extrabold text-white">Find Connections</h3>
                                           <p className="text-white/50 text-sm max-w-sm font-outfit leading-relaxed">
                                               Discover friends, family, and colleagues to stay close. Expand your network with just a few clicks.
                                           </p>
                                       </div>
                                   </div>
                               );
                        })()}

                        {/* Load More Button */}
                        {hasNextPage && (
                            <div className="flex justify-center pt-4 pb-8">
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="group flex items-center gap-2 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/80 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer shadow-xs"
                                >
                                    {isFetchingNextPage ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                                            <span>Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Load More Results</span>
                                            <Search className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-white/50" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Tip Banner */}
                {showTip && (
                    <div className="relative z-10 flex items-center justify-between p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl animate-[fadeInUp_0.4s_ease-out] shrink-0">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-violet-400 shrink-0" />
                            <p className="text-xs font-semibold text-white/70 font-outfit">
                                Tip: Send a connection request and start building meaningful relationships.
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowTip(false)}
                            className="text-white/40 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SearchPage;
