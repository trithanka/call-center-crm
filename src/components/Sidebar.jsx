import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import asdmLogo from "../assets/asdm-logo3.png";
import { useSidebar } from "../context/SidebarContext";
import * as Md from "react-icons/md";

const navigation = [
    { name: "Dashboard", icon: Md.MdOutlineSpaceDashboard, to: "/dashboard" },
    { name: "Grievances", icon: Md.MdOutlineLiveHelp, to: "/grievance" },
    { name: "Feedbacks", icon: Md.MdOutlineFeedback, to: "/feedback" },
];

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Sidebar = () => {
    const location = useLocation();
    const { navOpen, activeItem, setActiveNavItem, closeSidebar } = useSidebar();
    const overlayRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && navOpen) {
                closeSidebar();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [navOpen, closeSidebar]);

    const sidebarClasses = cn(
        "top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
        "bg-neutral-800",
        "border-r border-slate-700/50 backdrop-blur-xl",
        navOpen
            ? "w-56 shadow-2xl shadow-black/20"
            : "-left-full lg:left-0 lg:w-[89px] lg:shadow-lg sidebar-collapsed"
    );

    const handleNavClick = (to, name) => {
        setActiveNavItem(name);
        if (window.innerWidth < 1024) closeSidebar();
        console.log(`Navigating to ${name}: ${to}`);
    };

    // Function to check if a route is active
    const isActiveRoute = (path) => {
        if (path === "/dashboard") {
            return location.pathname === "/dashboard";
        }
        if (path === "/grievance") {
            // Only match grievance routes that are NOT outgoing forms
            return location.pathname.startsWith("/grievance") && 
                   !location.pathname.includes("/new/outgoing");
        }
        if (path === "/feedback") {
            // Match feedback routes AND outgoing forms
            return location.pathname.startsWith("/feedback") || 
                   location.pathname.includes("/new/outgoing");
        }
        return location.pathname === path;
    };

  return (
        <>
            <style>{`
                :root {
                    --primary: 34 197 94;
                }
                .nav-item-active {
                    background: linear-gradient(135deg, rgb(var(--primary) / 0.15), rgb(var(--primary) / 0.05));
                    color: rgb(var(--primary));
                }
                .nav-item-active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: linear-gradient(to bottom, rgb(var(--primary)), rgb(var(--primary) / 0.6));
                    border-radius: 0 4px 4px 0;
                }
                .sidebar-collapsed .nav-item-active::before {
                    display: none;
                }
                .nav-item:hover {
                    background: linear-gradient(135deg, rgb(var(--primary) / 0.08), transparent);
                    transform: translateX(4px);
                }
                .text-glow {
                    text-shadow: 0 0 20px rgb(var(--primary) / 0.3);
                }
                .scrollbar-thin::-webkit-scrollbar {
                    width: 4px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: rgb(var(--primary) / 0.1);
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: rgb(var(--primary) / 0.3);
                    border-radius: 2px;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: rgb(var(--primary) / 0.5);
                }
            `}</style>

            {navOpen && (
                <div
                    ref={overlayRef}
                    className=""
                    onClick={closeSidebar}
                />
            )}

            <nav className={sidebarClasses} aria-label="Main navigation">
                {/* Header with improved styling */}
                <div className={`px-6 py-3 flex items-center border-b border-slate-700/30`}>
                    <div className="relative">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src={asdmLogo} alt="Logo" className="size-12 rounded-full mix-blend-plus-lighter" />
                        </div>
                    </div>
                    <div className={cn(
                        "text-white transition-all duration-300 overflow-hidden whitespace-nowrap flex-grow",
                        navOpen ? 'ml-2 opacity-100' : 'w-0 opacity-0 lg:ml-2 lg:opacity-100'
                    )}>
                        <p className="text-sm font-bold text-glow">ASDM CRM</p>
                        <p className="text-xs text-slate-300 font-medium tracking-wide">
                            Call Center CRM
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="py-6 flex-grow overflow-y-auto scrollbar-thin">
                    <div className="px-4">
                        {/* Section Header */}
                        <div className="mb-4">
                            <span className={cn(
                                "text-xs font-bold text-slate-400 uppercase tracking-widest",
                                navOpen ? 'block' : 'hidden lg:block lg:text-center'
                            )}>
                                Main
                            </span>
                        </div>

                        {/* Main Navigation */}
                        <ul className="space-y-2">
                            {navigation.map(item => (
                                <li key={item.name}>
        <Link
                                        to={item.to}
                                        onClick={() => handleNavClick(item.to, item.name)}
                                        className={cn(
                                            "nav-item group flex items-center transition-all duration-200 relative",
                                            navOpen ? "px-4 py-2 rounded-r-xl" : null,
                                            "px-4 py-2 rounded-xl hover:shadow-lg hover:shadow-primary/10 text-sm",
                                            isActiveRoute(item.to)
                                                ? "nav-item-active"
                                                : "text-slate-300 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center w-full">
                                            <item.icon className={cn(
                                                "transition-all duration-200 flex-shrink-0",
                                                navOpen ? 'h-5 w-5' : 'h-5 w-5',
                                                isActiveRoute(item.to)
                                                    ? "text-primary"
                                                    : "text-slate-400 group-hover:text-primary"
                                            )} />
                                            <span className={cn(
                                                "whitespace-nowrap transition-all duration-200",
                                                navOpen ? 'opacity-100 ml-2' : 'lg:w-0 lg:opacity-0 lg:overflow-hidden'
                                            )}>
                                                {item.name}
                                            </span>
                                        </div>
        </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700/30">
                    <div className={cn(
                        "flex items-center transition-all duration-300",
                        navOpen ? 'justify-between' : 'justify-center'
                    )}>
                        <div className={cn(
                            "text-xs text-slate-500 transition-all duration-300",
                            navOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
                        )}>
                            v2.1.0
                        </div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    </div>
                </div>
      </nav>
        </>
  );
};

export default Sidebar;
