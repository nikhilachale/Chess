

"use client";

interface FooterProps {
  onPlayClick?: () => void;
}

const Footer = ({ onPlayClick }: FooterProps) => {
  const handlePlay = () => {
    if (onPlayClick) {
      onPlayClick();
    } else {
      // Default behavior - redirect to home page to start playing
      window.location.href = '/';
    }
  };

  const handleHowToPlay = () => {
    window.location.href = '/howtoplay';
  };

  return (

      <footer className="relative z-10 mt-32 bg-gradient-to-r from-stone-900/80 via-zinc-900/80 to-stone-900/80 backdrop-blur-xl border-t border-amber-600/20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-2xl font-bold text-amber-200">
                <span>♔</span>
                <span>ROYAL CHESS</span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">
                Experience the timeless game of chess with modern technology. 
                Play online, challenge AI, and master your strategic thinking.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-stone-300 text-sm">Live & Active</span>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span>🎯 Free to Play</span>
                <span>🔒 Secure</span>
                <span>⚡ Fast</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-amber-100 font-semibold text-lg">Quick Start</h3>
              <div className="space-y-3">
                <button
                  onClick={handlePlay}
                  className="block text-stone-300 hover:text-amber-200 transition-colors text-sm"
                >
                  🎮 Play Now
                </button>
                <button
                  onClick={handleHowToPlay}
                  className="block text-stone-300 hover:text-amber-200 transition-colors text-sm text-left"
                >
                  📚 How to Play
                </button>
             

              </div>
            </div>

            {/* Game Features */}
            <div className="space-y-4">
              <h3 className="text-amber-100 font-semibold text-lg">Features</h3>
              <div className="space-y-3 text-stone-300 text-sm">
                <div className="flex items-center gap-2 hover:text-amber-200 transition-colors cursor-default">
                  <span>🤖</span>
                  <span>AI Opponents</span>
                </div>
                <div className="flex items-center gap-2 hover:text-amber-200 transition-colors cursor-default">
                  <span>🌍</span>
                  <span>Multiplayer Online</span>
                </div>
                <div className="flex items-center gap-2 hover:text-amber-200 transition-colors cursor-default">
                  <span>📱</span>
                  <span>Mobile Friendly</span>
                </div>
                <div className="flex items-center gap-2 hover:text-amber-200 transition-colors cursor-default">
                  <span>💡</span>
                  <span>Move Suggestions</span>
                </div>
                <div className="flex items-center gap-2 hover:text-amber-200 transition-colors cursor-default">
                  <span>⏱️</span>
                  <span>Real-time Play</span>
                </div>
              </div>
            </div>

            {/* Stats & Social */}
            <div className="space-y-4">
              <h3 className="text-amber-100 font-semibold text-lg">Game Stats</h3>
              <div className="space-y-3">
                <div className="bg-stone-800/40 border border-amber-600/20 rounded-xl p-3 hover:bg-stone-700/40 transition-colors">
                  <div className="text-2xl font-bold text-amber-200">24/7</div>
                  <div className="text-stone-400 text-xs">Available</div>
                </div>
                <div className="bg-stone-800/40 border border-amber-600/20 rounded-xl p-3 hover:bg-stone-700/40 transition-colors">
                  <div className="text-2xl font-bold text-emerald-400">Live</div>
                  <div className="text-stone-400 text-xs">Multiplayer</div>
                </div>
                <div className="bg-stone-800/40 border border-amber-600/20 rounded-xl p-3 hover:bg-stone-700/40 transition-colors">
                  <div className="text-2xl font-bold text-blue-400">AI</div>
                  <div className="text-stone-400 text-xs">Powered</div>
                </div>
              </div>
              
             
            </div>

          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-amber-600/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              
              {/* Copyright */}
              <div className="text-stone-400 text-sm">
                © 2025 Royal Chess. Built with passion for the game.
                <div className="mt-1 text-xs text-stone-500">
                  Open source • Made with ❤️
                </div>
              </div>

           

              {/* Social/Action */}
              <div className="flex items-center gap-3">
                <div className="text-stone-400 text-sm">Ready to play?</div>
                <button
                  onClick={handlePlay}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-zinc-900 text-sm font-bold rounded-lg hover:scale-105 transition-transform shadow-lg"
                >
                  ♔ Start Game
                </button>
              </div>

            </div>


          </div>

        </div>

        {/* Enhanced Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-full blur-xl"></div>
        
        {/* Floating Chess Pieces */}
        <div className="absolute top-4 left-12 text-3xl opacity-5 text-amber-300 animate-float">♚</div>
        <div className="absolute bottom-8 right-16 text-4xl opacity-5 text-stone-300 animate-float-delay">♛</div>
        <div className="absolute top-8 right-32 text-2xl opacity-3 text-yellow-300 animate-float-slow">♞</div>
        <div className="absolute bottom-4 left-32 text-3xl opacity-4 text-amber-200 animate-float">♝</div>
      </footer>
  );
};

export default Footer;