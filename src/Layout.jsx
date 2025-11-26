import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Home, 
  Music2, 
  Trophy, 
  Award, 
  User, 
  Moon, 
  Sun,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import XPBar from '@/components/ui/XPBar';
import StreakBadge from '@/components/ui/StreakBadge';

export default function Layout({ children, currentPageName }) {
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const stats = await base44.entities.UserStats.filter({ created_by: user.email });
      return stats[0] || { xp: 0, level: 1, streak: 0, freeze_tokens: 0, theme: 'light' };
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    const savedTheme = userStats?.theme || localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, [userStats?.theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
    
    if (userStats?.id) {
      await base44.entities.UserStats.update(userStats.id, { theme: newTheme });
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: 'Dashboard', icon: Home, path: 'Dashboard' },
    { name: 'Exercises', icon: Music2, path: 'Exercises' },
    { name: 'Challenges', icon: Trophy, path: 'Challenges' },
    { name: 'Badges', icon: Award, path: 'Badges' },
    { name: 'Profile', icon: User, path: 'Profile' },
  ];

  const isActive = (path) => currentPageName === path;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAFC] dark:bg-[#0A1A2F] transition-colors duration-300">
      <style>{`
        :root {
          --intonaro-navy: #0A1A2F;
          --deep-indigo: #243B73;
          --azure-accent: #3E82FC;
          --soft-sky: #D7E5FF;
          --ear-gold: #E9C46A;
          --chord-green: #2A9D8F;
          --pitch-red: #E76F51;
        }
        .dark {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
        }
        html, body {
          overflow-x: hidden;
          width: 100%;
          max-width: 100vw;
        }
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pb-safe {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-xl border-b border-[#D7E5FF] dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0A1A2F] dark:text-white">
                INTONARO
              </span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-[#243B73] text-white'
                      : 'text-[#0A1A2F] dark:text-white/70 hover:bg-[#D7E5FF] dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {userStats && (
                <>
                  <div className="hidden xl:block w-48">
                    <XPBar xp={userStats.xp || 0} level={userStats.level || 1} />
                  </div>
                  <StreakBadge streak={userStats.streak || 0} freezeTokens={userStats.freeze_tokens || 0} />
                </>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-[#0A1A2F] dark:text-white"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>

              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-[#0A1A2F] dark:text-white"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A1A2F]/80 backdrop-blur-xl border-b border-[#D7E5FF] dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#243B73] to-[#3E82FC] flex items-center justify-center">
              <Music2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#0A1A2F] dark:text-white">INTONARO</span>
          </Link>

          <div className="flex items-center gap-2">
            {userStats && (
              <StreakBadge streak={userStats.streak || 0} freezeTokens={userStats.freeze_tokens || 0} />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-2 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={createPageUrl(item.path)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-[#243B73] text-white'
                          : 'text-[#0A1A2F] dark:text-white hover:bg-[#D7E5FF] dark:hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  ))}
                  {user && (
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start gap-3 px-4 py-3 h-auto text-base font-medium text-[#E76F51]"
                    >
                      <LogOut className="w-5 h-5" />
                      Log Out
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0A1A2F]/90 backdrop-blur-xl border-t border-[#D7E5FF] dark:border-slate-800 pb-safe">
        <div className="flex items-center justify-evenly h-14 w-full max-w-full px-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={createPageUrl(item.path)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 min-w-0 flex-1 transition-all ${
                isActive(item.path)
                  ? 'text-[#243B73] dark:text-[#3E82FC]'
                  : 'text-[#0A1A2F]/50 dark:text-white/50'
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive(item.path) ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[10px] font-medium truncate max-w-full">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-14 lg:pt-20 pb-20 lg:pb-8 min-h-screen w-full overflow-x-hidden">
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}