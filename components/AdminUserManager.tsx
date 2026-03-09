import React, { useState } from 'react';
import { useData } from '../DataContext';
import {
    ShieldCheck,
    User as UserIcon,
    Phone,
    Mail,
    Plus,
    X,
    Check,
    Loader2,
    Lock,
    ChevronRight,
    Edit,
    Save,
    ShieldAlert
} from 'lucide-react';
import { Button } from './ui/Button';

const AdminUserManager: React.FC = () => {
    const { admins, actions } = useData();
    const [isSaving, setIsSaving] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    // New Admin Form State
    const [newAdmin, setNewAdmin] = useState({
        fullName: '',
        userName: '',
        emailID: '',
        mobileNo: '',
        password: ''
    });

    const [editAdmin, setEditAdmin] = useState({
        fullName: '',
        userName: '',
        emailID: '',
        password: '',
        isAdmin: 1
    });

    const handleOpenEdit = (admin: any) => {
        setSelectedAdmin(admin);
        setEditAdmin({
            fullName: admin.fullName,
            userName: admin.userName || '',
            emailID: admin.emailID || admin.email,
            password: '',
            isAdmin: admin.isAdmin ? 1 : 0
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedAdmin) return;
        setIsSaving(true);
        try {
            const payload: any = {
                userID: selectedAdmin.userID,
                isAdmin: editAdmin.isAdmin
            };

            if (editAdmin.userName && editAdmin.userName !== selectedAdmin.userName) {
                payload.userName = editAdmin.userName;
            }
            if (editAdmin.password) {
                payload.password = editAdmin.password;
            }

            await actions.updateUser(payload);
            alert("Admin user updated successfully!");
            setEditModalOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateAdmin = async () => {
        if (!newAdmin.fullName || !newAdmin.userName || !newAdmin.password) {
            alert("Please fill in all required fields (Full Name, Username, Email, Password)");
            return;
        }

        setIsSaving(true);
        try {
            await actions.createAdminUser(newAdmin);
            alert("Admin user created successfully!");
            setNewAdmin({
                fullName: '',
                userName: '',
                emailID: '',
                mobileNo: '',
                password: ''
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                    <ShieldCheck className="text-indigo-600 h-10 w-10" />
                    Admin Management
                </h1>
                <p className="text-slate-500 font-medium text-lg">Create and authorize additional administrative accounts</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Creation Form */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-10 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <ShieldCheck size={200} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Register New Admin</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enter account credentials below</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <UserIcon size={14} className="text-indigo-400" /> Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="e.g. Rahul Sharma"
                                        value={newAdmin.fullName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <UserIcon size={14} className="text-indigo-400" /> Username *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="e.g. rahul_admin"
                                        value={newAdmin.userName}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, userName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Mail size={14} className="text-indigo-400" /> Email ID
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="e.g. rahul@patelbox.com"
                                        value={newAdmin.emailID}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, emailID: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Phone size={14} className="text-indigo-400" /> Mobile No
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="e.g. +91 98765 43210"
                                        value={newAdmin.mobileNo}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, mobileNo: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Lock size={14} className="text-indigo-400" /> Secure Password *
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="••••••••"
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    className="w-full py-8 rounded-[2rem] font-black uppercase text-base tracking-[0.2em] shadow-2xl shadow-indigo-200 group relative overflow-hidden"
                                    onClick={handleCreateAdmin}
                                    disabled={isSaving}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover:scale-105 transition-transform duration-500" />
                                    <div className="relative z-10 flex items-center justify-center">
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="animate-spin mr-3 h-6 w-6" />
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck className="mr-3 h-6 w-6" />
                                                Finalize Admin Creation
                                                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </Button>

                                <p className="text-center mt-6 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Important: New admins will have full access to all store operations immediately after creation.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin List */}
                <div className="lg:col-span-12">
                    <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 p-10 shadow-sm relative group overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                                <div className="h-12 w-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800">Existing Administrators</h2>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manage current admin accounts</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                {admins.map((admin) => (
                                    <div key={admin.userID} className="p-6 rounded-3xl bg-slate-50/50 border-2 border-slate-50 hover:border-indigo-100 hover:bg-white transition-all group/card">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-14 w-14 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-indigo-600 shadow-sm font-black text-xl">
                                                    {admin.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-slate-800 tracking-tight">{admin.fullName}</h3>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">@{admin.userName || 'no-username'}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="h-12 w-12 rounded-2xl bg-white border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 transition-all p-0"
                                                onClick={() => handleOpenEdit(admin)}
                                            >
                                                <Edit size={20} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Edit size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800">Edit Admin Settings</h2>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedAdmin?.fullName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="h-12 w-12 rounded-2xl hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        value={editAdmin.userName}
                                        onChange={(e) => setEditAdmin({ ...editAdmin, userName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-sm"
                                        placeholder="Leave blank to keep same"
                                        value={editAdmin.password}
                                        onChange={(e) => setEditAdmin({ ...editAdmin, password: e.target.value })}
                                    />
                                </div>

                                <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-100 flex items-start gap-4">
                                    <ShieldAlert className="text-amber-600 shrink-0" size={24} />
                                    <div>
                                        <h4 className="font-black text-amber-900 text-sm">Privilege Control</h4>
                                        <p className="text-amber-700 text-xs font-bold leading-relaxed mt-1">
                                            You can demote this user from administrative status. This will revoke their access to the admin panel.
                                        </p>
                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                onClick={() => setEditAdmin({ ...editAdmin, isAdmin: editAdmin.isAdmin ? 0 : 1 })}
                                                className={`h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${editAdmin.isAdmin
                                                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-200'
                                                    : 'bg-white text-slate-400 border-2 border-slate-100'
                                                    }`}
                                            >
                                                {editAdmin.isAdmin ? 'Admin Enabled' : 'Admin Disabled'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <Button
                                    className="flex-1 py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100"
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2" size={18} />}
                                    Save Changes
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="px-8 rounded-[1.5rem] font-black uppercase text-xs tracking-widest border-2 border-transparent hover:border-slate-100"
                                    onClick={() => setEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManager;
