"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageText, Send2, CloseCircle, ArrowRight } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

interface RecommendationItem {
  name: string;
  price: number;
  cal: number;
  link: string;
}

interface Message {
  sender: "bot" | "user";
  text: string;
  options?: { label: string; action: string }[];
  recommendations?: RecommendationItem[];
}

// Define random generator outside the component to keep it pure
function getRandomNumber(min: number, range: number): number {
  return Math.floor(Math.random() * range) + min;
}

function FoodieRobotLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="12 8 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chef Hat */}
      <path d="M18 18C18 13 22 10 26 10C28 10 30 11 32 12C34 11 36 10 38 10C42 10 46 13 46 18C46 22 42 24 38 24H26C22 24 18 22 18 18Z" fill="#FFF5EB" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="21" y="22" width="22" height="2.5" fill="#dfa67b" rx="1" />

      {/* Robot Head */}
      <rect x="16" y="27" width="32" height="25" rx="5" fill="#475569" stroke="#1E293B" strokeWidth="2.5" />

      {/* Antennas */}
      <circle cx="16" cy="38" r="3" fill="#FF6B35" stroke="#1E293B" strokeWidth="1.5" />
      <circle cx="48" cy="38" r="3" fill="#FF6B35" stroke="#1E293B" strokeWidth="1.5" />

      {/* Burger Eyes! */}
      {/* Left Burger Eye */}
      <path d="M21 36C21 34.5 22.5 33.5 24 33.5C25.5 33.5 27 34.5 27 36H21Z" fill="#F59E0B" />
      <rect x="20" y="37" width="8" height="1.5" rx="0.5" fill="#EF4444" />
      <path d="M21 39.5C21 40.5 22.5 41 24 41C25.5 41 27 40.5 27 39.5H21Z" fill="#F59E0B" />

      {/* Right Burger Eye */}
      <path d="M37 36C37 34.5 38.5 33.5 40 33.5C41.5 33.5 43 34.5 43 36H37Z" fill="#F59E0B" />
      <rect x="36" y="37" width="8" height="1.5" rx="0.5" fill="#EF4444" />
      <path d="M37 39.5C37 40.5 38.5 41 40 41C41.5 41 43 40.5 43 39.5H37Z" fill="#F59E0B" />

      {/* Hungry mouth / tongue sticking out */}
      <path d="M26 44C26 44 28 47.5 32 47.5C36 47.5 38 44 38 44H26Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1.5" />
      <path d="M31 45.5C31 45.5 31.5 48.5 33.5 48C34.5 47.5 34.5 45.5 34.5 45.5H31Z" fill="#EF4444" />
    </svg>
  );
}

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Arey bhai bhai bhai! Main hoon Bhukkad Robot (Buddy AI)! 🤖🍔\nMera dimaag toh lohe ka hai par dil ekdum foodie hai! 🤤\nPet me chhoohe kud rahe hain? Batao aaj kya lapetna  hai boss?",
      options: [
        { label: "Badi Bhookh Lagi Hai! 😋", action: "mood" },
        { label: "Diet Plan (Swap Magic) 🥗", action: "health" },
        { label: "Mera Garam Khana Kab Aayega? 🚗", action: "delivery" },
        { label: "City Specialties Khana Hai ⭐", action: "city" },
      ],
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleOptionClick = (action: string) => {
    let botReplyText = "";
    let botOptions: { label: string; action: string }[] | undefined = undefined;
    let botRecs: { name: string; price: number; cal: number; link: string }[] | undefined = undefined;

    if (action === "mood") {
      botReplyText = "Kaisa feel kar rahe ho aaj? Jaldi batao taaki tumhare mood ke hisab se mast khana suggest karu, mujhse khud control nahi ho raha! 🤤";
      botOptions = [
        { label: "Stressed hoon yaar 😫", action: "mood_stressed" },
        { label: "Ekdum aalsi feel ho rha 😴", action: "mood_lazy" },
        { label: "Boht khush hoon aaj! 🎉", action: "mood_happy" },
        { label: "Diet/Fit rehna hai thoda 🥦", action: "mood_healthy" },
      ];
    } else if (action === "mood_stressed") {
      botReplyText = "Uff, stressed out? 😫 Arey tension chhodo, cheese dabo! Dimaag ki batti jalane ke liye humare pass cheesiest and spiciest therapy hai! Ye try karo:";
      botRecs = [
        { name: "Cheese Blast Margherita Pizza", price: 28000, cal: 830, link: "/menu?category=street-food" },
        { name: "Spicy Tandoori Cheeseburger", price: 12900, cal: 410, link: "/menu?category=burgers" },
        { name: "Spiced Aloo Tikki", price: 4900, cal: 240, link: "/menu?category=street-food" },
      ];
    } else if (action === "mood_lazy") {
      botReplyText = "Aalsi mode on? 😴 Koyi nahi, bina haath-paanv hilaye mast hot aur comforting khana thooso! Ye lo fast-delivery waale options:";
      botRecs = [
        { name: "Comforting Maggie", price: 8900, cal: 280, link: "/menu?category=street-food" },
        { name: "Alfredo Pasta", price: 5900, cal: 410, link: "/menu?category=chinese" },
        { name: "Refreshing Soda", price: 3500, cal: 120, link: "/menu?category=drinks" },
      ];
    } else if (action === "mood_happy") {
      botReplyText = "Wah! Khush ho? 🎉 Tab toh shahi dawat banti hai boss! Khushi me pet khali nahi rehna chahiye, ye royal items daba lo jaldi:";
      botRecs = [
        { name: "Hyderabadi Biryani", price: 24900, cal: 550, link: "/menu?category=north-indian" },
        { name: "Gourmet Double Pizza", price: 30000, cal: 930, link: "/menu?category=street-food" },
        { name: "Veg Manchurian", price: 9900, cal: 280, link: "/menu?category=chinese" },
      ];
    } else if (action === "mood_healthy") {
      botReplyText = "Arey re, dieting? 🥦 Chalo thik hai, main bhi kabhi kabhi diet karta hoon... double cheeseburger ke saath diet coke pee kar! 😉 Par tumhare liye ye bilkul healthy items hain:";
      botRecs = [
        { name: "Fluffy Idli Sambhar", price: 4900, cal: 160, link: "/menu?category=north-indian" },
        { name: "Mint Diet Spring Rolls", price: 12500, cal: 130, link: "/menu?category=rolls" },
        { name: "Crispy Pani Puri (light water)", price: 5000, cal: 150, link: "/menu?category=street-food" },
      ];
    } else if (action === "health") {
      botReplyText = "🥗 Main tumhara fitness coach zaroor hoon par dil se saccha Bhukkad hoon! Dieting ka matlab bhookhe rehna nahi hai yaar, smart swap karna hai!\n\n• Pizza (680 kCal) ki jagah narm-narm Idli Sambhar (160 kCal) dabo.\n• Alfredo Pasta ki jagah Diet Spring Rolls (130 kCal) try karo.\n\nBatao, aaj kya fit-and-fine item khaoge?";
      botOptions = [
        { label: "Fit Tips de do 🥗", action: "health_tips" },
        { label: "Wapas Main Menu par chalo ↩️", action: "main" },
      ];
    } else if (action === "health_tips") {
      botReplyText = "💡 **Bhukkad Fit Tips**:\n1. Sugary sodas chhodo, nimbu paani ya juices peeyo.\n2. Fibers ke liye veg meals add karo.\n3. Total intake ko 800 kCal ke andar rakho aur dhoom machao!";
    } else if (action === "delivery") {
      const prepTime = 20; // simulated
      const trafficTime = getRandomNumber(5, 15); // dynamic road traffic
      const totalTime = prepTime + trafficTime;

      botReplyText = `🚗 **Delivery Kab Tak Hogi?**:\n\n• Kitchen me taiyari: ~${prepTime} mins\n• Bahar road par traffic delay: +${trafficTime} mins\n• **Kul mila ke ${totalTime} minute me garam-garam khana aapke darwaze par!**\n\nJaldi order karo, mujhse toh khushboo bilkul bardasht nahi ho rhi! 🤤`;
      botOptions = [
        { label: "Traffic check fir se karo 🔄", action: "delivery" },
        { label: "Main Menu ↩️", action: "main" },
      ];
    } else if (action === "city") {
      botReplyText = "Humaara radar har shehar ke zayke par hai! Kahan se ho aap, batao wahan ka sabse behtareen maal suggest karta hoon:";
      botOptions = [
        { label: "Varanasi (Banaras) 🛕", action: "city_vns" },
        { label: "Ghazipur 🏛️", action: "city_gzp" },
        { label: "Lucknow 🏰", action: "city_luc" },
      ];
    } else if (action === "city_vns") {
      botReplyText = "Banaras ke ho? 🛕 Tab toh subah kachori aur shaam ko crispy Pani Puri aur chatpata Aloo Tikki daba lo babu! Har Har Mahadev, khao daba ke:";
      botRecs = [
        { name: "Crispy Pani Puri", price: 5000, cal: 150, link: "/menu?category=street-food" },
        { name: "Hyderabadi Biryani", price: 24900, cal: 550, link: "/menu?category=north-indian" },
        { name: "Spiced Aloo Tikki", price: 4900, cal: 240, link: "/menu?category=street-food" },
      ];
    } else if (action === "city_gzp") {
      botReplyText = "Ghazipur ke dildaar log! 🏛️ Yahan toh loaded Cheeseburger aur hot spicy Maggie hi chalta hai boss! Khao aur mast raho:";
      botRecs = [
        { name: "Classic Cheeseburger", price: 9900, cal: 350, link: "/menu?category=burgers" },
        { name: "Comforting Maggie", price: 8900, cal: 280, link: "/menu?category=street-food" },
        { name: "Chola Bhatura", price: 12900, cal: 490, link: "/menu?category=street-food" },
      ];
    } else if (action === "city_luc") {
      botReplyText = "Nawabo ke shehar Lucknow se ho? 🏰 Yahan ka rich Special Pizza aur shahi Biryani khao, maza na aaye to batana (kheera samajh ke khaa jana)! 😂:";
      botRecs = [
        { name: "Tandoori Special Pizza", price: 27000, cal: 740, link: "/menu?category=street-food" },
        { name: "Classic Hotdog", price: 11900, cal: 290, link: "/menu?category=burgers" },
        { name: "Hyderabadi Biryani", price: 24900, cal: 550, link: "/menu?category=north-indian" },
      ];
    } else if (action === "main") {
      botReplyText = "Kuch aur thoosna hai? Batao batao, main help karta hoon:";
      botOptions = [
        { label: "Badi Bhookh Lagi Hai! 😋", action: "mood" },
        { label: "Diet Plan (Swap Magic) 🥗", action: "health" },
        { label: "Mera Garam Khana Kab Aayega? 🚗", action: "delivery" },
        { label: "City Specialties Khana Hai ⭐", action: "city" },
      ];
    }

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: botReplyText, options: botOptions, recommendations: botRecs },
    ]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setInput("");

    // Simple NLP check
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let replyText = "Arey samajh nahi aaya bhaya! Waise dimaag me dhoondhne se accha hai inme se koyi option daba ke direct pet pooja karo: 👇";
      let options: { label: string; action: string }[] | undefined = [
        { label: "Badi Bhookh Lagi Hai! 😋", action: "mood" },
        { label: "Diet Plan (Swap Magic) 🥗", action: "health" },
        { label: "Mera Garam Khana Kab Aayega? 🚗", action: "delivery" },
        { label: "City Specialties Khana Hai ⭐", action: "city" },
      ];
      const recs: RecommendationItem[] | undefined = undefined;

      if (lower.includes("mood") || lower.includes("feel") || lower.includes("sad") || lower.includes("stressed") || lower.includes("happy")) {
        replyText = "Arey mood kaisa bhi ho, ilaaj sirf badhiya khana hai! 🤤 Batao inme se kya thoosoge:";
        options = [
          { label: "Stressed hoon 😫", action: "mood_stressed" },
          { label: "Aalsi feel ho rha 😴", action: "mood_lazy" },
          { label: "Happy mood hai 🎉", action: "mood_happy" },
          { label: "Diet wala fit look 🥦", action: "mood_healthy" },
        ];
      } else if (lower.includes("health") || lower.includes("calorie") || lower.includes("nutri") || lower.includes("diet") || lower.includes("fit")) {
        replyText = "🥗 Dieting? Sahi hai boss! Par bhookha mat raho, high-calorie cheezo ko low-calorie healthy Idli ya spring rolls se swap karo!";
        options = [{ label: "Healthy option dikhao 🥦", action: "mood_healthy" }, { label: "Main menu ↩", action: "main" }];
      } else if (lower.includes("time") || lower.includes("traffic") || lower.includes("deliv") || lower.includes("reach")) {
        const prepTime = 20;
        const trafficTime = getRandomNumber(4, 12);
        replyText = `🚗 **Delivery Estimator**:\n• Taiyari: ${prepTime}m\n• Traffic delay: +${trafficTime}m\n• **Total: ${prepTime + trafficTime} minutes me khana aapke paas!**`;
      } else if (lower.includes("varanasi") || lower.includes("ghazipur") || lower.includes("lucknow") || lower.includes("city")) {
        replyText = "Kahan ke zayke ka maza lena hai boss? Shehar select karo:";
        options = [
          { label: "Varanasi 🛕", action: "city_vns" },
          { label: "Ghazipur 🏛️", action: "city_gzp" },
          { label: "Lucknow 🏰", action: "city_luc" },
        ];
      }

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: replyText, options, recommendations: recs },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-flame-500 hover:bg-flame-600 text-white shadow-xl shadow-flame-500/20 flex items-center justify-center border-2 border-white transition-all hover:scale-105 p-0 overflow-hidden"
          aria-label="Open AI Assistant"
        >
          <FoodieRobotLogo size={52} />
        </Button>
      </div>

      {/* Sliding Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] z-50 rounded-2xl overflow-hidden shadow-2xl border border-border/80 bg-white flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-flame-500 to-flame-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center font-bold overflow-hidden">
                  <FoodieRobotLogo size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Bhukkad AI Bot 🤖</h3>
                  <p className="text-[10px] text-white/80">Pet ka ilaaj, 24x7 bhookha! 🤤</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 rounded-full h-8 w-8"
              >
                <CloseCircle size={20} variant="Bold" />
              </Button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-cream-50/20 scrollbar-none">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                >
                  <div
                    className={`rounded-2xl p-3 text-xs max-w-[85%] leading-relaxed ${msg.sender === "user"
                      ? "bg-flame-500 text-white rounded-tr-none"
                      : "bg-white border border-border text-foreground rounded-tl-none shadow-sm"
                      }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {msg.text}
                  </div>

                  {/* Recommendations layout */}
                  {msg.recommendations && (
                    <div className="mt-2 w-full max-w-[85%] space-y-2">
                      {msg.recommendations.map((rec) => (
                        <Card key={rec.name} className="p-2 border border-border/80 bg-white flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[10px] text-foreground truncate">{rec.name}</p>
                            <p className="text-[9px] text-muted-foreground">{rec.cal} kCal • {formatPrice(rec.price)}</p>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-flame-500 rounded-lg hover:bg-flame-50" asChild>
                            <a href={rec.link}>
                              <ArrowRight size={12} />
                            </a>
                          </Button>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Options select list */}
                  {msg.options && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 justify-start">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.action}
                          onClick={() => handleOptionClick(opt.action)}
                          className="bg-cream-100 hover:bg-cream-200 border border-cream-200 text-foreground font-semibold text-[10px] px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSend} className="p-3 border-t border-border bg-white flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Ask health coach, type mood..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-9 rounded-xl border-border focus-visible:ring-flame-500 text-xs"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-xl bg-flame-500 hover:bg-flame-600 text-white shrink-0 shadow-md shadow-flame-500/10"
              >
                <Send2 size={16} variant="Bold" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
