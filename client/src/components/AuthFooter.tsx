
const AuthFooter = () => {
    return (
        <footer className="px-10 py-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <div className="flex items-center gap-4">
                <span>&copy; 2026 CONNECT MESSENGER. STAY CLOSE.</span>
            </div>
            <div className="flex items-center gap-8">
                <a href="#!" className="hover:text-white transition-colors">Privacy</a>
                <a href="#!" className="hover:text-white transition-colors">Terms</a>
                <a href="#!" className="hover:text-white transition-colors">Contact</a>
            </div>
        </footer>
    );
};

export default AuthFooter;