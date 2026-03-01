import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import {
  Users,
  Search,
  User as UserIcon,
  Phone,
  Mail,
  CreditCard,
  Plus,
  X,
  Check,
  ShoppingBag,
  Save,
  Loader2,
  Edit,
  FileText,
  Upload,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { userAPI } from '../utils/api';

const BulkUserManager: React.FC = () => {
  const {
    bulkUsers,
    allProducts,
    actions
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isOutstandingModalOpen, setOutstandingModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isBulkModalOpen, setBulkModalOpen] = useState(false);

  const [outstandingAmount, setOutstandingAmount] = useState<number>(0);
  const [bulkText, setBulkText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New User Form State
  const [newUser, setNewUser] = useState({
    fullName: '',
    userName: '',
    emailID: '',
    mobileNo: '',
    password: ''
  });

  const [editUser, setEditUser] = useState({
    fullName: '',
    emailID: '',
    mobileNo: '',
    user_role: 'bulk',
    isActive: 1
  });

  // Filtered bulk users based on search
  const filteredUsers = bulkUsers.filter(u =>
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.emailID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobileNo.includes(searchTerm)
  );

  const handleOpenOutstanding = (user: any) => {
    setSelectedUser(user);
    setOutstandingAmount(user.outstanding_amount);
    setOutstandingModalOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newUser.fullName || !newUser.password) {
      alert("Please fill in required fields");
      return;
    }
    setIsSaving(true);
    try {
      await actions.createBulkUser(newUser);
      setCreateModalOpen(false);
      setNewUser({
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

  const handleSaveOutstanding = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await actions.upsertBulkOutstanding(selectedUser.userID, outstandingAmount);
      setOutstandingModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUser({
      fullName: user.fullName,
      emailID: user.emailID || user.email, // fallback for different property names
      mobileNo: user.mobileNo,
      user_role: user.user_role,
      isActive: user.isActive !== undefined ? (user.isActive ? 1 : 0) : 1
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      await actions.bulkUpdateUsers([{ userID: selectedUser.userID, ...editUser }]);
      setEditModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.trim().split('\n');
    if (lines.length < 2) {
      alert("Please provide headers and at least one row of data");
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const usersToUpdate = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const user: any = {};
      headers.forEach((header, index) => {
        if (!values[index]) return;

        if (header === 'email' || header === 'emailid' || header === 'email id') user.emailID = values[index];
        if (header === 'name' || header === 'fullname' || header === 'full name') user.fullName = values[index];
        if (header === 'mobile' || header === 'mobileno' || header === 'mobile no') user.mobileNo = values[index];
        if (header === 'role' || header === 'user_role' || header === 'user role') user.user_role = values[index];
        if (header === 'active') user.isActive = values[index].toLowerCase() === 'true' || values[index] === '1' ? 1 : 0;
      });
      return user;
    }).filter(u => u.emailID || u.mobileNo);

    if (usersToUpdate.length === 0) {
      alert("No valid data found (Email/Mobile required)");
      return;
    }

    setIsSaving(true);
    try {
      await actions.bulkUpdateUsers(usersToUpdate);
      setBulkModalOpen(false);
      setBulkText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full md:w-auto">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bulk User Management</h1>
            <p className="text-slate-500 font-medium">Manage visibility and payments for bulk accounts</p>
          </div>
          <Button
            className="md:hidden rounded-2xl p-4"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus size={24} />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-600 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="hidden md:flex rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus size={18} className="mr-2" />
            New Bulk User
          </Button>
          <Button
            variant="ghost"
            className="hidden md:flex rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-xs border-2 border-slate-100"
            onClick={() => setBulkModalOpen(true)}
          >
            <Upload size={18} className="mr-2" />
            Bulk Update
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
            <div key={user.userID} className="bg-white rounded-[2rem] border-2 border-slate-50 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group overflow-hidden relative">
              <div className="flex items-start gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                  <UserIcon className="h-8 w-8" />
                </div>

                <div className="flex-1 min-w-0 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">{user.fullName}</h3>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-400">
                      {user.emailID && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.emailID}</span>}
                      {user.mobileNo && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {user.mobileNo}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Outstanding</p>
                      <p className="text-2xl font-black text-indigo-600 tracking-tighter">₹{user.outstanding_amount.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl h-10 w-10 p-0 text-indigo-600 hover:bg-indigo-50"
                        onClick={() => handleEditUser(user)}
                        title="Edit User Details"
                      >
                        <Edit size={18} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl h-10 w-10 p-0"
                        onClick={() => handleOpenOutstanding(user)}
                        title="Edit Outstanding"
                      >
                        <CreditCard size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">No bulk users found</p>
          </div>
        )}
      </div>

      {/* Outstanding Modal */}
      {isOutstandingModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage Balance</h2>
                <button onClick={() => setOutstandingModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <UserIcon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Customer</p>
                  <p className="font-black text-slate-800">{selectedUser.fullName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Outstanding Amount (₹)</label>
                <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-indigo-600 transition-colors">₹</span>
                  <input
                    type="number"
                    className="w-full pl-10 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-black text-2xl text-slate-800"
                    placeholder="0.00"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Button
                className="w-full py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-200"
                onClick={handleSaveOutstanding}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Save Balance
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Bulk Account</h2>
                <button onClick={() => setCreateModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      placeholder="John Doe"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username *</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      placeholder="johndoe"
                      value={newUser.userName}
                      onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EmailID *</label>
                  <input
                    type="email"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    placeholder="john@example.com"
                    value={newUser.emailID}
                    onChange={(e) => setNewUser({ ...newUser, emailID: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile No</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      placeholder="+91 0000000000"
                      value={newUser.mobileNo}
                      onChange={(e) => setNewUser({ ...newUser, mobileNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password *</label>
                    <input
                      type="password"
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      placeholder="••••••••"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-100 mt-4"
                onClick={handleCreateUser}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                Create Bulk User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit User Details</h2>
                <button onClick={() => setEditModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={editUser.fullName}
                    onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                  <input
                    type="email"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                    value={editUser.emailID}
                    onChange={(e) => setEditUser({ ...editUser, emailID: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile No</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700"
                      value={editUser.mobileNo}
                      onChange={(e) => setEditUser({ ...editUser, mobileNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select
                      className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 appearance-none"
                      value={editUser.isActive}
                      onChange={(e) => setEditUser({ ...editUser, isActive: parseInt(e.target.value) })}
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button
                className="w-full py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-100 mt-4"
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Upload size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bulk Update Users</h2>
                </div>
                <button onClick={() => setBulkModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-800">
                  <AlertCircle className="shrink-0 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide leading-none mb-1">Important</p>
                    <p className="text-xs font-bold opacity-80">Format: Email, Full Name, Mobile, Role, Active (1 or 0)<br />Match happens by Email or Mobile if ID is not provided.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CSV Data (Including Headers)</label>
                  <textarea
                    className="w-full h-60 p-6 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[2rem] outline-none transition-all font-mono text-sm text-slate-700"
                    placeholder="email,full name,mobile,role,active&#10;user@example.com,John Doe,9876543210,bulk,1"
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  className="flex-1 py-6 rounded-2xl font-black uppercase text-sm tracking-widest"
                  onClick={() => setBulkModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-[2] py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-indigo-100"
                  onClick={handleBulkUpdate}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
                  Apply Bulk Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUserManager;
