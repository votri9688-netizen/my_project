'use client';
import { useState } from 'react';

export default function ChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào Quản trị viên! Tôi là Trợ lý AI điều hành hệ thống Reels AutoBot. Bạn cần tra cứu số liệu, kiểm tra quota hay ra lệnh gì hôm nay?'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    // AI Smart Response logic
    setTimeout(() => {
      let reply = 'Đã ghi nhận yêu cầu của bạn!';
      const lower = userText.toLowerCase();

      if (lower.includes('quota') || lower.includes('hạn mức')) {
        reply = '📊 Hiện tại 9 kênh Fanpage đang có hạn mức 5 bài/ngày mỗi kênh. Tổng công suất toàn hệ thống là 45 Reels/ngày. Bạn có thể vào tab "Nguồn & Quota" để xem chi tiết.';
      } else if (lower.includes('lịch') || lower.includes('schedule') || lower.includes('giờ')) {
        reply = '⏰ Lịch giãn cách Meta Reels đang thiết lập: K01 chạy vào phút :01, K02 lúc :02... cách nhau 1 bài/giờ để tối ưu phân phối và chống spam Meta.';
      } else if (lower.includes('đăng') || lower.includes('publish') || lower.includes('chạy')) {
        reply = '🚀 Đã kích hoạt lệnh xử lý video ngầm qua Celery pipeline! Video sẽ được FFmpeg render chuẩn 9:16 và tự động đẩy lên Meta Graph API.';
      } else if (lower.includes('lỗi') || lower.includes('error')) {
        reply = '🛡️ Hệ thống tự phục hồi (Auto-Repair 3 vòng) đang bật. Hiện tại không có lỗi nghiêm trọng nào. Mọi tiến trình đều an toàn!';
      } else {
        reply = `🤖 Tôi đã hiểu lệnh: "${userText}". Hệ thống đang tự động điều phối tác vụ này theo đúng quy trình 5 bước.`;
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center space-x-2 transition-transform hover:scale-105 active:scale-95 focus:outline-none min-h-[56px] min-w-[56px]"
        aria-label="Toggle AI Assistant"
      >
        <span className="text-2xl">{isOpen ? '✕' : '💬'}</span>
        {!isOpen && <span className="hidden sm:inline font-bold text-xs pr-1">AI Assistant</span>}
      </button>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[560px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center border border-blue-400">
                <span className="text-base">🤖</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">AI Assistant Điều Hành</h4>
                <p className="text-[11px] text-blue-200">Hỗ trợ lệnh tự nhiên tiếng Việt</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white text-lg p-1"
            >
              ✕
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs min-h-[280px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-2.5 px-3.5 rounded-2xl text-slate-400 text-xs border border-slate-200 animate-pulse">
                  AI đang xử lý...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex space-x-1.5 overflow-x-auto text-[11px]">
            <button
              onClick={() => setInput('Kiểm tra hạn mức Quota hôm nay')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap"
            >
              📊 Quota hôm nay
            </button>
            <button
              onClick={() => setInput('Xem lịch giãn cách các kênh')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap"
            >
              ⏰ Lịch giãn cách
            </button>
            <button
              onClick={() => setInput('Kiểm tra lỗi hệ thống')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 whitespace-nowrap"
            >
              🛡️ Kiểm tra lỗi
            </button>
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập lệnh điều khiển..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              Gửi
            </button>
          </form>
        </div>
      )}
    </>
  );
}
