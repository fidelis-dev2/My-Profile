/* assets/js/chatAI.js */
(() => {
  const fab = document.getElementById("chat-fab");
  const chat = document.getElementById("chat-container");
  const header = document.getElementById("chat-header");
  const messages = document.getElementById("chat-messages");
  const input = document.getElementById("chat-input");
  const sendBtn = document.getElementById("chat-send");

  const btnClear = document.getElementById("chat-clear");
  const btnMin = document.getElementById("chat-min");
  const btnClose = document.getElementById("chat-close");

  if (!fab || !chat || !header || !messages || !input || !sendBtn) {
    console.warn("ChatAI: Missing required elements (check IDs).");
    return;
  }

  // ----------------------
  // ✅ YOUR PROFILE (edit if needed)
  // ----------------------
  const BLOG_PROFILE = {
    name: "Fidelis Paschal Shotto",
    title: "Programmer • Physics & Computer Science Teacher",
    location: "Iringa, Tanzania",
    education: "University of Dar es Salaam (UDSM), MUCE Branch — BSc Science with Education (2025)",
    currentRole: "Programmer at Cohema Company — Iringa (2026 – Present)",
    previousRoles: [
      "Physics & Computer Science Teacher — Tosamaganga Secondary School (2024 – 2025)",
      "Physics Teacher — Mkolani Secondary School (2023)"
    ],
    skills: [
      "Java", "PHP", "JavaScript", "MySQL", "HTML & CSS", "Bootstrap 5", "JSP & Servlets", "Git & GitHub"
    ],
    projects: [
      {
        name: "SMS Notification System",
        desc: "Rental housing SMS system for landlords and tenants with admin dashboard.",
        stack: ["PHP", "MySQL", "JavaScript", "Bootstrap"]
      },
      {
        name: "School Management System",
        desc: "Web-based system for managing students, results, and teachers.",
        stack: ["Java", "JSP/Servlets", "MySQL", "Bootstrap"]
      },
      {
        name: "Portfolio Website",
        desc: "Personal portfolio built using Bootstrap 5 and modern UI practices.",
        stack: ["HTML", "CSS", "Bootstrap", "JavaScript"]
      }
    ],
    services: [
      "Web & Software Development",
      "School systems & results management solutions",
      "SMS notification / alerts solutions",
      "ICT Training and mentorship"
    ],
    hireCTA:
      "To hire me: use the Contact section on this site and include what you need, deadline, and your budget range."
  };

  // ----------------------
  // ✅ PRICING (edit ranges as you want)
  // ----------------------
  const PRICING = {
    currency: "TZS",
    note: "Prices depend on scope, pages, features, and deadline. After a short discussion I provide a final quote.",
    packages: {
      basic: {
        name: "Basic",
        range: "250,000 – 600,000",
        includes: [
          "1–3 pages (Home, About, Contact)",
          "Mobile responsive design",
          "Basic SEO (titles, meta)",
          "Contact form",
          "Delivery: 2–5 days"
        ]
      },
      standard: {
        name: "Standard",
        range: "700,000 – 1,800,000",
        includes: [
          "4–8 pages",
          "Better UI/UX",
          "Portfolio/projects section",
          "Analytics setup",
          "Delivery: 5–12 days"
        ]
      },
      premium: {
        name: "Premium",
        range: "2,000,000 – 6,000,000+",
        includes: [
          "Custom web app features",
          "Database + authentication (optional)",
          "Admin/dashboard (optional)",
          "Integrations (optional)",
          "Delivery: 2–6 weeks"
        ]
      }
    },
    addOns: [
      "Domain + hosting setup",
      "Logo/branding",
      "Maintenance (monthly)",
      "SMS integration",
      "Custom systems (School/Business)"
    ]
  };

  // ----------------------
  // ✅ State & helpers
  // ----------------------
  const STORAGE_KEY = "fps_chat_history_v3";
  let typingEl = null;

  const nowTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m]));

  const normalize = (text) =>
    String(text || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const hasAny = (text, words) => words.some((w) => text.includes(w));

  const scrollDown = () => (messages.scrollTop = messages.scrollHeight);

  function addBubble(role, text, save = true) {
    const div = document.createElement("div");
    div.className = `chat-bubble ${role === "user" ? "chat-user" : "chat-ai"}`;
    div.innerHTML = `
      <div>${escapeHtml(text)}</div>
      <div class="chat-meta">${role === "user" ? "You" : "Assistant"} • ${nowTime()}</div>
    `;
    messages.appendChild(div);
    scrollDown();
    if (save) persist();
  }

  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement("div");
    typingEl.className = "chat-bubble chat-ai";
    typingEl.innerHTML = `
      <div class="chat-typing">
        <span>Typing</span>
        <span class="dots"><span></span><span></span><span></span></span>
      </div>
      <div class="chat-meta">Assistant • ${nowTime()}</div>
    `;
    messages.appendChild(typingEl);
    scrollDown();
  }

  function hideTyping() {
    if (!typingEl) return;
    typingEl.remove();
    typingEl = null;
  }

  function persist() {
    const bubbles = [...messages.querySelectorAll(".chat-bubble")].slice(-80);
    const history = bubbles.map((b) => ({
      role: b.classList.contains("chat-user") ? "user" : "ai",
      text: b.querySelector("div")?.textContent || ""
    }));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (_) {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const history = JSON.parse(raw);
      if (!Array.isArray(history)) return;
      history.forEach((h) => addBubble(h.role === "user" ? "user" : "ai", h.text, false));
      scrollDown();
    } catch (_) {}
  }

  function clearChat() {
    hideTyping();
    messages.innerHTML = "";
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    greet();
  }

  function greet() {
    if (messages.querySelector(".chat-bubble")) return;
    addBubble("ai",
      `Hi 👋 I’m the Portfolio Assistant for ${BLOG_PROFILE.name}.\nAsk me about: projects, skills, experience, or pricing.`,
      false
    );
  }

  function openChat() {
    chat.style.display = "block";
    fab.style.opacity = "0";
    fab.style.pointerEvents = "none";
    chat.classList.remove("chat-min");
    input.focus();
  }

  function closeChat() {
    chat.style.display = "none";
    fab.style.opacity = "1";
    fab.style.pointerEvents = "auto";
  }

  function toggleMin() {
    chat.classList.toggle("chat-min");
  }

  // ----------------------
  // ✅ Answers about YOU
  // ----------------------
  function shortIntro() {
    return `I’m ${BLOG_PROFILE.name} — ${BLOG_PROFILE.title}. Currently: ${BLOG_PROFILE.currentRole}.`;
  }

  function aboutAnswer() {
    return `${shortIntro()}\nEducation: ${BLOG_PROFILE.education}\nLocation: ${BLOG_PROFILE.location}`;
  }

  function skillsAnswer() {
    return `Key skills:\n- ${BLOG_PROFILE.skills.join("\n- ")}`;
  }

  function projectsAnswer() {
    const items = BLOG_PROFILE.projects.map((p, i) => {
      const stack = p.stack?.length ? ` (Stack: ${p.stack.join(", ")})` : "";
      return `${i + 1}. ${p.name} — ${p.desc}${stack}`;
    }).join("\n");
    return `Projects:\n${items}\n\nType a project name for details (e.g., "School Management System").`;
  }

  function experienceAnswer() {
    return `Experience:\n1. ${BLOG_PROFILE.currentRole}\n2. ${BLOG_PROFILE.previousRoles.join("\n3. ")}`;
  }

  function servicesAnswer() {
    return `Services:\n- ${BLOG_PROFILE.services.join("\n- ")}\n\n${BLOG_PROFILE.hireCTA}`;
  }

  function pricingAnswer() {
    const p = PRICING.packages;

    const pack = (x) =>
      `${x.name} (${PRICING.currency} ${x.range})\n- ${x.includes.join("\n- ")}`;

    return `Pricing guide (estimate):\n\n${pack(p.basic)}\n\n${pack(p.standard)}\n\n${pack(p.premium)}\n\nAdd-ons: ${PRICING.addOns.join(", ")}\n\n${PRICING.note}\n\nTo quote accurately, tell me: website type, pages, features, and deadline.`;
  }

  function specificProjectAnswer(userText) {
    const t = normalize(userText);
    const match = BLOG_PROFILE.projects.find(p => normalize(p.name) === t || t.includes(normalize(p.name)));
    if (!match) return null;

    const stack = match.stack?.length ? `Stack: ${match.stack.join(", ")}` : "";
    return `${match.name}\n${match.desc}\n${stack}\n\nWant features, timeline, or cost estimate for this project?`;
  }

  function fallbackAnswer() {
    return `I can answer about ${BLOG_PROFILE.name}.\nTry:\n- "Who are you?"\n- "Skills"\n- "Projects"\n- "Experience"\n- "Pricing"\n- "How to hire you?"`;
  }

  // ----------------------
  // ✅ MAIN AI LOGIC (offline smart)
  // ----------------------
  async function getAIResponse(userText) {
    const raw = userText || "";
    const t = normalize(raw);

    // specific project match first
    const proj = specificProjectAnswer(raw);
    if (proj) return proj;

    // greetings
    if (hasAny(t, ["hi", "hello", "hey", "mambo", "vipi", "habari"])) {
      return `${shortIntro()}\nAsk me about projects, skills, pricing, or hiring.`;
    }

    // about
    if (hasAny(t, ["who are you", "about", "introduce", "profile", "tell me about you", "wewe nani"])) {
      return aboutAnswer();
    }

    // pricing
    if (hasAny(t, ["price", "pricing", "charges", "cost", "how much", "bei", "gharama", "malipo", "budget"])) {
      return pricingAnswer();
    }

    // skills
    if (hasAny(t, ["skill", "skills", "technologies", "stack", "languages", "tech", "uwezo", "unajua nini"])) {
      return skillsAnswer();
    }

    // projects
    if (hasAny(t, ["project", "projects", "portfolio", "work", "kazi", "mfano kazi"])) {
      return projectsAnswer();
    }

    // experience
    if (hasAny(t, ["experience", "background", "job", "work history", "ajira", "ulifanya wapi kazi"])) {
      return experienceAnswer();
    }

    // contact / hire
    if (hasAny(t, ["hire", "contact", "reach", "email", "whatsapp", "call", "wasiliana", "nataka kukuhire"])) {
      return servicesAnswer();
    }

    // education
    if (hasAny(t, ["education", "udsm", "university", "degree", "graduate", "umasomo"])) {
      return `Education: ${BLOG_PROFILE.education}`;
    }

    return fallbackAnswer();
  }

  // ----------------------
  // ✅ Send flow
  // ----------------------
  async function send() {
    const msg = input.value.trim();
    if (!msg) return;

    sendBtn.disabled = true;
    input.value = "";
    addBubble("user", msg);

    showTyping();
    try {
      const reply = await getAIResponse(msg);
      // small delay to feel natural
      await new Promise(r => setTimeout(r, 450));
      hideTyping();
      addBubble("ai", reply);
    } catch (e) {
      hideTyping();
      addBubble("ai", "Sorry — something went wrong. Please try again.");
      console.error(e);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // ----------------------
  // ✅ Events
  // ----------------------
  fab.addEventListener("click", openChat);
  btnClose?.addEventListener("click", (e) => { e.stopPropagation(); closeChat(); });
  btnClear?.addEventListener("click", (e) => { e.stopPropagation(); clearChat(); });
  btnMin?.addEventListener("click", (e) => { e.stopPropagation(); toggleMin(); });

  // header click toggles minimize (but not when clicking buttons)
  header.addEventListener("click", (e) => {
    if (e.target.closest("button")) return;
    toggleMin();
  });

  sendBtn.addEventListener("click", send);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  // Init
  load();
  greet();
})();
