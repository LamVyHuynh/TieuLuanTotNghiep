import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // 🚀 BƯỚC 1: Import thêm cái này để bọc ChatBox
import axiosClient from "../api/axiosClient";
import { MessageCircle, X, Send, Bot, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ChatBox() {
  const [isOpen, setIsOpen] = useState(true); // Mặc định mở chatbox khi load trang
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Chào bạn! Mình là HealthyBot 🌱. Bạn cần tư vấn thực đơn giảm cân, ăn uống Eat-clean hay tìm sản phẩm nào hôm nay?",
      products: [],
    },
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await axiosClient.post("/chatbox/chat", {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.data.reply,
          products: res.data.products,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi, kết nối đang bị gián đoạn. Bạn thử lại sau vài phút nhé! 😥",
          products: [],
        },
        error,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 BƯỚC 2: Bọc toàn bộ giao diện trong createPortal( ..., document.body )
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_5px_40px_rgba(0,0,0,0.16)] border border-slate-100 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center justify-between bg-emerald-600 px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold">HealthyBot Tư Vấn</h3>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-green-300"></span>{" "}
                  Đang hoạt động
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-100 hover:text-white transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
            {messages.map((msg, index) => (
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
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/detail-product/${p.id_product}`);
                        }}
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
                              p.discount_price > 0 ? p.discount_price : p.price,
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

          <div className="bg-white p-3 border-t border-slate-100">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi món healthy, thực đơn..."
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 text-slate-700"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700 active:scale-95 cursor-pointer"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>,
    document.body, // Bắn code HTML ra thẳng body
  );
}

export default ChatBox;
