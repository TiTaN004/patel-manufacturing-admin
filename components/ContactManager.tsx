import React, { useState } from 'react';
import { useData } from '../DataContext';
import { Mail, Trash2, Search, User, Phone, MessageSquare, Clock, X, ChevronRight } from 'lucide-react';
import { Pagination } from './ui/Pagination';

const ContactManager: React.FC = () => {
  const { 
    contacts, 
    totalContacts, 
    contactPage, 
    pageSize, 
    searchTerm,
    actions 
  } = useData();

  const [selectedContact, setSelectedContact] = useState<any>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Contact Inquiries</h1>
          <p className="text-slate-500 font-medium">Manage customer messages and feedback</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search by name, email or subject..."
            className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all font-medium text-slate-600 shadow-sm"
            value={searchTerm}
            onChange={(e) => actions.setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Inquiries</p>
            <p className="text-2xl font-black text-slate-800">{contacts.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Recent (24h)</p>
            <p className="text-2xl font-black text-slate-800">
              {contacts.filter(c => {
                const date = new Date(c.createdAt);
                const now = new Date();
                return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000;
              }).length}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Last Activity</p>
            <p className="text-sm font-black text-slate-800">
              {contacts.length > 0 ? formatDate(contacts[0].createdAt) : 'No data'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-50 shadow-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center w-16">#</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Inquiry Details</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.length > 0 ? (
                contacts.map((contact, index) => (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-6 py-5 text-center text-slate-400 font-mono text-xs">{((contactPage - 1) * pageSize) + index + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-slate-500 font-medium">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 text-sm line-clamp-1">{contact.subject}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {contact.mobile}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(contact.createdAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContact(contact);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                              actions.deleteContact(contact.id);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                        <Mail className="h-8 w-8" />
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No inquiries found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={contactPage}
          totalItems={totalContacts}
          pageSize={pageSize}
          onPageChange={actions.setContactPage}
          label="inquiries"
        />
      </div>

      {/* Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative p-8 space-y-8">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedContact(null)}
                className="absolute top-6 right-6 p-2 rounded-2xl text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-6 pt-4">
                <div className="h-20 w-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                  <User className="h-10 w-10" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                      {selectedContact.firstName} {selectedContact.lastName}
                    </h2>
                  </div>
                  <p className="text-indigo-600 font-black uppercase text-xs tracking-widest">Inquiry Received</p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2 border-y-2 border-slate-50">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                        <Mail className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{selectedContact.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</p>
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                        <Phone className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">{selectedContact.mobile}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Date</p>
                    <div className="flex items-center gap-2 group">
                      <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <p className="font-bold text-slate-600">{formatDate(selectedContact.createdAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference ID</p>
                    <p className="font-mono text-xs font-bold text-slate-400 px-3 py-2 bg-slate-50 rounded-xl inline-block mt-1">#CM-{selectedContact.id.padStart(4, '0')}</p>
                  </div>
                </div>
              </div>

              {/* Message Area */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</p>
                  <p className="text-xl font-black text-slate-800 tracking-tight">{selectedContact.subject}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</p>
                  <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                    {selectedContact.message || 'No message provided.'}
                  </p>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setSelectedContact(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                >
                  Close Inquiry
                </button>
                <button 
                  onClick={() => {
                      actions.deleteContact(selectedContact.id);
                      setSelectedContact(null);
                  }}
                  className="p-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all"
                >
                  <Trash2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;
