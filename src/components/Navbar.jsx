import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import {
    MdNotifications,
    MdPerson,
    MdSettings,
    MdLogout,
    MdMenu,
    MdHome,
    MdChevronRight,
} from "react-icons/md";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { toggleSidebar, navOpen } = useSidebar();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [notifications] = useState(5);
    const dropdownRef = useRef(null);

    // Breadcrumb logic
    const segments = location.pathname.split("/").filter(Boolean);
    const labelMap = {
        dashboard: "Dashboard",
        grievance: "Grievances",
        feedback: "Feedback",
        new: "New",
        incoming: "Incoming",
        outgoing: "Outgoing",
    };

    // Create breadcrumbs - always include Dashboard as first item when not on dashboard
    const crumbs = [];
    if (segments.length > 0 && segments[0] !== 'dashboard') {
        // Add Dashboard as first breadcrumb
        crumbs.push({
            to: "/dashboard",
            label: "Dashboard"
        });
    }
    
    // Add remaining segments
    segments.forEach((seg, i) => {
        crumbs.push({
            to: "/" + segments.slice(0, i + 1).join("/"),
            label: labelMap[seg] ?? decodeURIComponent(seg),
        });
    });

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                event.target instanceof Node &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <style>{`
                :root {
                    --primary: 34 197 94;
                    --primary-dark: 21 128 61;
                    --primary-light: 74 222 128;
                }
                
                .header-container {
                    background: linear-gradient(135deg, 
                        rgba(15, 23, 42, 0.95) 0%, 
                        rgba(30, 41, 59, 0.9) 50%, 
                        rgba(15, 23, 42, 0.95) 100%);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }
                
                .toggle-button {
                    background: linear-gradient(135deg, 
                        rgba(var(--primary), 0.1) 0%, 
                        rgba(var(--primary), 0.05) 100%);
                    border: 1px solid rgba(var(--primary), 0.3);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .toggle-button.sidebar-collapsed {
                    background: linear-gradient(135deg, 
                        rgba(var(--primary), 0.15) 0%, 
                        rgba(var(--primary), 0.05) 100%);
                    border-color: rgba(var(--primary), 0.4);
                    box-shadow: 0 2px 8px rgba(var(--primary), 0.15);
                }
                
                .toggle-button.sidebar-collapsed .text-primary {
                    color: rgb(var(--primary)) !important;
                    filter: drop-shadow(0 0 4px rgba(var(--primary), 0.3));
                }
                
                .toggle-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, 
                        transparent, 
                        rgba(var(--primary), 0.2), 
                        transparent);
                    transition: left 0.5s;
                }
                
                .toggle-button:hover::before {
                    left: 100%;
                }
                
                .toggle-button:hover {
                    border-color: rgba(var(--primary), 0.6);
                    box-shadow: 
                        0 4px 15px rgba(var(--primary), 0.2),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transform: scale(1.05);
                }
                
                .toggle-button:active {
                    transform: scale(0.95);
                }
                
                .logo-container {
                    filter: drop-shadow(0 0 8px rgba(var(--primary), 0.3));
                    transition: all 0.3s ease;
                }
                
                .logo-container:hover {
                    filter: drop-shadow(0 0 12px rgba(var(--primary), 0.5));
                    transform: scale(1.05);
                }
                
                .notification-button {
                    background: linear-gradient(135deg, 
                        rgba(15, 23, 42, 0.8) 0%, 
                        rgba(30, 41, 59, 0.6) 100%);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                
                .notification-button:hover {
                    border-color: rgba(var(--primary), 0.4);
                    box-shadow: 
                        0 4px 15px rgba(var(--primary), 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    transform: translateY(-2px);
                }
                
                .notification-badge {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    animation: pulse-notification 2s ease-in-out infinite;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                }
                
                @keyframes pulse-notification {
                    0%, 100% { 
                        transform: scale(1);
                        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
                    }
                    50% { 
                        transform: scale(1.1);
                        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
                    }
                }
                
                .profile-button {
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .profile-button::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                   
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    z-index: -1;
                }
                
                .profile-button:hover::before {
                    opacity: 0.3;
                }
                
                .profile-button:hover {
                    transform: scale(1.05);
                }
                
                .dropdown-menu {
                    background: linear-gradient(135deg, 
                        rgba(15, 23, 42, 0.98) 0%, 
                        rgba(30, 41, 59, 0.95) 50%, 
                        rgba(15, 23, 42, 0.98) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.3),
                        0 0 0 1px rgba(var(--primary), 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    animation: dropdown-appear 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: top right;
                }
                
                @keyframes dropdown-appear {
                    0% {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .dropdown-header {
                    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
                    background: linear-gradient(135deg, 
                        rgba(var(--primary), 0.05) 0%, 
                        rgba(var(--primary), 0.02) 100%);
                }
                
                .dropdown-item {
                    color: #f1f5f9;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .dropdown-item::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 0;
                    background: linear-gradient(90deg, 
                        rgba(var(--primary), 0.1), 
                        rgba(var(--primary), 0.05));
                    transition: width 0.3s ease;
                }
                
                .dropdown-item:hover::before {
                    width: 100%;
                }
                
                .dropdown-item:hover {
                    color: rgb(var(--primary-light));
                    background: rgba(var(--primary), 0.08);
                    transform: translateX(4px);
                }
                
                .dropdown-item svg {
                    transition: all 0.2s ease;
                }
                
                .dropdown-item:hover svg {
                    color: rgb(var(--primary));
                    transform: scale(1.1);
                }
                
                .logout-item {
                    border-top: 1px solid rgba(148, 163, 184, 0.1);
                }
                
                .logout-item:hover {
                    color: #fca5a5;
                    background: rgba(239, 68, 68, 0.08);
                }
                
                .logout-item:hover svg {
                    color: #ef4444;
                }
            `}</style>

            <header className="bg-neutral-800 sticky top-0 z-[99]">
                <div className="flex items-center gap-2 lg:gap-8 justify-between max-w-7xl mx-auto w-full py-4 px-6">
                    {/* Left section: Toggle Button */}
                    <div className="flex items-center gap-2 lg:gap-8 flex-grow">
                        <button
                            onClick={toggleSidebar}
                            className={`toggle-button size-10 rounded-xl p-2 flex items-center justify-center ${!navOpen ? 'sidebar-collapsed' : ''}`}
                            title="Toggle Sidebar"
                        >
                            <MdMenu className="text-emerald-500 h-5 w-5 transition-transform duration-200 hover:scale-110" />
                        </button>
                    </div>

                    {/* Right section: Notification + Avatar */}
                    <div className="flex items-center gap-1">
                        {/* Enhanced Notification */}
                        {/* <button
                            title="Notifications"
                            className="notification-button relative h-10 w-10 flex items-center justify-center rounded-xl"
                        >
                            <MdNotifications className="text-slate-300 size-4 transition-colors duration-200 hover:text-primary" />
                            {notifications > 0 && (
                                <span className="notification-badge absolute top-1 right-1 rounded-full text-xs text-white h-3 w-3 flex items-center justify-center ">
                                    {notifications > 9 ? '9+' : notifications}
                                </span>
                            )}
                        </button> */}

                        {/* Enhanced Profile */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!isDropdownOpen)}
                                className="profile-button flex items-center gap-3 focus:outline-none rounded-xl"
                                title="User Menu"
                            >
                                <div className="relative">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                                        alt={user?.username || 'User'}
                                        width={36}
                                        height={36}
                                        className="rounded-xl object-cover object-center h-9 w-9 border-2 border-slate-600"
                                        onError={(e) => {
                                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzE2YTM0YSIvPgo8cGF0aCBkPSJNMTggMTFDMTkuNjU2OSAxMSAyMSAxMi4zNDMxIDIxIDE0QzIxIDE1LjY1NjkgMTkuNjU2OSAxNyAxOCAxN0MxNi4zNDMxIDE3IDE1IDE1LjY1NjkgMTUgMTRDMTUgMTIuMzQzMSAxNi4zNDMxIDExIDE4IDExWk0yNCAyMlYyNEgxMlYyMkMxMiAxOS4yIDIwLjU3IDE3IDE4IDE3QzE1LjQzIDE3IDEyIDE5LjIgMTIgMjJaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
                                        }}
                                    />
                                </div>
                             
                            </button>

                            {/* Enhanced Dropdown */}
                            {isDropdownOpen && (
                                <div className="dropdown-menu absolute right-0 mt-3 w-64  z-50">
                                    <div className="">
                                        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700/50">
                                            <div className="relative">
                                                <img
                                                    src={`https://ui-avatars.com/api/?name=${user?.username || 'User'}`}
                                                    alt={user?.username || 'User'}
                                                    width={36}
                                                    height={36}
                                                    className="rounded-xl object-cover object-center h-9 w-9 border-2 border-slate-600"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0iIzE2YTM0YSIvPgo8cGF0aCBkPSJNMTggMTFDMTkuNjU2OSAxMSAyMSAxMi4zNDMxIDIxIDE0QzIxIDE1LjY1NjkgMTkuNjU2OSAxNyAxOCAxN0MxNi4zNDMxIDE3IDE1IDE1LjY1NjkgMTUgMTRDMTUgMTIuMzQzMSAxNi4zNDMxIDExIDE4IDExWk0yNCAyMlYyNEgxMlYyMkMxMiAxOS4yIDIwLjU3IDE3IDE4IDE3QzE1LjQzIDE3IDEyIDE5LjIgMTIgMjJaIiBmaWxsPSIjZmZmZmZmIi8+Cjwvc3ZnPgo=';
                                                    }}
                                                />
                                            </div>
                                            <div className="hidden lg:block text-left">
                                                <div className="text-xs font-semibold text-white">{user?.username || 'User'}</div>
                                                <div className="text-xs text-slate-400">Admin</div>
                                            </div>
                                        </div>
                                        <button
                                            className="dropdown-item flex items-center gap-3 px-4 py-3 relative w-full text-left"
                                        >
                                            <MdPerson className="size-4" />
                                            <span className="text-sm font-medium">My Profile</span>
                                        </button>
                                        <button
                                            className="dropdown-item flex items-center gap-3 px-4 py-3 relative w-full text-left"
                                        >
                                            <MdSettings className="size-4" />
                                            <span className="text-sm font-medium">Settings</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="dropdown-item logout-item flex items-center justify-start gap-3 px-4 py-3 relative w-full bg-transparent border-0 border-t"
                                        >
                                            <MdLogout className="size-4" />
                                            <span className="text-sm font-medium">Sign out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Breadcrumb Navigation */}
            <div className="border-b border-neutral-200 bg-neutral-100">
                <div className="max-w-7xl mx-auto px-6 py-2">
                    <nav className="flex" aria-label="Breadcrumb">
                        <ol className="inline-flex items-center space-x-1">
                            {/* Show breadcrumbs when there are any */}
                            {crumbs.length > 0 && (
                                <>
                                    {/* Dynamic breadcrumbs */}
                                    {crumbs.map((crumb, index) => {
                                        const isLast = index === crumbs.length - 1;
                                        const isFirst = index === 0;
                                        return (
                                            <li key={crumb.to} className="flex items-center">
                                                {index > 0 && (
                                                    <MdChevronRight className="w-3 h-3 text-gray-600 mx-1" />
                                                )}
                                                {isLast ? (
                                                    <span className="text-xs text-gray-600 flex items-center">
                                                        {isFirst && <MdHome className="w-3 h-3 text-gray-600 mr-1" />}
                                                        {crumb.label}
                                                    </span>
                                                ) : (
                                                    <Link
                                                        to={crumb.to}
                                                        className="text-xs text-gray-500 hover:text-emerald-600 transition-colors flex items-center hover:underline"
                                                    >
                                                        {isFirst && <MdHome className="w-3 h-3 text-gray-600 mr-1" />}
                                                        {crumb.label}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </>
                            )}
                        </ol>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Navbar;
