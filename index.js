const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || "ghazala_verify_123",
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE",
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID || "YOUR_PHONE_NUMBER_ID_HERE",
  AGENT_NUMBER: process.env.AGENT_NUMBER || "923306910910",
  ADMIN_SECRET: process.env.ADMIN_SECRET || "ghazala_admin_2026",
  BULK_SECRET: process.env.BULK_SECRET || "ghazala_bulk_secret_2024",
};

// ─── BATCH SCHEDULES (updatable via admin panel) ──────────────────────────────
let BATCHES = {
  german_a1: {
    onsite_weekday: [
      { days: "Mon, Wed, Fri", time: "11:00am - 01:00pm", teacher: "Miss Fizza" },
      { days: "Tue, Thu, Fri", time: "05:00pm - 07:00pm", teacher: "Sir Hateem" },
      { days: "Mon, Wed, Sat", time: "07:00pm - 09:00pm", teacher: "Miss Waniya" },
      { days: "Tue, Thu, Sun", time: "07:00pm - 09:00pm", teacher: "Miss Waniya" },
    ],
    onsite_intensive: [
      { days: "Mon - Thu", time: "05:00pm - 07:00pm", teacher: "Miss Waniya", note: "A1 Intensive" },
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

// ─── COURSE INFO ──────────────────────────────────────────────────────────────
const COURSES = {
  german: {
    name: "🇩🇪 German Language",
    emoji: "🇩🇪",
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
    name: "📝 IELTS Preparation",
    emoji: "📝",
    fees: [{ level: "Academic & General", mode: "Onsite/Online/Weekend", fee: "PKR 20,000" }],
    includes: "Study Material, Mock Tests, Computer-Based Prep, Course Notes, Certificate",
    duration: "As per batch",
  },
  pte: {
    name: "💻 PTE Academic",
    emoji: "💻",
    fees: [{ level: "Full Preparation", mode: "Onsite/Online", fee: "PKR 25,000" }],
    includes: "APEUni Premium, Practice Tests, Study Material, Performance Evaluation",
    duration: "1 Month (Mon-Sat)",
  },
  english: {
    name: "🗣️ Spoken English",
    emoji: "🗣️",
    fees: [{ level: "All Levels", mode: "Onsite", fee: "PKR 5,000/month" }],
    includes: "Grammar, Spoken Practice, Vocabulary, Pronunciation, Learning Material",
    duration: "As per batch",
  },
};

const INSTITUTE = {
  name: "Ghazala Institute",
  address: "F I 4/10 Block 5, Rashid Minhas Road, Gulshan-e-Iqbal, Karachi",
  phone: "03142230194",
  phone2: "03334429257",
  email: "info@ghazalainstituteoflanguages.com",
  maps: "https://maps.google.com/?q=Ghazala+Institute+Gulshan+e+Iqbal+Karachi",
  hours: "Mon-Sat, 9am - 7pm",
};

const STUDY_ABROAD_COUNTRIES = {
  germany: {
    name: "🇩🇪 Germany",
    info: "Top destination for German language students. Tuition-free public universities!\n\n📋 Requirements:\n• German B1/B2 certificate\n• Academic transcripts\n• Blocked account (€11,208)\n• Health insurance\n\n🎓 Programs: Bachelor, Master, Foundation Year",
  },
  uk: {
    name: "🇬🇧 United Kingdom",
    info: "World-class universities. IELTS required.\n\n📋 Requirements:\n• IELTS 6.0-7.0\n• Academic transcripts\n• Financial proof\n• SOP & LORs\n\n🎓 Programs: Bachelor, Master, Foundation Year",
  },
  canada: {
    name: "🇨🇦 Canada",
    info: "Great for work + study. IELTS required.\n\n📋 Requirements:\n• IELTS 6.0+\n• Academic transcripts\n• Financial proof\n• Study permit\n\n🎓 Programs: Bachelor, Master, Diploma",
  },
  australia: {
    name: "🇦🇺 Australia",
    info: "High quality education with work rights.\n\n📋 Requirements:\n• IELTS 6.0-6.5\n• Academic transcripts\n• Financial proof\n• Student visa (subclass 500)\n\n🎓 Programs: Bachelor, Master, Foundation Year",
  },
  usa: {
    name: "🇺🇸 USA",
    info: "World's top universities.\n\n📋 Requirements:\n• IELTS/TOEFL\n• SAT/GRE/GMAT\n• Academic transcripts\n• F-1 Student Visa\n\n🎓 Programs: Bachelor, Master",
  },
  italy: {
    name: "🇮🇹 Italy",
    info: "Affordable tuition with rich culture.\n\n📋 Requirements:\n• Italian/English language proof\n• Academic transcripts\n• Financial proof\n• Student visa\n\n🎓 Programs: Bachelor, Master, Foundation Year",
  },
  finland: {
    name: "🇫🇮 Finland",
    info: "Free education, high quality of life.\n\n📋 Requirements:\n• English proficiency\n• Academic transcripts\n• Financial proof\n• Residence permit\n\n🎓 Programs: Bachelor, Master",
  },
};

// ─── SESSION STORE ────────────────────────────────────────────────────────────
const sessions = {};
const humanHandover = new Set(); // numbers where human took over

function getSession(phone) {
  if (!sessions[phone]) sessions[phone] = { step: "main_menu", data: {} };
  return sessions[phone];
}

function resetSession(phone) {
  sessions[phone] = { step: "main_menu", data: {} };
}

// ─── WHATSAPP SENDER ──────────────────────────────────────────────────────────
async function sendMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      { messaging_product: "whatsapp", to, type: "text", text: { body } },
      { headers: { Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send error:", err.response?.data || err.message);
  }
}

async function sendButtons(to, bodyText, buttons) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp", to, type: "interactive",
        interactive: {
          type: "button", body: { text: bodyText },
          action: { buttons: buttons.slice(0, 3).map((b, i) => ({ type: "reply", reply: { id: `btn_${i}_${b.replace(/\s+/g, "_").toLowerCase()}`, title: b.substring(0, 20) } })) },
        },
      },
      { headers: { Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );
  } catch (err) {
    await sendMessage(to, bodyText + "\n\nReply with:\n" + buttons.map((b, i) => `${i + 1}. ${b}`).join("\n"));
  }
}

// ─── NOTIFY AGENT ─────────────────────────────────────────────────────────────
async function notifyAgent(studentNumber, studentData) {
  const msg =
    `🔔 *AGENT REQUIRED*\n\n` +
    `Student needs human assistance!\n\n` +
    `📱 *Student Number:* +${studentNumber}\n` +
    `👤 *Name:* ${studentData.name || "Not provided"}\n` +
    `📚 *Interest:* ${studentData.course || studentData.interested_course || "Not specified"}\n\n` +
    `Please reply to the student directly on WhatsApp.\n` +
    `Type *DONE ${studentNumber}* when finished.`;
  await sendMessage(CONFIG.AGENT_NUMBER, msg);
}

// ─── MENU FLOWS ───────────────────────────────────────────────────────────────
async function sendMainMenu(to) {
  resetSession(to);
  const msg =
    `👋 *Welcome to Ghazala Institute!*\n\n` +
    `🌍 Language Courses | ✈️ Study Abroad Consultancy\n\n` +
    `Please choose an option:`;
  await sendButtons(to, msg, ["📚 Courses & Fees", "✈️ Study Abroad", "📍 Location & Info"]);
  await sendButtons(to, "More options:", ["🎓 Admission Info", "🤝 Talk to Agent", "📋 Register Now"]);
}

async function sendCoursesMenu(to) {
  getSession(to).step = "courses_menu";
  await sendButtons(to, "📚 *Select a Course:*", ["🇩🇪 German", "📝 IELTS", "💻 PTE"]);
  await sendButtons(to, "More courses:", ["🗣️ Spoken English", "🏠 Main Menu"]);
}

async function sendCourseDetail(to, courseKey) {
  const course = COURSES[courseKey];
  if (!course) { await sendMainMenu(to); return; }

  const session = getSession(to);
  session.data.selected_course = courseKey;

  let feeText = `💰 *Fee Structure:*\n`;
  course.fees.forEach(f => { feeText += `• ${f.level} (${f.mode}): *${f.fee}*\n`; });

  const msg =
    `${course.emoji} *${course.name}*\n\n` +
    `⏱️ Duration: ${course.duration}\n\n` +
    feeText +
    `\n📦 *Includes:*\n${course.includes}\n\n` +
    `📋 Registration Fee: Rs. 2,000 (Non-refundable)\n` +
    `💡 Full fee paid at start of course`;

  await sendMessage(to, msg);
  await sendButtons(to, "What would you like to do?", ["🗓️ View Schedule", "📋 Register Now", "🏠 Main Menu"]);
}

async function sendSchedule(to, courseKey) {
  const session = getSession(to);
  const key = courseKey || session.data.selected_course;

  let msg = "";

  if (key === "german") {
    const b = BATCHES.german_a1;
    msg = `🗓️ *German A1 Batch Schedule*\n📅 Starting: ${b.start_date}\n\n`;
    msg += `🏫 *ONSITE WEEKDAY:*\n`;
    b.onsite_weekday.forEach(s => { msg += `• ${s.days} | ${s.time}${s.teacher ? ` | ${s.teacher}` : ""}\n`; });
    msg += `\n💪 *INTENSIVE (Onsite):*\n`;
    b.onsite_intensive.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
    msg += `\n💻 *ONLINE WEEKDAY:*\n`;
    b.online_weekday.forEach(s => { msg += `• ${s.days} | ${s.time}${s.teacher ? ` | ${s.teacher}` : ""}\n`; });
    msg += `\n🏫 *ONSITE WEEKEND:*\n`;
    b.onsite_weekend.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
    msg += `\n💻 *ONLINE WEEKEND:*\n`;
    b.online_weekend.forEach(s => { msg += `• ${s.days} | ${s.time} | ${s.teacher}\n`; });
  } else if (key === "ielts") {
    const b = BATCHES.ielts;
    msg = `🗓️ *IELTS Batch Schedule*\n\n`;
    msg += `💻 *ONLINE:*\n`;
    b.online.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
    msg += `\n🏫 *ONSITE:*\n`;
    b.onsite.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
  } else if (key === "pte") {
    const b = BATCHES.pte;
    msg = `🗓️ *PTE Batch Schedule*\n⏱️ Duration: 1 Month\n\n`;
    msg += `💻 *ONLINE:*\n`;
    b.online.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
    msg += `\n🏫 *ONSITE:*\n`;
    b.onsite.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
  } else if (key === "english") {
    const b = BATCHES.english;
    msg = `🗓️ *Spoken English Batch Schedule*\n\n`;
    msg += `🏫 *ONSITE:*\n`;
    b.onsite.forEach(s => { msg += `• ${s.days} | ${s.time}\n`; });
  }

  await sendMessage(to, msg);
  await sendButtons(to, "Ready to join?", ["📋 Register Now", "🏠 Main Menu", "📚 Other Courses"]);
}

async function sendLocation(to) {
  await sendMessage(
    to,
    `📍 *Ghazala Institute Location*\n\n` +
    `🏢 ${INSTITUTE.address}\n\n` +
    `📞 ${INSTITUTE.phone}\n` +
    `📞 ${INSTITUTE.phone2}\n` +
    `📧 ${INSTITUTE.email}\n\n` +
    `🕐 Office Hours: ${INSTITUTE.hours}\n\n` +
    `🗺️ Google Maps:\n${INSTITUTE.maps}`
  );
  await sendButtons(to, "Anything else?", ["📚 Courses", "🎓 Admission", "🏠 Main Menu"]);
}

async function sendAdmissionInfo(to) {
  const msg =
    `🎓 *Admission Process*\n\n` +
    `*Step 1:* Choose your course & level\n` +
    `*Step 2:* Pay registration fee (Rs. 2,000)\n` +
    `*Step 3:* Pay full course fee\n` +
    `*Step 4:* Start your classes!\n\n` +
    `📋 *Terms:*\n` +
    `• 50% refund within 3 days of enrollment\n` +
    `• No refund after 3 days\n` +
    `• Full fee paid at start\n\n` +
    `📞 ${INSTITUTE.phone} | ${INSTITUTE.phone2}`;
  await sendMessage(to, msg);
  await sendButtons(to, "Ready?", ["📋 Register Now", "📚 View Courses", "🏠 Main Menu"]);
}

// ─── STUDY ABROAD FLOW ────────────────────────────────────────────────────────
async function sendStudyAbroadMenu(to) {
  getSession(to).step = "study_abroad_country";
  const msg = `✈️ *Study Abroad Consultancy*\n\nWe help you study in 7 countries!\n\nSelect a country:`;
  await sendButtons(to, msg, ["🇩🇪 Germany", "🇬🇧 UK", "🇨🇦 Canada"]);
  await sendButtons(to, "More countries:", ["🇦🇺 Australia", "🇺🇸 USA", "🇮🇹 Italy / 🇫🇮 Finland"]);
}

async function sendCountryInfo(to, countryKey) {
  const country = STUDY_ABROAD_COUNTRIES[countryKey];
  if (!country) { await sendStudyAbroadMenu(to); return; }

  const session = getSession(to);
  session.data.study_country = countryKey;

  await sendMessage(to, `${country.name}\n\n${country.info}`);
  await sendButtons(to, "Want to apply?", ["📋 Start Application", "🌍 Other Countries", "🏠 Main Menu"]);
}

// ─── STUDENT PROFILE COLLECTION (Study Abroad) ───────────────────────────────
async function startStudyAbroadProfile(to) {
  const session = getSession(to);
  session.step = "sa_name";
  await sendMessage(to, `📋 *Study Abroad Application*\n\nLet's build your profile!\n\n👤 Please enter your *full name*:`);
}

async function handleStudyAbroadFlow(to, text, session) {
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
      await sendButtons(to, "More options:", ["Master's", "PhD"]);
      break;
    case "sa_education":
      session.data.sa_education = text;
      session.step = "sa_grade";
      await sendMessage(to, `📊 Enter your *CGPA or Grade/Percentage*:\n(e.g. 3.5/4.0 or 75%)`);
      break;
    case "sa_grade":
      session.data.sa_grade = text;
      session.step = "sa_language";
      await sendButtons(to, `🌐 *Language Proficiency:*`, ["IELTS Done", "PTE Done", "No Certificate Yet"]);
      await sendButtons(to, "More options:", ["German Certificate", "Currently Preparing"]);
      break;
    case "sa_language":
      session.data.sa_language = text;
      session.step = "sa_program";
      await sendButtons(to, `🎓 *Interested Program Level:*`, ["Foundation Year", "Bachelor's", "Master's"]);
      break;
    case "sa_program":
      session.data.sa_program = text;
      session.step = "sa_done";

      const profile =
        `✅ *Application Received!*\n\n` +
        `👤 Name: ${session.data.sa_name}\n` +
        `📱 Phone: ${session.data.sa_phone}\n` +
        `🌍 Country: ${session.data.study_country || "Not specified"}\n` +
        `📚 Education: ${session.data.sa_education}\n` +
        `📊 Grade: ${session.data.sa_grade}\n` +
        `🌐 Language: ${session.data.sa_language}\n` +
        `🎓 Program: ${session.data.sa_program}\n\n` +
        `Our counselor will contact you within 24 hours!\n` +
        `📞 ${INSTITUTE.phone}`;

      await sendMessage(to, profile);

      // Notify agent
      await notifyAgent(to, { name: session.data.sa_name, course: `Study Abroad - ${session.data.study_country} - ${session.data.sa_program}` });
      await sendMainMenu(to);
      break;
  }
}

// ─── REGISTRATION FLOW ────────────────────────────────────────────────────────
async function startRegistration(to) {
  const session = getSession(to);
  session.step = "reg_name";
  await sendMessage(to, `📋 *Registration Form*\n\nGreat! Let's get you enrolled. 😊\n\n👤 Please enter your *full name*:`);
}

async function handleRegistrationFlow(to, text, session) {
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
      session.step = "reg_done";

      const msg =
        `✅ *Registration Received!*\n\n` +
        `👤 Name: ${session.data.name}\n` +
        `📱 Phone: ${session.data.phone}\n` +
        `📚 Course: ${session.data.interested_course}\n` +
        `🏫 Mode: ${session.data.mode}\n\n` +
        `Our team will contact you shortly!\n` +
        `📞 ${INSTITUTE.phone} | ${INSTITUTE.phone2}`;

      await sendMessage(to, msg);
      await notifyAgent(to, session.data);
      await sendMainMenu(to);
      break;
  }
}

// ─── HUMAN HANDOVER ───────────────────────────────────────────────────────────
async function requestAgent(to) {
  const session = getSession(to);
  humanHandover.add(to);

  await sendMessage(
    to,
    `🤝 *Connecting you to an agent...*\n\n` +
    `Our team will respond shortly!\n\n` +
    `⏰ Available: ${INSTITUTE.hours}\n` +
    `📞 Or call directly: ${INSTITUTE.phone}\n\n` +
    `Type *menu* anytime to go back to the bot.`
  );

  await notifyAgent(to, session.data);
}

// ─── MESSAGE HANDLER ──────────────────────────────────────────────────────────
async function handleMessage(from, messageObj) {
  let text = "";
  let btnTitle = "";

  if (messageObj.type === "text") {
    text = messageObj.text?.body?.trim() || "";
  } else if (messageObj.type === "interactive") {
    if (messageObj.interactive?.type === "button_reply") {
      btnTitle = messageObj.interactive.button_reply.title || "";
      text = btnTitle;
    }
  }

  const lower = text.toLowerCase();
  const session = getSession(from);

  // Agent checking for DONE command
  if (from === CONFIG.AGENT_NUMBER && lower.startsWith("done ")) {
    const studentNum = lower.replace("done ", "").trim();
    humanHandover.delete(studentNum);
    await sendMessage(CONFIG.AGENT_NUMBER, `✅ Handover ended for ${studentNum}`);
    await sendMessage(studentNum, `✅ Our agent has finished assisting you.\n\nType *menu* to continue with the bot.`);
    return;
  }

  // If human handover active — only allow "menu" to resume bot
  if (humanHandover.has(from)) {
    if (["menu", "main menu", "bot"].includes(lower)) {
      humanHandover.delete(from);
      await sendMainMenu(from);
    } else {
      // Forward message to agent
      await sendMessage(CONFIG.AGENT_NUMBER, `💬 *Message from student +${from}:*\n${text}`);
    }
    return;
  }

  // Global reset keywords
  if (["hi", "hello", "hey", "start", "menu", "main menu", "help", "🏠 main menu"].includes(lower)) {
    await sendMainMenu(from); return;
  }

  // Study abroad profile flow
  if (["sa_name","sa_phone","sa_education","sa_grade","sa_language","sa_program"].includes(session.step)) {
    await handleStudyAbroadFlow(from, text, session); return;
  }

  // Registration flow
  if (["reg_name","reg_phone","reg_course","reg_mode"].includes(session.step)) {
    await handleRegistrationFlow(from, text, session); return;
  }

  // Button/keyword routing
  if (lower.includes("courses") || lower.includes("fees") || lower.includes("german") || lower.includes("ielts") || lower.includes("pte") || lower.includes("english") || lower.includes("other courses")) {
    if (lower.includes("🇩🇪") || lower.includes("german")) { await sendCourseDetail(from, "german"); }
    else if (lower.includes("ielts") || lower.includes("📝")) { await sendCourseDetail(from, "ielts"); }
    else if (lower.includes("pte") || lower.includes("💻")) { await sendCourseDetail(from, "pte"); }
    else if (lower.includes("english") || lower.includes("spoken") || lower.includes("🗣️")) { await sendCourseDetail(from, "english"); }
    else { await sendCoursesMenu(from); }
  }
  else if (lower.includes("schedule") || lower.includes("batch") || lower.includes("timing") || lower.includes("slot")) {
    const key = session.data.selected_course || "german";
    await sendSchedule(from, key);
  }
  else if (lower.includes("study abroad") || lower.includes("✈️")) {
    await sendStudyAbroadMenu(from);
  }
  else if (lower.includes("🇩🇪 germany") || lower.includes("germany")) { await sendCountryInfo(from, "germany"); }
  else if (lower.includes("uk") || lower.includes("🇬🇧")) { await sendCountryInfo(from, "uk"); }
  else if (lower.includes("canada") || lower.includes("🇨🇦")) { await sendCountryInfo(from, "canada"); }
  else if (lower.includes("australia") || lower.includes("🇦🇺")) { await sendCountryInfo(from, "australia"); }
  else if (lower.includes("usa") || lower.includes("🇺🇸")) { await sendCountryInfo(from, "usa"); }
  else if (lower.includes("italy") || lower.includes("finland") || lower.includes("🇮🇹") || lower.includes("🇫🇮")) { await sendCountryInfo(from, "italy"); }
  else if (lower.includes("start application") || lower.includes("apply")) { await startStudyAbroadProfile(from); }
  else if (lower.includes("location") || lower.includes("address") || lower.includes("📍")) { await sendLocation(from); }
  else if (lower.includes("admission") || lower.includes("🎓")) { await sendAdmissionInfo(from); }
  else if (lower.includes("register") || lower.includes("📋")) { await startRegistration(from); }
  else if (lower.includes("agent") || lower.includes("human") || lower.includes("talk") || lower.includes("🤝")) { await requestAgent(from); }
  else {
    await sendMessage(from, `Sorry, I didn't understand that. 😊\n\nType *menu* to see all options.`);
    await sendMainMenu(from);
  }
}

// ─── WEBHOOK ──────────────────────────────────────────────────────────────────
app.get("/webhook", (req, res) => {
  if (req.query["hub.mode"] === "subscribe" && req.query["hub.verify_token"] === CONFIG.VERIFY_TOKEN) {
    res.status(200).send(req.query["hub.challenge"]);
  } else { res.sendStatus(403); }
});

app.post("/webhook", (req, res) => {
  res.sendStatus(200);
  try {
    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!messages?.length) return;
    handleMessage(messages[0].from, messages[0]);
  } catch (err) { console.error("Webhook error:", err); }
});

// ─── ADMIN API (update batches) ───────────────────────────────────────────────
app.post("/admin/update-batches", (req, res) => {
  const { secret, batches } = req.body;
  if (secret !== CONFIG.ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (batches) {
    Object.assign(BATCHES, batches);
    res.json({ success: true, message: "Batches updated!" });
  } else {
    res.status(400).json({ error: "No batch data provided" });
  }
});

app.get("/admin/batches", (req, res) => {
  const { secret } = req.query;
  if (secret !== CONFIG.ADMIN_SECRET) return res.status(401).json({ error: "Unauthorized" });
  res.json(BATCHES);
});

// ─── BULK MESSAGE ─────────────────────────────────────────────────────────────
app.post("/send-bulk", async (req, res) => {
  const { numbers, message, secret } = req.body;
  if (secret !== CONFIG.BULK_SECRET) return res.status(401).json({ error: "Unauthorized" });
  if (!Array.isArray(numbers) || !message) return res.status(400).json({ error: "numbers and message required" });

  const results = [];
  for (const number of numbers) {
    try {
      await sendMessage(number, message);
      results.push({ number, status: "sent" });
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      results.push({ number, status: "failed" });
    }
  }
  res.json({ sent: results.length, results });
});

app.get("/", (req, res) => res.json({ status: "🚀 Ghazala Institute Bot Running!", version: "2.0" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot v2.0 running on port ${PORT}`));
