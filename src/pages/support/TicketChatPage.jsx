import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Send, ArrowLeft, User, Clock, CheckCircle2, 
  XCircle, AlertTriangle, ShieldCheck, Mail, Phone,
  Paperclip, Info
} from 'lucide-react';
import { supportApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function TicketChatPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-ticket', ticketId],
    queryFn: () => supportApi.getById(ticketId).then(r => r.data.data),
  });

  const replyMut = useMutation({
    mutationFn: (message) => supportApi.reply(ticketId, message),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      setReplyText('');
    },
    onError: () => toast.error('Failed to send reply')
  });

  const updateMut = useMutation({
    mutationFn: (data) => supportApi.updateStatus(ticketId, data.status).then(() => {
        if(data.priority) return supportApi.updatePriority(ticketId, data.priority);
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['support-ticket', ticketId] });
      qc.invalidateQueries({ queryKey: ['support-tickets'] });
      toast.success('Ticket updated');
    },
  });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  if (isLoading) return <div className="py-32 flex justify-center"><LoadingSpinner /></div>;
  if (!ticket) return <div className="py-32 text-center text-slate-400">Ticket not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <PageHeader
        title={`Ticket #${ticket.id.slice(0, 6)}`}
        subtitle={ticket.subject}
        breadcrumbs={[{ label: 'Support', to: '/support' }, { label: 'Chat' }]}
        action={
          <button onClick={() => navigate('/support')} className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to List
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chat Thread */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Action Bar */}
          <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
                <select 
                  value={ticket.status}
                  onChange={(e) => updateMut.mutate({ status: e.target.value })}
                  className="bg-transparent text-[10px] font-black uppercase tracking-tighter text-blue-600 focus:outline-none cursor-pointer"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Priority:</span>
                <select 
                  value={ticket.priority}
                  onChange={(e) => updateMut.mutate({ priority: e.target.value })}
                  className="bg-transparent text-[10px] font-black uppercase tracking-tighter text-emerald-600 focus:outline-none cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={ticket.status} />
              <StatusBadge status={ticket.priority} />
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/10">
            {ticket.messages.map((msg, idx) => {
              const isAdmin = msg.senderType === 'admin';
              return (
                <div key={msg.id} className={`flex gap-4 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isAdmin ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100 text-slate-400'
                  }`}>
                    {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`space-y-1.5 max-w-[70%] ${isAdmin ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-3 px-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isAdmin ? 'Admin Support' : `${ticket.member?.firstName} ${ticket.member?.lastName}`}
                      </p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`p-4 rounded-3xl text-sm font-medium leading-relaxed ${
                      isAdmin 
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-lg shadow-blue-500/10' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-slate-50">
            <div className="relative flex items-center">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the member..."
                className="w-full h-14 pl-6 pr-32 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyText.trim() && !replyMut.isPending) {
                    replyMut.mutate(replyText.trim());
                  }
                }}
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button className="p-3 text-slate-300 hover:text-slate-500 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => { if(replyText.trim()) replyMut.mutate(replyText.trim()); }}
                  disabled={!replyText.trim() || replyMut.isPending}
                  className="h-10 px-6 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30"
                >
                  Send Reply <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Member Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-2xl font-black text-blue-600 mb-4">
                {ticket.member?.firstName?.[0]}{ticket.member?.lastName?.[0]}
              </div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{ticket.member?.firstName} {ticket.member?.lastName}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Member ID: #{ticket.member?.id.slice(0, 8)}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-xs font-bold text-slate-700">{ticket.member?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Opened At</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group">
            <Info className="w-12 h-12 absolute -right-2 -bottom-2 text-white/10 group-hover:scale-110 transition-transform" />
            <h5 className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Support Tip</h5>
            <p className="text-xs font-bold leading-relaxed">
              Always maintain a professional tone and ensure the member feels heard before resolving the ticket.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
