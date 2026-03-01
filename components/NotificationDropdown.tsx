import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, ShoppingBag, AlertTriangle, Info, Clock, Trash2, X } from 'lucide-react';
import { useData } from '../DataContext';
import { Notification } from '../types';

export const NotificationDropdown: React.FC = () => {
    const { notifications, totalNotifications, actions } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingBag className="text-indigo-600" size={16} />;
            case 'stock': return <AlertTriangle className="text-amber-600" size={16} />;
            default: return <Info className="text-blue-600" size={16} />;
        }
    };

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / 60000);
        
        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return past.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all relative ${isOpen ? 'bg-slate-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{unreadCount} New Alerts</p>
                        </div>
                        {notifications.length > 0 && (
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); actions.markAllNotificationsAsRead(); }}
                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 transition-all flex items-center gap-1.5"
                                    >
                                        <Check size={12} />
                                        Mark all read
                                    </button>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); actions.deleteAllNotifications(); }}
                                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 transition-all flex items-center gap-1.5"
                                >
                                    <Trash2 size={12} />
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification.id} 
                                        onClick={() => !notification.is_read && actions.markNotificationAsRead(notification.id)}
                                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 ${!notification.is_read ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center ${
                                            !notification.is_read ? 'bg-white shadow-sm' : 'bg-slate-100'
                                        }`}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className={`text-sm truncate ${!notification.is_read ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-medium">
                                                    <Clock size={10} />
                                                    {getTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center justify-between py-1">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); actions.deleteNotification(notification.id); }}
                                                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-400">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell size={24} className="opacity-20" />
                                </div>
                                <p className="text-sm font-medium">No notifications yet</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-60">Everything is up to date</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                        <button className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                            View All History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
