import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen w-full bg-[#030303] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-purple-500/30">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center space-y-8 p-6">
            
            {/* 404 Glitch Text */}
            <h1 className="text-9xl font-black text-transparent bg-clip-text bg-linear-to-r from-purple-500 via-pink-500 to-yellow-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                404
            </h1>

            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/30 rotate-3 transition-transform hover:rotate-0 duration-500">
                {/* Video */}
                <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/dance_cat.webm" type="video/webm" />
                    Your browser does not support the video tag.
                </video>
            </div>

            <div className="space-y-4 max-w-md">
                <h2 className="text-2xl font-bold text-gray-200">
                    Lost in the beat?
                </h2>
                <p className="text-gray-400">
                    The page you're looking for seems to be vibing elsewhere. Let's get you back to the dance floor.
                </p>

                <div className="pt-4">
                    <Link 
                        to="/" 
                        className="inline-flex items-center px-8 py-3 rounded-full bg-linear-to-r from-purple-600 to-pink-600 text-white font-bold text-sm uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-purple-900/20 active:scale-95"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
};

export default NotFound;
