import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Exercise from './pages/Exercise';
import Challenges from './pages/Challenges';
import DailyChallenge from './pages/DailyChallenge';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import WeeklyChallenge from './pages/WeeklyChallenge';
import SpeedChallenge from './pages/SpeedChallenge';
import AccuracyChallenge from './pages/AccuracyChallenge';
import PracticeSelection from './pages/PracticeSelection';
import PracticeMode from './pages/PracticeMode';
import PerfectPitchChallenge from './pages/PerfectPitchChallenge';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';
import Social from './pages/Social';
import Training from './pages/Training';
import PracticeStudio from './pages/PracticeStudio';
import Landing from './pages/Landing';
import Home from './pages/Home';
import FeedbackAdmin from './pages/FeedbackAdmin';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Exercises": Exercises,
    "Exercise": Exercise,
    "Challenges": Challenges,
    "DailyChallenge": DailyChallenge,
    "Badges": Badges,
    "Profile": Profile,
    "Leaderboard": Leaderboard,
    "WeeklyChallenge": WeeklyChallenge,
    "SpeedChallenge": SpeedChallenge,
    "AccuracyChallenge": AccuracyChallenge,
    "PracticeSelection": PracticeSelection,
    "PracticeMode": PracticeMode,
    "PerfectPitchChallenge": PerfectPitchChallenge,
    "Friends": Friends,
    "FriendProfile": FriendProfile,
    "Social": Social,
    "Training": Training,
    "PracticeStudio": PracticeStudio,
    "Landing": Landing,
    "Home": Home,
    "FeedbackAdmin": FeedbackAdmin,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};