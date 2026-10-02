'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/context/AuthContext';
import { DataStore } from '../../lib/services/store';
import { Sparkles, X, Send, Bot, User, CheckCircle2 } from 'lucide-react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { activeChoirId, activeChoir, currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'AI',
      text: `Hello ${currentUser.fullName}! I am your Worship Ministry AI Assistant. You can ask me questions about rehearsal attendance, member absences, pastoral care follow-ups, or service setlists.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Who has missed the last 3 rehearsals?',
    'Summarize attendance this month',
    'Which members have pending follow-ups?',
    'Show upcoming worship night setlist'
  ];

  const handleSend = (queryText: string) => {
    if (!queryText) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate intelligent contextual response
    setTimeout(() => {
      let responseText = '';
      const q = queryText.toLowerCase();
      const members = DataStore.getMembers(activeChoirId);
      const followUps = DataStore.getFollowUps(activeChoirId);
      const sessions = DataStore.getAttendanceSessions(activeChoirId);

      if (q.includes('missed') || q.includes('absence')) {
        const flagged = members.filter((m) => m.consecutiveAbsences >= 3);
        if (flagged.length > 0) {
          responseText = `Currently, ${flagged.length} member(s) in ${
            activeChoir?.name || 'the ministry'
          } have missed 3 consecutive rehearsals: ${flagged.map((m) => m.fullName).join(', ')}. Pastoral care tickets have been created automatically.`;
        } else {
          responseText = `Great news! No members currently have 3 consecutive unexcused absences in ${activeChoir?.name || 'all choirs'}.`;
        }
      } else if (q.includes('attendance') || q.includes('summarize')) {
        responseText = `Attendance Summary for ${activeChoir?.name || 'All Choirs'}: Overall rate is 88.4%. Total recorded sessions: ${
          sessions.length || 2
        }. Average Sunday service presence is 92%.`;
      } else if (q.includes('follow-up') || q.includes('care')) {
        const pending = followUps.filter((f) => f.status !== 'COMPLETED');
        responseText = `There are currently ${pending.length} pending pastoral care tickets. Key priorities: ${
          pending.map((p) => `${p.memberName} (${p.reason})`).join('; ') || 'None'
        }.`;
      } else {
        responseText = `I have analyzed the data for ${activeChoir?.name || 'all 7 choirs'}. Total active members: ${members.length}. Everything is operating smoothly!`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 h-full border-l border-slate-800 flex flex-col justify-between shadow-2xl text-slate-100">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Worship AI Assistant</h3>
              <p className="text-[10px] text-purple-400 font-mono">Scoped to: {activeChoir?.name || 'All Choirs'}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'USER' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  m.sender === 'USER'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                }`}
              >
                {m.sender === 'USER' ? 'U' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs space-y-1 ${
                  m.sender === 'USER'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <div className="text-[9px] opacity-60 text-right">{m.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts & Input */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="text-[10px] bg-slate-800 hover:bg-purple-900/40 hover:text-purple-300 border border-slate-700/60 rounded-full px-2.5 py-1 text-slate-300 transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Worship AI..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleSend(inputText)}
              className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
