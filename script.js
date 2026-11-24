/* =========================================================
   CONFIGURATION: paste your real keys here
   ========================================================= */
const CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
  RAZORPAY_KEY_ID: "rzp_test_YOUR_KEY_ID",
  GITHUB_URL: "https://github.com/MrAhsaan",
  WHATSAPP_NUMBER: "917903580966",
  WHATSAPP_MESSAGE: "Hi Ahsaan! I viewed your Web Developer & Data Analytics e-Portfolio and would like to connect regarding an opportunity.",
  ROLES: ["Full-Stack Web Developer", "Data Analytics Enthusiast", "Python Programmer", "Database Specialist"]
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reducedMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const supabaseReady = () => CONFIG.SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL";
const razorpayReady = () => CONFIG.RAZORPAY_KEY_ID !== "rzp_test_YOUR_KEY_ID";

/* Each module runs on its own so one failure never breaks the rest */
document.addEventListener("DOMContentLoaded", () => {
  [initTheme, initTypewriter, initReveal, initScrollSpy, initCounters, initMenu, initFilter, initProgress, initHeroCanvas, initSpotlight, initShare, initBars, initCopy,
   initResume, initContactForm, initPayment, initWhatsApp, initChatbot, initBackToTop, initStatus]
    .forEach((fn) => { try { fn(); } catch (err) { console.error(fn.name + " failed:", err); } });
});

/* ---------- Toasts ---------- */
function toast(message, type = "") {
  const box = $("#toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

/* ---------- Theme (blue/dark and light) ---------- */
function initTheme() {
  const root = document.documentElement;
  const sync = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    $$(".theme-toggle").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(dark));
      if (btn.classList.contains("icon-btn")) { btn.textContent = dark ? "\u2600" : "\u263E"; btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to blue dark theme"); }
      else btn.textContent = dark ? "\u2600  Switch to Light theme" : "\u263E  Switch to Blue/Dark theme";
    });
  };
  $$(".theme-toggle").forEach((btn) => btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) { /* storage may be blocked */ }
    sync();
  }));
  sync();
}

/* ---------- Typewriter ---------- */
function initTypewriter() {
  const el = $("#typing-role");
  if (!el) return;
  if (reducedMotion) { el.textContent = CONFIG.ROLES[0]; return; }
  let role = 0, idx = 0, deleting = false;
  (function tick() {
    const word = CONFIG.ROLES[role];
    idx += deleting ? -1 : 1;
    el.textContent = word.substring(0, idx);
    let delay = deleting ? 45 : 90;
    if (!deleting && idx === word.length) { deleting = true; delay = 1400; }
    else if (deleting && idx === 0) { deleting = false; role = (role + 1) % CONFIG.ROLES.length; delay = 400; }
    setTimeout(tick, delay);
  })();
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("visible")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  items.forEach((el) => io.observe(el));
}

/* ---------- Scroll-spy ---------- */
function initScrollSpy() {
  if (!("IntersectionObserver" in window)) return;
  const links = $$(".nav-links a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  $$("main section[id]").forEach((s) => io.observe(s));
}

/* ---------- Animated counters ---------- */
function initCounters() {
  const els = $$("[data-count]");
  if (reducedMotion || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target, end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || "0", 10);
      const start = performance.now(), dur = 1200;
      (function step(now) {
        const p = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (end * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
}

/* ---------- Mobile drawer ---------- */
function initMenu() {
  const toggle = $("#menu-toggle"), sidebar = $("#sidebar"), scrim = $("#scrim");
  if (!toggle || !sidebar) return;
  const setOpen = (open) => {
    sidebar.classList.toggle("open", open);
    scrim.hidden = !open;
    document.body.classList.toggle("no-scroll", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setOpen(!sidebar.classList.contains("open")));
  scrim.addEventListener("click", () => setOpen(false));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  window.addEventListener("resize", () => { if (window.innerWidth >= 900) setOpen(false); });
}

/* ---------- Project filter + search ---------- */
function initFilter() {
  const buttons = $$(".filter"), cards = $$(".project"), search = $("#project-search"), empty = $("#no-projects");
  let cat = "all";
  const apply = () => {
    const q = search ? search.value.trim().toLowerCase() : "";
    let shown = 0;
    cards.forEach((c) => {
      const okCat = cat === "all" || c.dataset.category.split(" ").includes(cat);
      const okText = !q || c.textContent.toLowerCase().includes(q);
      c.hidden = !(okCat && okText);
      if (!c.hidden) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  };
  buttons.forEach((btn) => btn.addEventListener("click", () => {
    cat = btn.dataset.filter;
    buttons.forEach((b) => { const on = b === btn; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); });
    apply();
  }));
  if (search) search.addEventListener("input", apply);
}

/* ---------- Scroll progress bar ---------- */
function initProgress() {
  const bar = $("#progress");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- Hero particle network ---------- */
function initHeroCanvas() {
  const cv = $("#hero-canvas");
  if (!cv || reducedMotion || !cv.getContext) return;
  const ctx = cv.getContext("2d");
  let w = 0, h = 0, pts = [], running = false;
  function size() {
    const r = cv.parentElement.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(55, Math.max(16, Math.round((w * h) / 9000)));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45 }));
  }
  function frame() {
    if (!running) return;
    const c = getComputedStyle(document.documentElement).getPropertyValue("--particle").trim() || "15,23,42";
    ctx.clearRect(0, 0, w, h);
    pts.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.fillStyle = "rgba(" + c + ",.5)";
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, 6.283); ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) { ctx.strokeStyle = "rgba(" + c + "," + ((1 - d / 110) * .28) + ")"; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
    }
    requestAnimationFrame(frame);
  }
  size();
  window.addEventListener("resize", size);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { const on = es[0].isIntersecting; if (on && !running) { running = true; frame(); } else if (!on) running = false; }).observe(cv.parentElement);
  } else { running = true; frame(); }
}

/* ---------- Card spotlight ---------- */
function initSpotlight() {
  if (!window.matchMedia || !matchMedia("(hover: hover)").matches) return;
  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest ? e.target.closest(".card") : null;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
}

/* ---------- Animated bars ---------- */
function initBars() {
  const bars = $$(".bars");
  if (!("IntersectionObserver" in window)) { bars.forEach((b) => b.classList.add("on")); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } }), { threshold: 0.4 });
  bars.forEach((b) => io.observe(b));
}

/* ---------- Share + copy ---------- */
function copyText(text, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast(msg, "ok")).catch(() => toast("Copy failed. Please copy it manually.", "warn"));
  } else { toast("Copy is not supported here: " + text, "warn"); }
}
function initShare() {
  $$(".share-btn").forEach((b) => b.addEventListener("click", async () => {
    const data = { title: "Ahsaan Ansari | e-Portfolio", text: "Take a look at my e-Portfolio", url: window.location.href };
    try { if (navigator.share) { await navigator.share(data); return; } }
    catch (err) { if (err && err.name === "AbortError") return; }
    copyText(window.location.href, "Portfolio link copied");
  }));
}
function initCopy() {
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.copy, b.dataset.msg || "Copied")));
}

/* ---------- Resume viewer ---------- */
function initResume() {
  const dlg = $("#resume-dialog"), open = $("#resume-open"), close = $("#resume-close"), frame = $("#resume-frame");
  if (!dlg || !open) return;
  open.addEventListener("click", () => {
    // Phones rarely render PDFs inside frames, so open them directly
    if (window.innerWidth < 700 || typeof dlg.showModal !== "function") { window.open("resume.pdf", "_blank", "noopener"); return; }
    if (!frame.getAttribute("src")) frame.setAttribute("src", "resume.pdf");
    dlg.showModal();
  });
  close.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
}

/* ---------- Feature 2: Supabase contact form ---------- */
function initContactForm() {
  const form = $("#contact-form"), status = $("#form-status"), btn = $("#send-btn");
  if (!form) return;
  const fields = ["name", "email", "message"];
  const setErr = (f, msg) => { $("#err-" + f).textContent = msg; form.elements[f].classList.toggle("invalid", !!msg); };

  function validate() {
    const v = Object.fromEntries(fields.map((f) => [f, form.elements[f].value.trim()]));
    setErr("name", v.name.length < 2 ? "Please enter your name." : "");
    setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email) ? "" : "Please enter a valid email address.");
    setErr("message", v.message.length < 10 ? "Please write at least 10 characters." : "");
    return fields.every((f) => !$("#err-" + f).textContent) ? v : null;
  }
  fields.forEach((f) => form.elements[f].addEventListener("input", () => setErr(f, "")));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.elements["website"].value) return;            // honeypot caught a bot
    const data = validate();
    if (!data) return;

    btn.disabled = true;
    status.style.color = "#2563eb";
    status.textContent = "Sending your message...";

    try {
      if (!supabaseReady()) {                                 // demo mode
        await new Promise((r) => setTimeout(r, 600));
        status.style.color = "#16a34a";
        status.textContent = "Message sent (demo mode). Add your Supabase keys in script.js to save it for real.";
      } else {
        if (typeof supabase === "undefined") throw new Error("Supabase library failed to load.");
        const client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        const { error } = await client.from("messages").insert([data]);
        if (error) throw error;
        status.style.color = "#16a34a";
        status.textContent = "Message sent. Thank you, I'll reply soon.";
      }
      toast("Message sent", "ok");
      form.reset();
    } catch (err) {
      status.style.color = "#dc2626";
      status.textContent = "Could not send your message: " + (err.message || "unknown error");
      toast("Message failed to send", "bad");
    } finally {
      setTimeout(() => { btn.disabled = false; }, 3000);   // simple spam cooldown
    }
  });
}

/* ---------- Feature 3: Razorpay test checkout ---------- */
function initPayment() {
  const btn = $("#pay-btn"), status = $("#pay-status");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!razorpayReady()) {
      toast("Demo mode: add your Razorpay test key in script.js to open checkout.", "warn");
      status.style.color = "#b45309";
      status.textContent = "Demo mode: no Razorpay key configured yet.";
      return;
    }
    if (typeof Razorpay === "undefined") { toast("Razorpay failed to load. Check your connection.", "bad"); return; }
    const rzp = new Razorpay({
      key: CONFIG.RAZORPAY_KEY_ID,
      amount: 10000,
      currency: "INR",
      name: "Ahsaan Ansari",
      description: "1-on-1 Consultation (Test Mode)",
      handler: (res) => {
        status.style.color = "#16a34a";
        status.textContent = "Payment successful. Payment ID: " + res.razorpay_payment_id;
        toast("Payment successful: " + res.razorpay_payment_id, "ok");
      },
      theme: { color: "#2563eb" }
    });
    rzp.on("payment.failed", () => toast("Payment failed. Please try again.", "bad"));
    rzp.open();
  });
}

/* ---------- Feature 4: WhatsApp ---------- */
function initWhatsApp() {
  const url = "https://wa.me/" + CONFIG.WHATSAPP_NUMBER + "?text=" + encodeURIComponent(CONFIG.WHATSAPP_MESSAGE);
  ["#whatsapp-btn", "#whatsapp-link"].forEach((s) => { const a = $(s); if (a) a.href = url; });
}

/* ---------- Feature 5: Resume AI chatbot ---------- */
function initChatbot() {
  const box = $("#chat-box"), toggle = $("#chat-toggle"), msgs = $("#chat-messages"), input = $("#chat-input");
  if (!box || !toggle) return;

  const KB = [
    { keys: ["education", "cgpa", "mca", "bca", "degree", "study", "college", "school", "percentage", "marks", "makaut", "qualification"],
      text: "Ahsaan is pursuing his first year of MCA (started 2026) with a focus on Data Science and Web Technologies. He completed BCA at Dr. B.C. Roy Academy, MAKAUT (2022 to 2025) with a 7.83 CGPA, Class XII (Science PCM) at P.K. Roy Memorial College, JAC with 81.8%, and Class X at St. Thomas High School, CBSE with 76%." },
    { keys: ["skill", "python", "web", "tech", "html", "css", "javascript", "sql", "dbms", "database", "supabase", "language", "c++", "oops", "stack"],
      text: "Programming and core CS: Python, C, Data Structures, OOPS. Web and database: HTML5, CSS3, JavaScript (ES6+), DBMS, SQL, Supabase (PostgreSQL). Soft skills: communication, problem solving, adaptability. Spoken languages: English and Hindi. Tools used in projects include Flask, SQLite, ReportLab, Pytest, Pandas and NumPy." },
    { keys: ["project", "zomato", "voice", "assistant", "quickpay", "crm", "built", "portfolio", "work", "autocare", "garage", "skilltrack", "skillbridge", "flask", "sih"],
      text: "Projects: AutoCare Garage PRO (Python, Flask, SQLite, ReportLab, Pytest), SkillTrack360 (tracks employment outcomes, skill gaps and skill initiative impact, SIH26135), SkillBridge Industry Ready Web Application, Zomato Data Analysis, Personal Voice Assistant, a Supabase Portfolio & CRM, the QuickPay Razorpay portal, and this Resume AI Chatbot." },
    { keys: ["assignment", "assignments", "web-dev", "webdev", "coursework", "svg", "canvas", "html5"],
      text: "The Web-Dev Assignments section holds 5 Client-Side Web Development assignments: (1) HTML foundations with 19 tasks and mini projects, (2) HTML tables, (3) HTML forms with 50 questions, (4) HTML5 SVG and Canvas with 50 questions, and (5) 23 JavaScript programs. Each page opens as a live demo." },
    { keys: ["github", "repo", "repository", "code", "source"], text: "Ahsaan’s GitHub profile is https://github.com/MrAhsaan" },
    { keys: ["certif", "globsyn", "course"], text: "Ahsaan holds a Data Science Using Python certification from Globsyn Finishing School." },
    { keys: ["contact", "email", "phone", "whatsapp", "hire", "reach", "call", "location", "where", "number"],
      text: "Email: ahsaanansari4956@gmail.com. Phone / WhatsApp: +91 7903580966. He is based in Dhanbad, Jharkhand and Pune, Maharashtra. The green WhatsApp button opens a chat directly." },
    { keys: ["interest", "hobby", "hobbies", "fun", "cricket", "esports", "e-sports", "travel"], text: "Ahsaan enjoys coding, e-sports, cricket and travelling." },
    { keys: ["objective", "goal", "about", "who", "summary", "career"],
      text: "Ahsaan is a motivated MCA student specializing in Data Science, Analytics and Full-Stack Web Development, aiming to build data-driven applications and extract insights from complex datasets." },
    { keys: ["hello", "hey", "namaste"], text: "Hello! Ask me about Ahsaan's education, skills, projects, certification or contact details." },
    { keys: ["thank", "thanks"], text: "You're welcome! Anything else you'd like to know about Ahsaan?" }
  ];

  function answer(q) {
    const words = q.toLowerCase();
    let best = null, bestScore = 0;
    KB.forEach((item) => {
      const score = item.keys.reduce((s, k) => s + (k.length <= 3 ? (new RegExp("\\b" + k + "\\b").test(words) ? 1 : 0) : (words.includes(k) ? 1 : 0)), 0);
      if (score > bestScore) { best = item; bestScore = score; }
    });
    return best ? best.text : "I can answer questions about Ahsaan's education, skills, projects, certification, interests and contact details. Try one of the quick options above.";
  }

  function bubble(text, cls) {
    const d = document.createElement("div");
    d.className = cls; d.textContent = text;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  let busy = false;
  function ask(text) {
    const q = text.trim();
    if (!q || busy) return;
    busy = true;
    bubble(q, "user-msg");
    input.value = "";
    const typing = bubble("", "bot-msg typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    setTimeout(() => {
      typing.remove();
      bubble(answer(q), "bot-msg");
      busy = false;
    }, 600 + Math.random() * 500);
  }

  function setOpen(open) {
    box.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      if (!msgs.children.length) bubble("Hi! I'm Ahsaan's resume assistant. Pick a topic below or type a question.", "bot-msg");
      input.focus();
    }
  }
  toggle.addEventListener("click", () => setOpen(box.classList.contains("hidden")));
  $("#chat-close").addEventListener("click", () => { setOpen(false); toggle.focus(); });
  $("#chat-send").addEventListener("click", () => ask(input.value));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") ask(input.value); });
  $$(".chat-chips .chip").forEach((c) => c.addEventListener("click", () => ask(c.dataset.q)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.classList.contains("hidden")) setOpen(false); });
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = $("#to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => { btn.hidden = window.scrollY < 600; }, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));
}

/* ---------- Integration status badges ---------- */
function initStatus() {
  const set = (id, live, liveText, demoText) => {
    const el = $(id);
    if (!el) return;
    el.textContent = live ? liveText : demoText;
    el.classList.toggle("ok", live);
    el.classList.toggle("demo", !live);
  };
  set("#st-db", supabaseReady(), "Live", "Demo mode");
  set("#st-pay", razorpayReady(), "Live (test)", "Demo mode");
}