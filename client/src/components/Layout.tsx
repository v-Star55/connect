import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomBar from "./BottomBar";
import { SidebarProvider } from "./ui/sidebar";
import ConnectionRequestsModal from "./ConnectionRequestsModal";

const Layout = () => {
    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <SidebarProvider className="relative !h-screen !min-h-0 overflow-hidden select-none bg-transparent">
            {/* Background Video */}
            <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            >
                <source src="/rain.mp4" type="video/mp4" />
            </video>
            
            {/* Background Video Overlay */}
            {/* <div className="absolute inset-0 bg-black/5 z-0 pointer-events-none" /> */}

            {/* Sidebar */}
            <Sidebar onOpenRequests={() => setIsRequestsModalOpen(true)} />

            {/* Main Content Area */}
            <main className={`flex-1 h-screen overflow-hidden relative z-10 bg-transparent transition-all duration-300 ${isChatOpen ? "pb-0 md:pb-24" : "pb-24"} xl:pb-0`}>
                <Outlet context={{ setIsChatOpen }} />
            </main>

            {/* Bottom Navigation for mobile/tablets */}
            <BottomBar 
                onOpenRequests={() => setIsRequestsModalOpen(true)} 
                isChatOpen={isChatOpen}
            />

            {/* Connection Requests Modal hoisted to Layout */}
            <ConnectionRequestsModal 
                isOpen={isRequestsModalOpen} 
                onClose={() => setIsRequestsModalOpen(false)} 
            />
        </SidebarProvider>
    );
};

export default Layout;
