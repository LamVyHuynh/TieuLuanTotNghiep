import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import axiosClient from "../api/axiosClient";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  ChevronRight,
  Trash2,
  Menu,
  ArrowLeft,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const defaultMessage = {
  sender: "bot",
  text: "Chào bạn! Mình là HealthyBot 🌱. Bạn cần tư vấn thực đơn giảm cân, ăn uống Eat-clean hay tìm sản phẩm nào hôm nay?",
  products: [],
};

const createNewSession = () => ({
  id: Date.now().toString(),
  title: "Tư vấn mới",
  messages: [defaultMessage],
  updatedAt: Date.now(),
});

function ChatBox() {
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [sessions, setSessions] = useState(() => {
    const savedData = localStorage.getItem("healthygo_chat_sessions");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.length > 0 && parsed[0].id && parsed[0].messages) {
        return parsed;
      } else {
        return [
          {
            id: Date.now().toString(),
            title: "Cuộc trò chuyện cũ",
            messages: parsed,
            updatedAt: Date.now(),
          },
        ];
      }
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id);
  const [showHistory, setShowHistory] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Dùng useMemo để bọc activeSession và currentMessages lại cho chuẩn hiệu năng
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  const currentMessages = useMemo(() => {
    return activeSession ? activeSession.messages : [];
  }, [activeSession]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!showHistory) scrollToBottom();
  }, [currentMessages, showHistory]);

  useEffect(() => {
    localStorage.setItem("healthygo_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const updateActiveSession = (newMessages, newTitle = null) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: newMessages,
            title: newTitle || s.title,
            updatedAt: Date.now(),
          };
        }
        return s;
      }),
    );
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const isFirstUserMessage = currentMessages.length === 1;

    const newTitle = isFirstUserMessage
      ? userMessage.length > 20
        ? userMessage.slice(0, 20) + "..."
        : userMessage
      : null;

    const newMessages = [
      ...currentMessages,
      { sender: "user", text: userMessage },
    ];
    updateActiveSession(newMessages, newTitle);

    setInput("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await axiosClient.post("/chatbox/chat", {
        message: userMessage,
      });

      updateActiveSession([
        ...newMessages,
        {
          sender: "bot",
          text: res.data.reply,
          products: res.data.products,
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi chat với Bot:", error);

      updateActiveSession([
        ...newMessages,
        {
          sender: "bot",
          text: "Xin lỗi, kết nối đang bị gián đoạn. Bạn thử lại sau vài phút nhé! 😥",
          products: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewChat = () => {
    const newChat = createNewSession();
    setSessions((prev) => [newChat, ...prev]);
    setActiveSessionId(newChat.id);
    setShowHistory(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      const filtered = sessions.filter((s) => s.id !== deleteTarget);
      if (filtered.length === 0) {
        const newChat = createNewSession();
        setSessions([newChat]);
        setActiveSessionId(newChat.id);
      } else {
        setSessions(filtered);
        if (activeSessionId === deleteTarget) {
          setActiveSessionId(filtered[0].id);
        }
      }
      setDeleteTarget(null);
    }
  };

  const handleCloseAndNavigate = (path) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      if (path) navigate(path);
    }, 400);
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div
          className={`mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_5px_40px_rgba(0,0,0,0.16)] border border-slate-100 transform transition-all duration-500 ease-in-out relative ${
            isClosing
              ? "translate-y-12 opacity-0"
              : "animate-in slide-in-from-bottom-5 fade-in"
          }`}
        >
          {/* HEADER CHATBOX */}
          <div className="flex items-center justify-between bg-emerald-600 px-4 py-3.5 text-white shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              {showHistory ? (
                <button
                  onClick={() => setShowHistory(false)}
                  className="hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setShowHistory(true)}
                  title="Lịch sử trò chuyện"
                  className="hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
                >
                  <Menu size={18} />
                </button>
              )}
              <div className="truncate flex-1">
                <h3 className="text-sm font-bold truncate">
                  {showHistory ? "Lịch sử tư vấn" : activeSession?.title}
                </h3>
                {!showHistory && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-100">
                    <span className="h-2 w-2 rounded-full bg-green-300"></span>{" "}
                    Đang hoạt động
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {showHistory ? (
                <button
                  onClick={handleCreateNewChat}
                  title="Tạo mới"
                  className="hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
                >
                  <Plus size={20} />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setDeleteTarget(activeSessionId)}
                    title="Xóa cuộc trò chuyện này"
                    className="hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => handleCloseAndNavigate(null)}
                    className="hover:bg-white/20 p-1.5 rounded-full transition cursor-pointer ml-1"
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* MÀN HÌNH LỊCH SỬ CHAT */}
          {showHistory ? (
            <div className="flex-1 overflow-y-auto bg-slate-50 p-2 scrollbar-thin scrollbar-thumb-slate-200">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setShowHistory(false);
                  }}
                  className={`flex items-center justify-between p-3 mb-2 rounded-xl cursor-pointer transition-all border ${
                    session.id === activeSessionId
                      ? "bg-white border-emerald-500 shadow-sm"
                      : "bg-white border-transparent hover:border-emerald-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MessageCircle size={18} />
                    </div>
                    <div className="truncate flex-1 pr-2">
                      <h4
                        className={`text-sm font-bold truncate ${session.id === activeSessionId ? "text-emerald-700" : "text-slate-700"}`}
                      >
                        {session.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(session.updatedAt).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTarget(session.id);
                    }}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* KHUNG CHAT BÌNH THƯỜNG */
            <>
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
                {currentMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender === "user"
                          ? "bg-emerald-600 text-white rounded-tr-sm"
                          : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm whitespace-pre-line"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {msg.products && msg.products.length > 0 && (
                      <div className="mt-2 w-[85%] flex flex-col gap-2">
                        {msg.products.map((p) => (
                          <div
                            key={p.id_product}
                            onClick={() =>
                              handleCloseAndNavigate(
                                `/detail-product/${p.id_product}`,
                              )
                            }
                            className="group flex items-center gap-3 p-2 bg-white rounded-xl border border-emerald-100 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
                          >
                            <img
                              src={
                                p.image_url ||
                                "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"
                              }
                              alt={p.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-50"
                            />
                            <div className="flex-1">
                              <h4 className="text-[13px] font-bold text-slate-700 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                                {p.name}
                              </h4>
                              <span className="text-[12px] font-black text-emerald-600">
                                {Number(
                                  p.discount_price > 0
                                    ? p.discount_price
                                    : p.price,
                                ).toLocaleString("vi-VN")}
                                đ
                              </span>
                            </div>
                            <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                              <ChevronRight size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100 flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]"></div>
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white p-3 border-t border-slate-100 shrink-0">
                <form
                  onSubmit={handleSend}
                  className="flex items-end gap-2 rounded-3xl bg-slate-100 px-2 py-1.5"
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Hỏi món healthy, thực đơn..."
                    rows={1}
                    disabled={isLoading}
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 text-slate-700 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 min-h-[36px]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-9 w-9 mb-0.5 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send size={16} className="-ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}

          {/* MODAL XÁC NHẬN XÓA CỰC XỊN */}
          {deleteTarget && (
            <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-[20px] w-full p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 border-4 border-rose-100">
                  <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <h4 className="font-black text-slate-800 text-lg mb-2">
                  Xóa đoạn chat này?
                </h4>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Lịch sử tư vấn của đoạn chat này sẽ bị xóa vĩnh viễn và không
                  thể khôi phục.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 py-3 rounded-xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-500/30 transition cursor-pointer"
                  >
                    Xóa luôn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (isOpen) {
            handleCloseAndNavigate(null);
          } else {
            setIsOpen(true);
          }
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl transition hover:scale-105 hover:bg-emerald-700 active:scale-95 cursor-pointer border-2 border-white/20"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>,
    document.body,
  );
}

export default ChatBox;
