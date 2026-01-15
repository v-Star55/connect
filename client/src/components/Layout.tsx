import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
    return (
        <div className="flex w-full h-screen bg-[#030303] overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
