import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import Exercise from './pages/Exercise';
import Challenges from './pages/Challenges';
import DailyChallenge from './pages/DailyChallenge';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Exercises": Exercises,
    "Exercise": Exercise,
    "Challenges": Challenges,
    "DailyChallenge": DailyChallenge,
    "Badges": Badges,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};