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
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};