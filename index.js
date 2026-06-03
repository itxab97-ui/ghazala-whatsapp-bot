const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const CONFIG = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || "ghazala_verify_123",
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE",
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID || "YOUR_PHONE_NUMBER_ID_HERE",
  AGENT_NUMBER: process.env.AGENT_NUMBER || "923306910910",
  ADMIN_SECRET: process.env.ADMIN_SECRET || "ghazala_admin_2026",
  BULK_SECRET: process.env.BULK_SECRET || "ghazala_bulk_secret_2024",
};

let BATCHES = {
  german_a1: {
    onsite_weekday: [
      { days: "Mon, Wed, Fri", time: "11:00am - 01:00pm", teacher: "Miss Fizza" },
      { days: "Tue, Thu, Fri", time: "05:00pm - 07:00pm", teacher: "Sir Hateem" },
      { days: "Mon, Wed, Sat", time: "07:00pm - 09:00pm", teacher: "Miss Waniya" },
      { days: "Tue, Thu, Sun", time: "07:00pm - 09:00pm", teacher: "Miss Waniya" },
    ],
    onsite_intensive: [
      { days: "Mon - Thu", time: "05:00pm - 07:00pm", teacher: "Miss Waniya" },
    ],
    online_weekday: [
      { days: "Mon - Thu", time: "05:00pm - 06:00pm", teacher: "" },
      { days: "Mon - Thu", time: "10:00pm - 11:00pm", teacher: "Sir Mustafa" },
      { days: "Mon - Thu", time: "11:00pm - 12:00am", teacher: "Sir Abdullah" },
    ],
    onsite_weekend: [
      { days: "Sat & Sun", time: "01:00pm - 03:00pm", teacher: "Sir Mustafa" },
      { days: "Sat & Sun", time: "03:00pm - 05:00pm", teacher: "Miss Wania" },
    ],
    online_weekend: [
      { days: "Sat & Sun", time: "04:00pm - 06:00pm", teacher: "Miss Fizza" },
      { days: "Sat & Sun", time: "07:00pm - 09:00pm", teacher: "Sir Mustafa" },
    ],
    start_date: "Monday, 08-June-2026",
  },
  ielts: {
    online: [
      { days: "Mon - Sat", time: "02:00pm - 03:00pm" },
      { days: "Mon - Sat", time: "05:00pm - 06:00pm" },
    ],
    onsite: [
      { days: "Mon - Sat", time: "07:00pm - 08:00pm" },
      { days: "Mon - Sat", time: "08:00pm - 09:00pm" },
    ],
  },
  pte: {
    online: [{ days: "Mon - Sat", time: "12:00pm - 01:00pm" }],
    onsite: [{ days: "Mon - Sat", time: "08:00pm - 09:00pm" }],
  },
  english: {
    onsite: [{ days: "Mon - Sat", time: "06:00pm - 07:00pm" }],
  },
};

const COURSES = {
  german: {
    name: "German Language", emoji: "🇩🇪",
    fees: [
      { level: "A1 Lower Beginner", mode: "Onsite", fee: "PKR 38,000" },
      { level: "A1 Lower Beginner", mode: "Online", fee: "PKR 35,000" },
      { level: "A1 Intensive", mode: "Onsite", fee: "PKR 45,000" },
      { level: "A2 Upper Beginner", mode: "Onsite/Online", fee: "PKR 42,000" },
      { level: "B1 Intermediate", mode: "Onsite/Online", fee: "PKR 45,000" },
      { level: "B2.1 Upper Inter.", mode: "Onsite/Online", fee: "PKR 50,000" },
      { level: "B2.2 Upper Inter.", mode: "Onsite/Online", fee: "PKR 50,000" },
    ],
    includes: "Books, Course material, Registration charges\n✅ No hidden charges",
    duration: "3 months per level",
  },
  ielts: {
    name: "IELTS Preparation", emoji: "📝",
    fees: [{ level: "Academic & General", mode: "Onsite/Online/Weekend", fee: "PKR 20,000" }],
    includes: "Study Material, Mock Tests, Computer-Based Prep, Course Notes, Certificate",
    duration: "As per batch",
  },
  pte: {
    name: "PTE Academic", emoji: "💻",
    fees: [{ level: "Full Preparation", mode: "Onsite/Online", fee: "PKR 25,000" }],
    includes: "APEUni Premium, Practice Tests, Study Material, Performance Evaluation",
    duration: "1 Month (Mon-Sat)",
  },
  english: {
    name: "Spoken English", emoji: "🗣️",
    fees: [{ level: "All Levels", mode: "Onsite", fee: "PKR 5,000/month" }],
    includes: "Grammar, Spoken Practice, Vocabulary, Pronunciation, Learning Material",
    duration: "As per batch",
  },
};

const INSTITUTE = {
  name: "Ghazala Institute",
  address: "F I 4/10 Block 5, Rashid Minhas Road, Gulshan-e-Iqbal, Karachi",
  phone: "03142230194", phone2: "03334429257",
  email: "info@ghazalainstituteoflanguages.com",
  maps: "https://maps.google.com/?q=Ghazala+Institute+Gulshan+e+Iqbal+Karachi",
  hours: "Mon-Sat, 9am - 7pm",
};

const STUDY_ABROAD = {
  germany: { name: "🇩🇪 Germany", info: "Tuition-free public universities!\n\n📋 Requirements:\n• German B1/B2 certificate\n• Academic transcripts\n• Blocked account (€11,208)\n• Health insurance\n\n🎓 Programs: Bachelor, Master, Foundation Year" },
  uk: { name: "🇬🇧 United Kingdom", info: "World-class universities.\n\n📋 Requirements:\n• IELTS 6.0-7.0\n• Academic transcripts\n• Financial proof\n• SOP & LORs\n\n🎓 Programs: Bachelor, Master, Foundation Year" },
  canada: { name: "🇨🇦 Canada", info: "Great for work + study.\n\n📋 Requirements:\n• IELTS 6.0+\n• Academic transcripts\n• Financial proof\n• Study permit\n\n🎓 Programs: Bachelor, Master, Diploma" },
  australia: { name: "🇦🇺 Australia", info: "High quality with work rights.\n\n📋 Requirements:\n• IELTS 6.0-6.5\n• Academic transcripts\n• Financial proof\n• Student visa (subclass 500)\n\n🎓 Programs: Bachelor, Master, Foundation Year" },
  usa: { name: "🇺🇸 USA", info: "World's top universities.\n\n📋 Requirements:\n• IELTS/TOEFL\n• SAT/GRE/GMAT\n• Academic transcripts\n• F-1 Student Visa\n\n🎓 Programs: Bachelor, Master" },
  italy: { name: "🇮🇹 Italy", info: "Affordable tuition, rich culture.\n\n📋 Requirements:\n• Language proof\n• Academic transcripts\n• Financial proof\n• Student visa\n\n🎓 Programs: Bachelor, Master, Foundation Year" },
  finland: { name: "🇫🇮 Finland", info: "Free education, high quality of life.\n\n📋 Requirements:\n• English proficiency\n• Academic transcripts\n• Financial proof\n• Residence permit\n\n🎓 Programs: Bachelor, Master" },
};

const sessions = {};
const humanHandover = new Set();

function getSession(phone) {
  if (!sessions[phone]) sessions[phone] = { step: "main_menu", data: {} };
  return sessions[phone];
}

function resetSession(phone) {
  sessions[phone] = { step: "main_menu", data: {} };
}

async function sendMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to, type: "text", text: { body } },
      { headers: { Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );
  } catch (err) { console.error("Send error:", err.response?.data || err.message); }
}

async function sendButtons(to, bodyText, buttons) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp", to, type: "interactive",
        interactive: {
          type: "button", body: { text: bodyText },
          action: { buttons: buttons.slice(0, 3).map((b, i) => ({ type: "reply", reply: { id: `btn_${i}_${b.replace(/[^a-zA-Z0-9]/g, "").toLowerCase().substring(0,20)}`, title: b.substring(0, 20) } })) },
        },
      },
      { headers: { Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await sendMessage(to, bodyText + "\n\n" + buttons.map((b, i) => `${i + 1}. ${b}`).join("\n"));
  }
}

async function notifyAgent(studentNumber, data) {
  const msg = `🔔 *AGENT REQUIRED*\n\nStudent needs help!\n\n📱 Number: +${studentNumber}\n👤 Name: ${data.name || data.sa_name || "Not provided"}\n📚 Interest: ${data.course || data.interested_course || data.sa_program || "Not specified"}\n\nReply to student directly.\nType *DONE ${studentNumber}* when finished.`;
  await sendMessage(CONFIG.AGENT_NUMBER, msg);
}

// ── SCREENS ──────────────────────────────────────────────────────────────────

async function showMainMenu(to) {
  resetSession(to);
  await sendButtons(to,
    `👋 *Welcome to Ghazala Institute!*

🌍 Language Courses | ✈️ Study Abroad Consultancy

Please choose an option:`,
    ["📚 Courses & Fees", "✈️ Study Abroad", "📍 Location & Info"]
  );
  await sendButtons(to, "More options:", ["🎓 Admission Info", "🤝 Talk to Agent", "📋 Register Now"]);
}

async function showCoursesMenu(to) {
  getSession(to).step = "courses_menu";
  await sendButtons(to, "📚 *Select a Course:*", ["🇩🇪 German", "📝 IELTS", "💻 PTE"]);
  await sendButtons(to, "More courses:", ["🗣️ Spoken English", "🏠 Main Menu"]);
}

async function showCourseDetail(to, key) {
  const c = COURSES[key];
  if (!c) { await showCoursesMenu(to); return; }
  const session = getSession(to);
  session.data.selected_course = key;

  let feeText = `💰 *Fee Structure:*\n`;
  c.fees.forEach(f => { feeText += `• ${f.level} (${f.mode}): *${f.fee}*\n`; });

  await sendMessage(to,
    `${c.emoji} *${c.name}*\n\n⏱️ Duration: ${c.duration}\n\n${feeText}\n📦 *Includes:*\n${c.includes}\n\n📋 Registration Fee: Rs. 2,000 (Non-refundable)`
  );
  await sendButtons(to, "What would you like?", ["🗓️ View Schedule", "📋 Register Now", "🏠 Main Menu"]);
}

async function showSchedule(to, key) {
  const session = getSession(to);
  const courseKey = key || session.data.selected_course || "german";
  let msg = "";

  if (courseKey === "german") {
    const b = BATCHES.german_a1;
    msg = `🗓️ *German A1 Schedule*\n📅 Starting: ${b.start_date}\n\n`;
    msg += `🏫 *ONSITE WEEKDAY:*\n`;
    b.onsite_weekday.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
    msg += `\n💪 *INTENSIVE:*\n`;
    b.onsite_intensive.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
    msg += `\n💻 *ONLINE WEEKDAY:*\n`;
    b.online_weekday.forEach(s => { msg += `• ${s.days} | ${s.time}${s.teacher ? ` | ${s.teacher}` : ""}\n`; });
    msg += `\n🏫 *ONSITE WEEKEND:*\n`;
    b.onsite_weekend.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
    msg += `\n💻 *ONLINE WEEKEND:*\n`;
    b.online_weekend.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
  } else if (courseKey === "ielts") {
    const b = BATCHES.ielts;
    msg = `🗓️ *IELTS Schedule*\n\n💻 *ONLINE:*\n`;
    b.online.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
    msg += `\n🏫 *ONSITE:*\n`;
    b.onsite.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
  } else if (courseKey === "pte") {
    const b = BATCHES.pte;
    msg = `🗓️ *PTE Schedule* (1 Month)\n\n💻 *ONLINE:*\n`;
    b.online.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
    msg += `\n🏫 *ONSITE:*\n`;
    b.onsite.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
  } else if (courseKey === "english") {
    const b = BATCHES.english;
    msg = `🗓️ *Spoken English Schedule*\n\n🏫 *ONSITE:*\n`;
    b.onsite.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
  }

  await sendMessage(to, msg);
  await sendButtons(to, "Ready to join?", ["📋 Register Now", "📚 Other Courses", "🏠 Main Menu"]);
}

async function showStudyAbroadMenu(to) {
  getSession(to).step = "study_abroad_country";
  await sendButtons(to, "✈️ *Study Abroad*\n\nSelect a country:", ["🇩🇪 Germany", "🇬🇧 UK", "🇨🇦 Canada"]);
  await sendButtons(to, "More countries:", ["🇦🇺 Australia", "🇺🇸 USA", "🇮🇹 Italy/🇫🇮 Finland"]);
}

async function showCountryInfo(to, key) {
  const c = STUDY_ABROAD[key];
  if (!c) { await showStudyAbroadMenu(to); return; }
  getSession(to).data.study_country = key;
  await sendMessage(to, `${c.name}\n\n${c.info}`);
  await sendButtons(to, "Want to apply?", ["📋 Apply Now", "🌍 Other Countries", "🏠 Main Menu"]);
}

async function showLocation(to) {
  await sendMessage(to,
    `📍 *Ghazala Institute*\n\n🏢 ${INSTITUTE.address}\n\n📞 ${INSTITUTE.phone}\n📞 ${INSTITUTE.phone2}\n📧 ${INSTITUTE.email}\n\n🕐 ${INSTITUTE.hours}\n\n🗺️ ${INSTITUTE.maps}`
  );
  await sendButtons(to, "Anything else?", ["📚 Courses", "🏠 Main Menu", "🤝 Talk to Agent"]);
}

async function showAdmission(to) {
  await sendMessage(to,
    `🎓 *Admission Process*\n\n*Step 1:* Choose your course\n*Step 2:* Pay registration fee (Rs. 2,000)\n*Step 3:* Pay full course fee\n*Step 4:* Start classes!\n\n📋 *Terms:*\n• 50% refund within 3 days\n• No refund after 3 days\n• Full fee paid at start\n\n📞 ${INSTITUTE.phone}`
  );
  await sendButtons(to, "Ready?", ["📋 Register Now", "📚 View Courses", "🏠 Main Menu"]);
}

// ── REGISTRATION FLOW ─────────────────────────────────────────────────────────
async function startRegistration(to) {
  const session = getSession(to);
  session.step = "reg_name";
  await sendMessage(to, `📋 *Registration Form*\n\nLet's get you enrolled! 😊\n\n👤 Please enter your *full name*:`);
}

async function handleRegistration(to, text, session) {
  switch (session.step) {
    case "reg_name":
      session.data.name = text;
      session.step = "reg_phone";
      await sendMessage(to, `Nice to meet you, *${text}*! 😊\n\n📱 Enter your *phone number*:`);
      break;
    case "reg_phone":
      session.data.phone = text;
      session.step = "reg_course";
      await sendButtons(to, `📚 *Which course?*`, ["🇩🇪 German", "📝 IELTS", "💻 PTE"]);
      await sendButtons(to, "More:", ["🗣️ Spoken English"]);
      break;
    case "reg_course":
      session.data.interested_course = text;
      session.step = "reg_mode";
      await sendButtons(to, `🏫 *Onsite or Online?*`, ["Onsite", "Online", "Not Sure Yet"]);
      break;
    case "reg_mode":
      session.data.mode = text;
      session.step = "main_menu";
      await sendMessage(to,
        `✅ *Registration Received!*\n\n👤 Name: ${session.data.name}\n📱 Phone: ${session.data.phone}\n📚 Course: ${session.data.interested_course}\n🏫 Mode: ${session.data.mode}\n\nOur team will contact you shortly!\n📞 ${INSTITUTE.phone}`
      );
      await notifyAgent(to, session.data);
      await showMainMenu(to);
      break;
  }
}

// ── STUDY ABROAD PROFILE ──────────────────────────────────────────────────────
async function startStudyAbroadProfile(to) {
  const session = getSession(to);
  session.step = "sa_name";
  await sendMessage(to, `📋 *Study Abroad Application*\n\nLet's build your profile!\n\n👤 Enter your *full name*:`);
}

async function handleStudyAbroadProfile(to, text, session) {
  switch (session.step) {
    case "sa_name":
      session.data.sa_name = text;
      session.step = "sa_phone";
      await sendMessage(to, `Nice to meet you, *${text}*! 😊\n\n📱 Enter your *phone number*:`);
      break;
    case "sa_phone":
      session.data.sa_phone = text;
      session.step = "sa_education";
      await sendButtons(to, `📚 *Last Education Level:*`, ["Matriculation", "Intermediate", "Bachelor's"]);
      await sendButtons(to, "More:", ["Master's", "PhD"]);
      break;
    case "sa_education":
      session.data.sa_education = text;
      session.step = "sa_grade";
      await sendMessage(to, `📊 Enter your *CGPA or Grade/Percentage*:\n(e.g. 3.5/4.0 or 75%)`);
      break;
    case "sa_grade":
      session.data.sa_grade = text;
      session.step = "sa_language";
      await sendButtons(to, `🌐 *Language Certificate:*`, ["IELTS Done", "PTE Done", "No Certificate"]);
      await sendButtons(to, "More:", ["German Certificate", "Currently Preparing"]);
      break;
    case "sa_language":
      session.data.sa_language = text;
      session.step = "sa_program";
      await sendButtons(to, `🎓 *Interested Program:*`, ["Foundation Year", "Bachelor's", "Master's"]);
      break;
    case "sa_program":
      session.data.sa_program = text;
      session.step = "main_menu";
      await sendMessage(to,
        `✅ *Application Received!*\n\n👤 Name: ${session.data.sa_name}\n📱 Phone: ${session.data.sa_phone}\n🌍 Country: ${session.data.study_country || "Not specified"}\n📚 Education: ${session.data.sa_education}\n📊 Grade: ${session.data.sa_grade}\n🌐 Language: ${session.data.sa_language}\n🎓 Program: ${session.data.sa_program}\n\nOur counselor will contact you within 24 hours!\n📞 ${INSTITUTE.phone}`
      );
      await notifyAgent(to, { name: session.data.sa_name, course: `Study Abroad - ${session.data.study_country} - ${session.data.sa_program}` });
      await showMainMenu(to);
      break;
  }
}

async function requestAgent(to) {
  humanHandover.add(to);
  const session = getSession(to);
  await sendMessage(to,
    `🤝 *Connecting you to an agent...*\n\nOur team will respond shortly!\n\n⏰ ${INSTITUTE.hours}\n📞 ${INSTITUTE.phone}\n\nType *menu* anytime to go back to bot.`
  );
  await notifyAgent(to, session.data);
}

// ── MAIN ROUTER ───────────────────────────────────────────────────────────────
// This is the key function — every button press is handled here FIRST
// before any flow check. This ensures buttons always work correctly.

function isButtonPress(messageObj) {
  return messageObj.type === "interactive";
}

async function routeButton(to, text, session) {
  const t = text.toLowerCase();

  // Main menu triggers
  if (["hi","hello","hey","start","menu","main menu","help","🏠 main menu"].includes(t)) {
    await showMainMenu(to); return true;
  }
  if (t.includes("courses") || t.includes("fees")) { await showCoursesMenu(to); return true; }
  if (t.includes("🇩🇪") || t.includes("german")) {
    if (t.includes("germany")) { await showCountryInfo(to, "germany"); }
    else { await showCourseDetail(to, "german"); }
    return true;
  }
  if (t.includes("ielts") || t.includes("📝")) { await showCourseDetail(to, "ielts"); return true; }
  if (t.includes("pte") || t.includes("💻")) { await showCourseDetail(to, "pte"); return true; }
  if (t.includes("spoken") || t.includes("english") || t.includes("🗣️")) { await showCourseDetail(to, "english"); return true; }
  if (t.includes("schedule") || t.includes("batch") || t.includes("🗓️")) { await showSchedule(to, session.data.selected_course); return true; }
  if (t.includes("other courses") || t.includes("more courses") || t.includes("📚")) { await showCoursesMenu(to); return true; }
  if (t.includes("study abroad") || t.includes("✈️")) { await showStudyAbroadMenu(to); return true; }
  if (t.includes("uk") || t.includes("🇬🇧")) { await showCountryInfo(to, "uk"); return true; }
  if (t.includes("canada") || t.includes("🇨🇦")) { await showCountryInfo(to, "canada"); return true; }
  if (t.includes("australia") || t.includes("🇦🇺")) { await showCountryInfo(to, "australia"); return true; }
  if (t.includes("usa") || t.includes("🇺🇸")) { await showCountryInfo(to, "usa"); return true; }
  if (t.includes("italy") || t.includes("finland") || t.includes("🇮🇹") || t.includes("🇫🇮")) { await showCountryInfo(to, "italy"); return true; }
  if (t.includes("other countries") || t.includes("🌍")) { await showStudyAbroadMenu(to); return true; }
  if (t.includes("apply now") || t.includes("start application")) { await startStudyAbroadProfile(to); return true; }
  if (t.includes("location") || t.includes("address") || t.includes("📍") || t.includes("location & info")) { await showLocation(to); return true; }
  if (t.includes("admission") || t.includes("🎓")) { await showAdmission(to); return true; }
  if (t.includes("register") || t.includes("📋")) { await startRegistration(to); return true; }
  if (t.includes("agent") || t.includes("talk") || t.includes("🤝") || t.includes("human")) { await requestAgent(to); return true; }

  return false; // not matched
}

async function handleMessage(from, messageObj) {
  let text = "";

  if (messageObj.type === "text") {
    text = messageObj.text?.body?.trim() || "";
  } else if (messageObj.type === "interactive") {
    if (messageObj.interactive?.type === "button_reply") {
      text = messageObj.interactive.button_reply.title || "";
    } else if (messageObj.interactive?.type === "list_reply") {
      text = messageObj.interactive.list_reply.title || "";
    }
  }

  const session = getSession(from);

  // Agent DONE command
  if (from === CONFIG.AGENT_NUMBER && text.toLowerCase().startsWith("done ")) {
    const num = text.toLowerCase().replace("done ", "").trim();
    humanHandover.delete(num);
    await sendMessage(CONFIG.AGENT_NUMBER, `✅ Handover ended for ${num}`);
    await sendMessage(num, `✅ Agent has finished. Type *menu* to continue.`);
    return;
  }

  // Human handover active
  if (humanHandover.has(from)) {
    if (["menu", "main menu", "bot"].includes(text.toLowerCase())) {
      humanHandover.delete(from);
      await showMainMenu(from);
    } else {
      await sendMessage(CONFIG.AGENT_NUMBER, `💬 *From +${from}:*\n${text}`);
    }
    return;
  }

  // ── KEY LOGIC: Button press ALWAYS routes directly — ignores any active flow ──
  if (isButtonPress(messageObj)) {
    resetSession(from);
    const handled = await routeButton(from, text, getSession(from));
    if (!handled) await showMainMenu(from);
    return;
  }

  // Free text — check global keywords first
  const handled = await routeButton(from, text, session);
  if (handled) return;

  // Free text during a flow
  const step = session.step;

  if (["reg_name","reg_phone","reg_course","reg_mode"].includes(step)) {
    await handleRegistration(from, text, session); return;
  }
  if (["sa_name","sa_phone","sa_education","sa_grade","sa_language","sa_program"].includes(step)) {
    await handleStudyAbroadProfile(from, text, session); return;
  }

  // Fallback
  await sendMessage(from, `Sorry, I didn't understand. 😊\n\nType *menu* to see all options.`);
  await showMainMenu(from);
}

// ── WEBHOOK ───────────────────────────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === CONFIG.VERIFY_TOKEN) {
    res.status(200).send(req.query["hub.challenge"]);
  } else res.sendStatus(403);
});

app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  try {
    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages?.length) return;
    handleMessage(messages[0].from, messages[0]);
  } catch (err) { console.error("Webhook error:", err); }
});

app.post("/admin/update-batches", (req, res) => {
  const { secret, batches } = req.body;
  if (secret !== CONFIG.ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (batches) { Object.assign(BATCHES, batches); res.json({ success: true }); }
  else res.status(400).json({ error: "No batch data" });
});

app.get("/admin/batches", (req, res) => {
  if (req.query.secret !== CONFIG.ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  res.json(BATCHES);
});

app.post("/send-bulk", async (req, res) => {
  const { numbers, message, secret } = req.body;
  if (secret !== CONFIG.BULK_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (!Array.isArray(numbers) || !message) return res.status(400).json({ error: "numbers and message required" });
  const results = [];
  for (const n of numbers) {
    try { await sendMessage(n, message); results.push({ n, status: "sent" }); await new Promise(r => setTimeout(r, 500)); }
    catch { results.push({ n, status: "failed" }); }
  }
  res.json({ sent: results.length, results });
});

app.get("/", (req, res) => res.json({ status: "🚀 Ghazala Institute Bot v3.0 Running!" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot v3.0 on port ${PORT}`));
