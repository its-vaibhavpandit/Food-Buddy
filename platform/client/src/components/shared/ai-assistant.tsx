"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send2, CloseCircle, ArrowRight } from "iconsax-react";
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

function FoodieRobotLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="18 4 72 106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Teal Body Gradient */}
        <linearGradient id="tealGrad" x1="20" y1="10" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="40%" stopColor="#00C9A7" />
          <stop offset="100%" stopColor="#008E74" />
        </linearGradient>
        {/* Helmet Highlight */}
        <linearGradient id="tealHighlight" x1="30" y1="15" x2="70" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7EFFF5" />
          <stop offset="100%" stopColor="#00C9A7" stopOpacity="0" />
        </linearGradient>
        {/* Gold Accent Gradient */}
        <linearGradient id="goldGrad" x1="40" y1="50" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        {/* Dark Screen Gradient */}
        <linearGradient id="screenGrad" x1="30" y1="20" x2="70" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        {/* Glowing Face Cyan Gradient */}
        <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#55E6C1" />
          <stop offset="100%" stopColor="#00D2D3" />
        </linearGradient>
        {/* White Metallic Gradient */}
        <linearGradient id="whiteMetal" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F1F5F9" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>
        {/* Soft Drop Shadow */}
        <filter id="botShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.25" />
        </filter>
        <filter id="eyeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <g filter="url(#botShadow)">
        {/* 1. Golden Luxury Chair Base & Swivel Legs */}
        <path d="M45 92 L35 106 M55 92 L65 106 M50 90 L50 108 M32 106 L68 106" stroke="url(#goldGrad)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="35" cy="106" r="2.5" fill="#B45309" />
        <circle cx="65" cy="106" r="2.5" fill="#B45309" />
        <circle cx="50" cy="108" r="2.5" fill="#B45309" />

        {/* Chair Seat Cushion (Reclining White/Silver Cushion) */}
        <path d="M28 82 C28 75 38 72 55 74 C72 76 88 80 88 86 C88 90 75 93 52 92 C35 91 28 88 28 82 Z" fill="url(#whiteMetal)" stroke="url(#goldGrad)" strokeWidth="2" />
        <path d="M25 65 C22 75 32 82 45 84" fill="none" stroke="url(#goldGrad)" strokeWidth="3" strokeLinecap="round" />

        {/* 2. Robot Lower Body & Reclining Thighs */}
        <ellipse cx="48" cy="70" rx="16" ry="12" fill="url(#tealGrad)" />
        {/* Legs resting forward */}
        <rect x="52" y="66" width="22" height="12" rx="6" fill="url(#tealGrad)" transform="rotate(10 63 72)" />
        <circle cx="74" cy="76" r="6" fill="url(#whiteMetal)" stroke="url(#tealGrad)" strokeWidth="2" />

        {/* 3. Main Robot Torso */}
        <path d="M36 48 C36 42 42 38 52 39 C62 40 68 46 66 56 C64 66 56 70 44 68 C36 66 36 56 36 48 Z" fill="url(#tealGrad)" />
        {/* Chest Plate / Accent Badge */}
        <rect x="42" y="46" width="12" height="6" rx="3" fill="url(#whiteMetal)" />
        <circle cx="45" cy="49" r="1.5" fill="#00C9A7" />
        <circle cx="51" cy="49" r="1.5" fill="#F59E0B" />

        {/* 4. Golden Laptop on Lap */}
        <g transform="rotate(-5 60 55)">
          {/* Base / Keyboard */}
          <path d="M48 56 L74 54 L78 62 L50 64 Z" fill="url(#goldGrad)" />
          {/* Keyboard Keys grid representation */}
          <path d="M53 57.5 L71 56 M54 59.5 L72 58" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.8" />
          {/* Screen lid open */}
          <path d="M68 38 L78 54 L50 56 L44 40 Z" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="1" />
          <path d="M66 40 L75 52 L51 54 L46 42 Z" fill="#FFFBEB" opacity="0.9" />
          {/* Logo on laptop lid back */}
          <circle cx="58" cy="47" r="2" fill="#F59E0B" />
        </g>

        {/* 5. Robot Arms */}
        {/* Left arm typing on laptop */}
        <path d="M38 52 C38 58 46 60 52 59" fill="none" stroke="url(#tealGrad)" strokeWidth="7" strokeLinecap="round" />
        <circle cx="52" cy="59" r="3.5" fill="url(#whiteMetal)" />

        {/* Right arm raised waving */}
        <path d="M60 48 C66 45 68 36 65 30" fill="none" stroke="url(#tealGrad)" strokeWidth="6.5" strokeLinecap="round" />
        {/* Right hand with mini screen / controller */}
        <circle cx="65" cy="28" r="4.5" fill="url(#whiteMetal)" stroke="url(#goldGrad)" strokeWidth="1" />
        <rect x="62" y="25" width="6" height="5" rx="1.5" fill="url(#tealGrad)" />

        {/* 6. Big Cute Head */}
        {/* Main Teal Head Shell */}
        <ellipse cx="46" cy="26" rx="22" ry="17" fill="url(#tealGrad)" transform="rotate(-6 46 26)" />
        {/* Top Head Highlight */}
        <ellipse cx="43" cy="15" rx="14" ry="5" fill="url(#tealHighlight)" transform="rotate(-6 43 15)" />
        {/* Cute White Top Fin / Cap Accent */}
        <path d="M38 10 C42 7 50 7 54 10 C50 11 42 11 38 10 Z" fill="url(#whiteMetal)" />

        {/* Side Ear Pods (White & Gold) */}
        {/* Left Ear */}
        <rect x="21" y="21" width="5" height="10" rx="2.5" fill="url(#whiteMetal)" stroke="url(#goldGrad)" strokeWidth="1" transform="rotate(-6 23.5 26)" />
        <line x1="22" y1="24" x2="24" y2="24" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="27" x2="24" y2="27" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" />

        {/* Right Ear */}
        <rect x="65" y="17" width="5" height="10" rx="2.5" fill="url(#whiteMetal)" stroke="url(#goldGrad)" strokeWidth="1" transform="rotate(-6 67.5 22)" />
        <line x1="66" y1="20" x2="68" y2="20" stroke="#00C9A7" strokeWidth="1.5" strokeLinecap="round" />

        {/* 7. Dark Visor Screen */}
        <ellipse cx="46" cy="27" rx="16" ry="11.5" fill="url(#screenGrad)" transform="rotate(-6 46 27)" stroke="url(#tealHighlight)" strokeWidth="1" />

        {/* 8. Glowing Cute Face Expressions */}
        <g transform="rotate(-6 46 27)" filter="url(#eyeGlowFilter)">
          {/* Left Eye (Happy Glowing Oval) */}
          <ellipse cx="39" cy="25" rx="3" ry="4" fill="url(#cyanGlow)" />
          <circle cx="40" cy="23.5" r="1" fill="#FFFFFF" />

          {/* Right Eye (Happy Glowing Oval) */}
          <ellipse cx="53" cy="25" rx="3" ry="4" fill="url(#cyanGlow)" />
          <circle cx="54" cy="23.5" r="1" fill="#FFFFFF" />

          {/* Big Happy Smile Arc */}
          <path d="M42 29.5 C44 33 48 33 50 29.5" fill="none" stroke="url(#cyanGlow)" strokeWidth="2.2" strokeLinecap="round" />

          {/* Cheerful Blushing Cheeks */}
          <ellipse cx="35" cy="29" rx="2" ry="1" fill="#FF7675" opacity="0.6" />
          <ellipse cx="57" cy="29" rx="2" ry="1" fill="#FF7675" opacity="0.6" />
        </g>
      </g>
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
          className="h-16 w-16 rounded-full bg-gradient-to-tr from-flame-600 via-flame-500 to-amber-500 hover:from-flame-700 hover:to-amber-600 text-white shadow-2xl shadow-flame-500/35 flex items-center justify-center border-2 border-white transition-all hover:scale-110 p-1 overflow-hidden"
          aria-label="Open AI Assistant"
        >
          <FoodieRobotLogo size={58} className="w-full h-full object-contain" />
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
            className="fixed bottom-26 right-6 w-[375px] max-w-[calc(100vw-2rem)] h-[510px] z-50 rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-border-val)]/80 bg-[var(--color-card-bg)] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-flame-500 to-flame-600 p-4 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold overflow-hidden p-0.5 border border-white/30">
                  <FoodieRobotLogo size={40} className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    Bhukkad AI Bot 🤖
                  </h3>
                  <p className="text-[10px] text-white/85">Pet ka ilaaj, 24x7 bhookha! 🤤</p>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--color-bg)] scrollbar-none">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                >
                  <div
                    className={`rounded-2xl p-3 text-xs max-w-[85%] leading-relaxed ${msg.sender === "user"
                      ? "bg-flame-500 text-white rounded-tr-none"
                      : "bg-[var(--color-card-bg)] border border-[var(--color-border-val)] text-[var(--color-text-primary)] rounded-tl-none shadow-sm"
                      }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {msg.text}
                  </div>

                  {/* Recommendations layout */}
                  {msg.recommendations && (
                    <div className="mt-2 w-full max-w-[85%] space-y-2">
                      {msg.recommendations.map((rec) => (
                        <Card key={rec.name} className="p-2 border border-[var(--color-border-val)]/80 bg-[var(--color-card-bg)] flex items-center justify-between gap-2 shadow-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-[10px] text-[var(--color-text-primary)] truncate">{rec.name}</p>
                            <p className="text-[9px] text-[var(--color-text-secondary)]">{rec.cal} kCal • {formatPrice(rec.price)}</p>
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
                          className="bg-[var(--color-surface)] hover:bg-cream-200 border border-cream-200 text-[var(--color-text-primary)] font-semibold text-[10px] px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
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
            <form onSubmit={handleSend} className="p-3 border-t border-[var(--color-border-val)] bg-[var(--color-card-bg)] flex gap-2 items-center">
              <Input
                type="text"
                placeholder="Ask health coach, type mood..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 h-9 rounded-xl border-[var(--color-border-val)] focus-visible:ring-flame-500 text-xs"
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
