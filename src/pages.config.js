/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AccuracyChallenge from './pages/AccuracyChallenge';
import Badges from './pages/Badges';
import Challenges from './pages/Challenges';
import ClassroomDetails from './pages/ClassroomDetails';
import CustomExerciseBuilder from './pages/CustomExerciseBuilder';
import DailyChallenge from './pages/DailyChallenge';
import Dashboard from './pages/Dashboard';
import Exercise from './pages/Exercise';
import Exercises from './pages/Exercises';
import FeedbackAdmin from './pages/FeedbackAdmin';
import FriendProfile from './pages/FriendProfile';
import Friends from './pages/Friends';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import MetricsAdmin from './pages/MetricsAdmin';
import PerfectPitchChallenge from './pages/PerfectPitchChallenge';
import PracticeMode from './pages/PracticeMode';
import PracticeSelection from './pages/PracticeSelection';
import PracticeStudio from './pages/PracticeStudio';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Profile from './pages/Profile';
import Social from './pages/Social';
import SpeedChallenge from './pages/SpeedChallenge';
import TeacherDashboard from './pages/TeacherDashboard';
import TermsOfService from './pages/TermsOfService';
import Training from './pages/Training';
import WeeklyChallenge from './pages/WeeklyChallenge';
import ClassroomMarketplace from './pages/ClassroomMarketplace';
import ManageEnrollments from './pages/ManageEnrollments';
import RevenueSettings from './pages/RevenueSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccuracyChallenge": AccuracyChallenge,
    "Badges": Badges,
    "Challenges": Challenges,
    "ClassroomDetails": ClassroomDetails,
    "CustomExerciseBuilder": CustomExerciseBuilder,
    "DailyChallenge": DailyChallenge,
    "Dashboard": Dashboard,
    "Exercise": Exercise,
    "Exercises": Exercises,
    "FeedbackAdmin": FeedbackAdmin,
    "FriendProfile": FriendProfile,
    "Friends": Friends,
    "Home": Home,
    "Landing": Landing,
    "Leaderboard": Leaderboard,
    "MetricsAdmin": MetricsAdmin,
    "PerfectPitchChallenge": PerfectPitchChallenge,
    "PracticeMode": PracticeMode,
    "PracticeSelection": PracticeSelection,
    "PracticeStudio": PracticeStudio,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "Profile": Profile,
    "Social": Social,
    "SpeedChallenge": SpeedChallenge,
    "TeacherDashboard": TeacherDashboard,
    "TermsOfService": TermsOfService,
    "Training": Training,
    "WeeklyChallenge": WeeklyChallenge,
    "ClassroomMarketplace": ClassroomMarketplace,
    "ManageEnrollments": ManageEnrollments,
    "RevenueSettings": RevenueSettings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};