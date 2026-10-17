import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MessageSquare,
  Send,
  Trash2,
  Shield,
  Megaphone,
  Users,
  Search,
  Smile,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Code,
  GraduationCap,
  Sparkles,
  UserCheck,
  Mail,
  User,
  MessageCircle,
} from 'lucide-react';
import { UserRole, User as UserType } from '../../types';

interface StudentChatRoomProps {
  isAdminView?: boolean;
}

const quickEmojis = ['👍', '💡', '📚', '💻', '👏', '😊', '🔥', '❓', '✅'];

const roleBadgeStyles: Record<UserRole, { label: string; bg: string; text: string }> = {
  super_admin: { label: 'Super Admin', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300' },
  admin: { label: 'Admin TU', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' },
  guru: { label: 'Guru Mapel', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300' },
  wali_kelas: { label: 'Wali Kelas', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300' },
  kepala_sekolah: { label: 'Kepala Sekolah', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300' },
  siswa: { label: 'Siswa', bg: 'bg-cyan-100 dark:bg-cyan-950/60', text: 'text-cyan-700 dark:text-cyan-300' },
};

export const StudentChatRoom: React.FC<StudentChatRoomProps> = ({ isAdminView = false }) => {
  const {
    currentUser,
    currentRole,
    users,
    chatMessages,
    sendChatMessage,
    deleteChatMessage,
    sendModeratorAnnouncement,
    directMessages,
    sendDirectMessage,
    deleteDirectMessage,
  } = useApp();

  const isAdmin = currentRole === 'admin' || currentRole === 'super_admin' || isAdminView;

  // Active Main Chat Tab: 'public' (Forum Siswa) vs 'dm' (Pesan Pribadi per Profil)
  const [activeTab, setActiveTab] = useState<'public' | 'dm'>('public');

  // --- Public Forum States ---
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [publicSearchQuery, setPublicSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [msgCategory, setMsgCategory] = useState<'tugas' | 'mapel' | 'diskusi' | 'santai'>('diskusi');
  const [modAnnouncementText, setModAnnouncementText] = useState('');
  const [showModAnnounceForm, setShowModAnnounceForm] = useState(false);

  // --- Direct Message (DM) States ---
  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(otherUsers[0]?.id || '');
  const [dmSearchQuery, setDmSearchQuery] = useState('');
  const [dmRoleFilter, setDmRoleFilter] = useState<'all' | UserRole>('all');
  const [dmInputText, setDmInputText] = useState('');

  const activeRecipient = users.find(u => u.id === selectedRecipientId) || otherUsers[0];

  // Auto scroll to bottom
  const publicMessagesEndRef = useRef<HTMLDivElement>(null);
  const dmMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    publicMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  useEffect(() => {
    dmMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [directMessages, selectedRecipientId, activeTab]);

  // Send Public Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(inputText.trim(), msgCategory);
    setInputText('');
  };

  // Send Moderator Announcement
  const handleSendModeratorAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modAnnouncementText.trim()) return;

    sendModeratorAnnouncement(modAnnouncementText.trim());
    setModAnnouncementText('');
    setShowModAnnounceForm(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    const reason = window.prompt(
      'Alasan moderasi/penghapusan pesan (opsional):',
      'Melanggar etika diskusi belajar'
    );
    deleteChatMessage(messageId, reason || undefined);
  };

  // Send Direct Message (1-on-1 DM)
  const handleSendDM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dmInputText.trim() || !activeRecipient) return;

    sendDirectMessage(activeRecipient.id, activeRecipient.displayName, dmInputText.trim());
    setDmInputText('');
  };

  const handleDeleteDM = (messageId: string) => {
    if (window.confirm('Hapus pesan pribadi ini?')) {
      deleteDirectMessage(messageId);
    }
  };

  // Filter public messages
  const filteredPublicMessages = chatMessages.filter(msg => {
    const matchCategory =
      selectedCategory === 'all' ||
      msg.category === selectedCategory ||
      (selectedCategory === 'pengumuman' && msg.isAnnouncement);

    const matchSearch =
      !publicSearchQuery.trim() ||
      msg.content.toLowerCase().includes(publicSearchQuery.toLowerCase()) ||
      msg.senderName.toLowerCase().includes(publicSearchQuery.toLowerCase()) ||
      (msg.studentClass && msg.studentClass.toLowerCase().includes(publicSearchQuery.toLowerCase()));

    return matchCategory && matchSearch;
  });

  // Filter DM contacts
  const filteredContacts = otherUsers.filter(u => {
    const matchRole = dmRoleFilter === 'all' || u.role === dmRoleFilter;
    const q = dmSearchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.nipOrNis && u.nipOrNis.toLowerCase().includes(q));
    return matchRole && matchQuery;
  });

  // Filter 1-on-1 direct messages between currentUser and activeRecipient
  const conversationMessages = directMessages.filter(
    m =>
      (m.senderId === currentUser.id && m.recipientId === activeRecipient?.id) ||
      (m.senderId === activeRecipient?.id && m.recipientId === currentUser.id)
  );

  const activeStudentsCount = new Set(
    chatMessages.filter(m => m.senderRole === 'siswa').map(m => m.senderName)
  ).size;

  return (
    <div className="space-y-4">
      {/* Top Banner / Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-blue-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeTab === 'public'
                    ? (isAdmin ? 'Pantauan & Forum Obrolan Siswa' : 'Ruang Obrolan & Forum Diskusi Siswa')
                    : 'Pesan Langsung / Chat DM Pribadi Antar Profil'}
                </h1>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  SMK Mardi Yuana Cikembar
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeTab === 'public'
                  ? 'Tempat bertukar ide belajar, tugas kejuruan, dan diskusi antar siswa yang terpantau aman oleh tim sekolah'
                  : 'Kirim pesan 1-on-1 langsung per profil (Guru, Siswa, Admin TU, Kepala Sekolah) dengan enkripsi data cloud Firestore'}
              </p>
            </div>
          </div>

          {/* Tab Switcher & Quick Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-800/80 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('public')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  activeTab === 'public'
                    ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Forum Publik</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dm')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all relative ${
                  activeTab === 'dm'
                    ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Chat DM Pribadi</span>
                {directMessages.some(m => m.recipientId === currentUser.id) && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>
            </div>

            {isAdmin && activeTab === 'public' && (
              <button
                onClick={() => setShowModAnnounceForm(!showModAnnounceForm)}
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-colors"
              >
                <Megaphone className="h-3.5 w-3.5" />
                <span>Pemberitahuan Moderator</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: RUANG FORUM DISKUSI PUBLIK                        */}
      {/* ======================================================== */}
      {activeTab === 'public' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in">
          {/* Left: Category & Topic Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Kategori Topik</h2>
              <div className="space-y-1">
                {[
                  { id: 'all', label: 'Semua Diskusi', icon: MessageSquare },
                  { id: 'diskusi', label: 'Diskusi Umum', icon: Users },
                  { id: 'tugas', label: 'Tugas &amp; PR', icon: BookOpen },
                  { id: 'mapel', label: 'Materi Mapel', icon: GraduationCap },
                  { id: 'santai', label: 'Obrolan Santai', icon: Sparkles },
                ].map(cat => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  const count = cat.id === 'all'
                    ? chatMessages.length
                    : chatMessages.filter(m => m.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span dangerouslySetInnerHTML={{ __html: cat.label }} />
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Message Window */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[560px]">
            {/* Search in public chat */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-2">
              <Search className="h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Cari dalam diskusi forum..."
                value={publicSearchQuery}
                onChange={e => setPublicSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-white"
              />
            </div>

            {/* Chat List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {filteredPublicMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                  <MessageSquare className="h-10 w-10 stroke-1 mb-2 text-slate-300" />
                  <p className="text-xs font-bold">Belum ada obrolan dalam kategori ini</p>
                  <p className="text-[11px]">Jadilah yang pertama memulai diskusi belajar!</p>
                </div>
              ) : (
                filteredPublicMessages.map(msg => {
                  const isMine = msg.senderId === currentUser.id;
                  const roleStyle = roleBadgeStyles[msg.senderRole] || roleBadgeStyles.siswa;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 group animate-fade-in ${isMine ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300 shrink-0">
                        {msg.senderName.charAt(0)}
                      </div>

                      <div className={`max-w-[75%] space-y-1 ${isMine ? 'items-end text-right' : ''}`}>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold text-slate-900 dark:text-white">{msg.senderName}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${roleStyle.bg} ${roleStyle.text}`}>
                            {roleStyle.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`p-3 rounded-2xl text-xs break-words shadow-2xs ${
                            isMine
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-1 self-center transition-opacity"
                          title="Hapus pesan ini"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={publicMessagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Tulis pesan untuk forum siswa & kelas..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: CHAT DM PRIBADI PER PROFIL (1-ON-1 DIRECT)       */}
      {/* ======================================================== */}
      {activeTab === 'dm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-fade-in">
          {/* Left: Contact List (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[580px]">
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-600" />
                Daftar Kontak Pengguna
              </span>

              {/* Search contacts */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, role, NIP/NIS..."
                  value={dmSearchQuery}
                  onChange={e => setDmSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px] pb-1">
                {(['all', 'guru', 'siswa', 'admin', 'wali_kelas', 'kepala_sekolah'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDmRoleFilter(r)}
                    className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                      dmRoleFilter === r
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {r === 'all' ? 'Semua' : (roleBadgeStyles[r]?.label || r)}
                  </button>
                ))}
              </div>
            </div>

            {/* Contacts list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Tidak ada kontak yang cocok.
                </div>
              ) : (
                filteredContacts.map(u => {
                  const isSelected = u.id === selectedRecipientId;
                  const roleStyle = roleBadgeStyles[u.role] || roleBadgeStyles.siswa;
                  // Last message between currentUser and this user
                  const lastMsg = directMessages
                    .filter(
                      m =>
                        (m.senderId === currentUser.id && m.recipientId === u.id) ||
                        (m.senderId === u.id && m.recipientId === currentUser.id)
                    )
                    .slice(-1)[0];

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedRecipientId(u.id)}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-extrabold flex items-center justify-center text-sm">
                          {u.displayName.charAt(0)}
                        </div>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {u.displayName}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${roleStyle.bg} ${roleStyle.text} shrink-0`}>
                            {roleStyle.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg ? lastMsg.content : (u.nipOrNis ? `NIP/NIS: ${u.nipOrNis}` : u.email)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: 1-on-1 DM Chat Conversation Window (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[580px]">
            {activeRecipient ? (
              <>
                {/* Active Chat Header */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      {activeRecipient.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {activeRecipient.displayName}
                        </h2>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${roleBadgeStyles[activeRecipient.role]?.bg} ${roleBadgeStyles[activeRecipient.role]?.text}`}>
                          {roleBadgeStyles[activeRecipient.role]?.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Online &bull; {activeRecipient.email}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    Enkripsi Cloud Real-Time
                  </span>
                </div>

                {/* DM Messages History */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                  {conversationMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                      <Mail className="h-10 w-10 stroke-1 mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Belum ada riwayat percakapan dengan {activeRecipient.displayName}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Kirim pesan pribadi pertama Anda di bawah ini.
                      </p>
                    </div>
                  ) : (
                    conversationMessages.map(msg => {
                      const isMine = msg.senderId === currentUser.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 group animate-fade-in ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isMine && (
                            <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center shrink-0 self-end">
                              {msg.senderName.charAt(0)}
                            </div>
                          )}

                          <div className={`max-w-[70%] space-y-0.5 ${isMine ? 'items-end' : ''}`}>
                            <div
                              className={`p-3 rounded-2xl text-xs break-words shadow-2xs ${
                                isMine
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className={`flex items-center gap-1.5 text-[9px] text-slate-400 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMine && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDM(msg.id)}
                                  className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition-opacity ml-1"
                                  title="Hapus pesan"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={dmMessagesEndRef} />
                </div>

                {/* Quick Emoji Strip */}
                <div className="px-3 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Emoji:</span>
                  {quickEmojis.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setDmInputText(prev => prev + em)}
                      className="hover:scale-125 transition-transform text-xs p-0.5"
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* DM Input Bar */}
                <form
                  onSubmit={handleSendDM}
                  className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={dmInputText}
                    onChange={e => setDmInputText(e.target.value)}
                    placeholder={`Ketik pesan pribadi untuk ${activeRecipient.displayName}...`}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={!dmInputText.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim DM</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
                <Users className="h-12 w-12 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Pilih Kontak untuk Memulai DM</p>
                <p className="text-xs text-slate-500 mt-1">Pilih pengguna dari daftar di sebelah kiri.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
