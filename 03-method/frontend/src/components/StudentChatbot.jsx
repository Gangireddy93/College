import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Search,
  MapPin,
  Calendar,
  AlertTriangle,
  BookOpen,
  Briefcase,
  Trophy,
  PhoneCall,
  Clock,
  ShieldCheck,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { api } from "../api";

export default function StudentChatbot({
  collegeSettings,
  onSearchTicket,
  onNavigateTab,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      time: "Just now",
      text: `Hello! 👋 I am your **Examination & Campus AI Assistant** for ${collegeSettings?.collegeName || "Gates Institute of Technology"}. How can I assist you today?`,
      chips: [
        "Where is my exam seat?",
        "Examination timings & shifts",
        "Prohibited items in exam hall",
        "Download semester study notes",
        "Campus placement drives",
        "Exam helpline number",
      ],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Intelligent automated answers
  const generateResponse = async (userText) => {
    const text = userText.toLowerCase().trim();

    // 1. Hall Ticket / Seat Search pattern (e.g. HT2026CSE001 or "seat" + ticket)
    const ticketMatch = userText.match(/HT\d{4}[A-Za-z]+\d{3}/i) || userText.match(/HT\d+/i);
    if (ticketMatch || text.includes("my seat") || text.includes("hall ticket") || text.includes("where is")) {
      const ticket = ticketMatch ? ticketMatch[0].toUpperCase() : null;
      if (ticket) {
        try {
          const res = await api.searchStudent(ticket);
          if (res.success && res.student) {
            const s = res.student;
            const roomNum = s.roomNumber || s.room?.roomNumber || "Unassigned";
            const block = s.block || s.room?.block || "A Block";
            const floor = s.floor || s.room?.floor || "Ground Floor";
            const seatNum = s.seatNumber ? `#${s.seatNumber}` : "Allocated Desk";
            const bench = s.benchNumber || "B01";
            const row = s.rowNumber ? `Row ${s.rowNumber}` : "Row 1";
            const col = s.columnNumber ? `Column ${s.columnNumber}` : "Col 1";

            return {
              text: `🎯 **Seat Allocation Found for ${s.studentName}!**\n\n` +
                `• **Hall Ticket:** \`${s.hallTicketNumber}\`\n` +
                `• **Academic Year:** ${s.academicYear} • ${s.branch}\n` +
                `• **Examination Room:** **Room ${roomNum}** (${block}, ${floor})\n` +
                `• **Seat Location:** **${seatNum}** (${row}, ${col}, Bench ${bench})\n` +
                `• **Session:** ${s.examSession || "FN (10:00 AM - 01:00 PM)"}\n\n` +
                `*Anti-Cheat Verified: Seating is mapped column-wise with alternating branch neighbors.*`,
              actionTicket: s.hallTicketNumber,
            };
          } else {
            return {
              text: `⚠️ I could not find a candidate record for hall ticket \`${ticket}\`. Please double check the number or contact the examination controller desk.`,
            };
          }
        } catch {
          return {
            text: `⚠️ No active allocation found for \`${ticket}\`. Please ensure student records have been uploaded by the exam cell.`,
          };
        }
      } else {
        return {
          text: `🔍 To look up your exact room, bench, and row/column, please type your **Hall Ticket Number** (e.g. \`HT2026CSE001\` or \`HT2026AI015\`).`,
          chips: ["HT2026CSE001", "HT2026AI001", "HT2026ECE001", "HT2026EEE001"],
        };
      }
    }

    // 2. Exam Timings
    if (text.includes("time") || text.includes("shift") || text.includes("timing") || text.includes("schedule")) {
      return {
        text: `⏰ **Official Autonomous Examination Timings:**\n\n` +
          `• **Forenoon (FN) Session:** 10:00 AM – 01:00 PM\n` +
          `  *(Reporting time: 09:30 AM. Hall gates close at 09:45 AM)*\n\n` +
          `• **Afternoon (AN) Session:** 02:00 PM – 05:00 PM\n` +
          `  *(Reporting time: 01:30 PM. Hall gates close at 01:45 AM)*\n\n` +
          `Candidates will not be allowed inside after 15 minutes of exam start time.`,
        chips: ["Prohibited items in exam hall", "Where is my exam seat?", "Exam helpline number"],
      };
    }

    // 3. Prohibited Items / Malpractice
    if (text.includes("prohibit") || text.includes("phone") || text.includes("watch") || text.includes("cheat") || text.includes("rule")) {
      return {
        text: `🚫 **Strictly Prohibited Items in Examination Halls:**\n\n` +
          `❌ Mobile phones, pagers, and wireless earphones.\n` +
          `❌ Smartwatches, fitness trackers, and digital bands.\n` +
          `❌ Programmable calculators, flash drives, loose chits, or bags.\n\n` +
          `✅ **Permitted:** Printed Hall Ticket, Original College ID, blue/black ball pens, and transparent water bottles.\n\n` +
          `⚠️ *Notice: Any unauthorized electronic device found will be confiscated, and the candidate will face immediate disciplinary action by the Malpractice Enquiry Committee.*`,
        chips: ["Examination timings & shifts", "Where is my exam seat?"],
      };
    }

    // 4. Study Materials
    if (text.includes("material") || text.includes("notes") || text.includes("book") || text.includes("syllabus") || text.includes("paper") || text.includes("pyq") || text.includes("sem")) {
      return {
        text: `📚 **Semester Study Materials Hub (All 8 Semesters Available):**\n\n` +
          `We provide curated lecture notes, question banks, previous 5 years university question papers (PYQs), and laboratory manuals for:\n` +
          `• **1st Year:** Semesters 1 & 2\n` +
          `• **2nd Year:** Semesters 3 & 4\n` +
          `• **3rd Year:** Semesters 5 & 6\n` +
          `• **4th Year:** Semesters 7 & 8\n\n` +
          `You can switch to the **"Study Materials"** tab above to download PDF notes directly!`,
        actionTab: "materials",
        chips: ["1st Year Notes", "2nd Year Notes", "3rd Year Notes", "4th Year Notes"],
      };
    }

    // 5. Placements
    if (text.includes("placement") || text.includes("job") || text.includes("package") || text.includes("salary") || text.includes("company") || text.includes("recruit")) {
      return {
        text: `💼 **Campus Placement Highlights:**\n\n` +
          `• **Highest Package:** ₹44.5 LPA (Amazon / Microsoft)\n` +
          `• **Average Package:** ₹8.4 LPA\n` +
          `• **Placement Rate:** 95.2% (1,420+ Offers)\n` +
          `• **Top Recruiters:** Google, Microsoft, Amazon, TCS Digital, Infosys, Deloitte, Qualcomm, L&T.\n\n` +
          `Check out the **"Campus Life"** tab to see active on-campus placement drives and eligibility criteria!`,
        actionTab: "campus",
        chips: ["Active placement drives", "Campus clubs", "Sports schedule"],
      };
    }

    // 6. Sports & Clubs
    if (text.includes("sport") || text.includes("club") || text.includes("cricket") || text.includes("event") || text.includes("fest")) {
      return {
        text: `🏆 **Campus Sports & Student Societies:**\n\n` +
          `• **Upcoming:** Inter-Department Cricket Premier League (CPL 2026), Basketball State Meet.\n` +
          `• **Active Clubs:** Google Developer Student Club (GDSC), Robotics & IoT Society, TARANG Cultural Society, NSS.\n` +
          `• **Facilities:** Floodlit synthetic courts, 400m athletic track, indoor badminton arena.\n\n` +
          `Explore the **"Campus Life"** tab for full events schedule and photo gallery!`,
        actionTab: "campus",
        chips: ["Download semester study notes", "Where is my exam seat?"],
      };
    }

    // 7. Helpline
    if (text.includes("help") || text.includes("contact") || text.includes("phone") || text.includes("superintendent") || text.includes("controller")) {
      return {
        text: `📞 **Examination Control Room & Helplines:**\n\n` +
          `• **Chief Superintendent:** Dr. P. Ramesh Kumar, Ph.D.\n` +
          `• **Examination Cell:** Block A, 1st Floor, Room 108\n` +
          `• **Helpline Phone:** ${collegeSettings?.helplinePhone || "+91 8554 222333"}\n` +
          `• **Official Email:** ${collegeSettings?.helplineEmail || "exams@college.edu"}\n` +
          `• **Working Hours:** 08:30 AM – 05:30 PM (All Exam Days)`,
        chips: ["Where is my exam seat?", "Examination timings & shifts"],
      };
    }

    // Default Fallback
    return {
      text: `Thank you for your question! I can help you with:\n\n` +
        `• 🔍 **Hall Ticket & Seat Search** (type \`HT2026CSE001\` or your roll number)\n` +
        `• ⏰ **Shift Timings & Exam Sessions**\n` +
        `• 🚫 **Prohibited Items & Malpractice Protocols**\n` +
        `• 📚 **8 Semesters Study Materials & Notes**\n` +
        `• 💼 **Placements, Sports & Campus Life**\n` +
        `• 📞 **Controller of Exams Helplines**`,
      chips: ["Where is my exam seat?", "Examination timings & shifts", "Download semester study notes"],
    };
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      time: "Just now",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(async () => {
      const response = await generateResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        time: "Just now",
        text: response.text,
        chips: response.chips,
        actionTicket: response.actionTicket,
        actionTab: response.actionTab,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white/20 group cursor-pointer"
          title="Open Student Help AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-black tracking-wide block">Student AI Help</span>
            <span className="text-[10px] text-blue-100 font-medium block">Ask seat, notes & rules</span>
          </div>
        </button>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? "w-80 h-16"
              : "w-96 sm:w-[420px] h-[580px] max-h-[85vh]"
          }`}
        >
          {/* Chat Header */}
          <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-purple-800 p-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
                <Bot className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight leading-none">
                    Exam & Campus AI Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-blue-100 font-medium truncate max-w-[200px] mt-0.5">
                  {collegeSettings?.shortName || "Gates Tech"} • Student Helpline
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Minimized bar */}
          {isMinimized ? null : (
            <>
              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${
                      msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-linear-to-br from-indigo-500 to-purple-600 text-white"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 shadow-xs space-y-2 ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">
                        {msg.text}
                      </div>

                      {/* Interactive Action for Hall Ticket Search */}
                      {msg.actionTicket && onSearchTicket && (
                        <button
                          onClick={() => onSearchTicket(msg.actionTicket)}
                          className="mt-2 w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 flex items-center justify-center gap-1.5 transition-all text-[11px]"
                        >
                          <Search className="w-3.5 h-3.5" />
                          <span>View Full Hall Ticket & Floor Map</span>
                        </button>
                      )}

                      {/* Interactive Action for Tab Navigation */}
                      {msg.actionTab && onNavigateTab && (
                        <button
                          onClick={() => onNavigateTab(msg.actionTab)}
                          className="mt-2 w-full py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 flex items-center justify-center gap-1.5 transition-all text-[11px]"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Open {msg.actionTab === "materials" ? "Study Materials" : "Campus Life"}</span>
                        </button>
                      )}

                      {/* Suggested Chips */}
                      {msg.chips && msg.chips.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {msg.chips.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(chip)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-semibold text-[10px] border border-slate-200 transition-colors"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2.5 items-center text-slate-400 text-xs italic">
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 animate-bounce" />
                    </div>
                    <span className="flex items-center gap-1">
                      Assistant is thinking
                      <span className="inline-block animate-pulse">...</span>
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask seat (HT2026CSE001), rules, notes..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-colors shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
