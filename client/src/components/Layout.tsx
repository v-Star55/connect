import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { SidebarProvider } from "./ui/sidebar";

const Layout = () => {
    return (
        <SidebarProvider className="bg-[#0c0c0e] !h-screen !min-h-0 overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-hidden relative bg-[#0c0c0e]">
                <Outlet />
            </main>
        </SidebarProvider>
    );
};

export default Layout;
