const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONFIG = {
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || "ghazala_verify_123",
  ACCESS_TOKEN: process.env.ACCESS_TOKEN || "YOUR_ACCESS_TOKEN_HERE",
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID || "YOUR_PHONE_NUMBER_ID_HERE",
};

// ─── INSTITUTE INFO ───────────────────────────────────────────────────────────
const INSTITUTE = {
  name: "Ghazala Institute",
  address: "F I 4/10 Block 5, Rashid Minhas Road, Gulshan-e-Iqbal, Karachi",
  email: "info@ghazalainstituteoflanguages.com",
  phone: "03142230194",
  courses: {
    german: {
      name: "German Language",
      levels: "A1, A2, B1, B2, C1, C2",
      duration: "3 months per level",
      fee: "PKR 8,000/month",
    },
    ielts: {
      name: "IELTS Preparation",
      levels: "Academic & General",
      duration: "2 months",
      fee: "PKR 12,000",
    },
    pte: {
      name: "PTE Academic",
      levels: "Full preparation",
      duration: "6 weeks",
      fee: "PKR 10,000",
    },
    oet: {
      name: "OET (Medical Professionals)",
      levels: "Full preparation",
      duration: "2 months",
      fee: "PKR 15,000",
    },
    arabic: {
      name: "Arabic Language",
      levels: "Beginner to Advanced",
      duration: "3 months per level",
      fee: "PKR 6,000/month",
    },
    english: {
      name: "English Language",
      levels: "Basic to Advanced",
      duration: "3 months per level",
      fee: "PKR 5,000/month",
    },
  },
  studyAbroad: ["Germany", "Italy", "Finland", "UK", "USA", "Canada", "Australia"],
};

// ─── SESSION STORE (in-memory) ────────────────────────────────────────────────
const sessions = {};

function getSession(phone) {
  if (!sessions[phone]) sessions[phone] = { step: "main_menu", data: {} };
  return sessions[phone];
}

// ─── WHATSAPP SENDER ──────────────────────────────────────────────────────────
async function sendMessage(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Send error:", err.response?.data || err.message);
  }
}

async function sendInteractiveButtons(to, bodyText, buttons) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.map((b, i) => ({
              type: "reply",
              reply: { id: `btn_${i}`, title: b },
            })),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    // Fallback to plain text if interactive fails
    await sendMessage(to, bodyText);
  }
}

async function sendList(to, headerText, bodyText, sections) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "list",
          header: { type: "text", text: headerText },
          body: { text: bodyText },
          action: {
            button: "View Options",
            sections,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    await sendMessage(to, bodyText);
  }
}

// ─── MENU FLOWS ───────────────────────────────────────────────────────────────
async function sendMainMenu(to) {
  const session = getSession(to);
  session.step = "main_menu";

  const msg =
    `👋 Welcome to *${INSTITUTE.name}*!\n\n` +
    `We offer language courses & study abroad consultancy.\n\n` +
    `Please choose an option:`;

  await sendInteractiveButtons(to, msg, [
    "📚 Courses & Fees",
    "🎓 Admission Info",
    "✈️ Study Abroad",
  ]);
}

async function sendCoursesMenu(to) {
  const session = getSession(to);
  session.step = "courses_menu";

  const sections = [
    {
      title: "Language Courses",
      rows: Object.entries(INSTITUTE.courses).map(([key, c]) => ({
        id: `course_${key}`,
        title: c.name,
        description: `${c.duration} | ${c.fee}`,
      })),
    },
  ];

  await sendList(
    to,
    "📚 Our Courses",
    "Select a course to see details:",
    sections
  );
}

async function sendCourseDetail(to, courseKey) {
  const course = INSTITUTE.courses[courseKey];
  if (!course) {
    await sendMainMenu(to);
    return;
  }

  const msg =
    `📘 *${course.name}*\n\n` +
    `📊 Levels: ${course.levels}\n` +
    `⏱️ Duration: ${course.duration}\n` +
    `💰 Fee: ${course.fee}\n\n` +
    `To enroll or ask questions, contact us:\n` +
    `📞 ${INSTITUTE.phone}\n` +
    `📧 ${INSTITUTE.email}`;

  await sendMessage(to, msg);
  await sendInteractiveButtons(to, "What would you like to do next?", [
    "🏠 Main Menu",
    "📚 More Courses",
    "🎓 Apply Now",
  ]);
}

async function sendAdmissionInfo(to) {
  const session = getSession(to);
  session.step = "admission";

  const msg =
    `🎓 *Admission Process at ${INSTITUTE.name}*\n\n` +
    `*Step 1:* Contact us via WhatsApp or call\n` +
    `*Step 2:* Choose your course & level\n` +
    `*Step 3:* Pay registration fee\n` +
    `*Step 4:* Start your classes!\n\n` +
    `📍 *Location:*\n${INSTITUTE.address}\n\n` +
    `📞 *Call/WhatsApp:* ${INSTITUTE.phone}\n` +
    `📧 *Email:* ${INSTITUTE.email}\n\n` +
    `🕐 *Office Hours:* Mon-Sat, 9am - 7pm`;

  await sendMessage(to, msg);
  await sendInteractiveButtons(to, "Would you like to:", [
    "📝 Register Interest",
    "📚 View Courses",
    "🏠 Main Menu",
  ]);
}

async function sendStudyAbroadInfo(to) {
  const countries = INSTITUTE.studyAbroad.join(", ");
  const msg =
    `✈️ *Study Abroad Consultancy*\n\n` +
    `We help you study in:\n🌍 ${countries}\n\n` +
    `*Our Services:*\n` +
    `✅ University admission guidance\n` +
    `✅ Scholarship assistance\n` +
    `✅ Visa application support\n` +
    `✅ Language preparation (IELTS, German, etc.)\n\n` +
    `Hundreds of our students are already studying & working abroad! 🎉\n\n` +
    `📞 Book a free consultation: ${INSTITUTE.phone}`;

  await sendMessage(to, msg);
  await sendInteractiveButtons(to, "What's next?", [
    "📞 Book Consultation",
    "📚 View Courses",
    "🏠 Main Menu",
  ]);
}

async function sendRegistrationFlow(to) {
  const session = getSession(to);
  session.step = "collect_name";
  await sendMessage(
    to,
    `📝 *Registration Form*\n\nGreat! Let's get you enrolled.\n\nPlease enter your *full name*:`
  );
}

// ─── MESSAGE HANDLER ──────────────────────────────────────────────────────────
async function handleMessage(from, messageObj) {
  const session = getSession(from);
  let text = "";
  let buttonId = "";
  let listId = "";

  if (messageObj.type === "text") {
    text = messageObj.text?.body?.trim().toLowerCase() || "";
  } else if (messageObj.type === "interactive") {
    if (messageObj.interactive?.type === "button_reply") {
      buttonId = messageObj.interactive.button_reply.id;
      text = messageObj.interactive.button_reply.title.toLowerCase();
    } else if (messageObj.interactive?.type === "list_reply") {
      listId = messageObj.interactive.list_reply.id;
      text = messageObj.interactive.list_reply.title.toLowerCase();
    }
  }

  // Global keywords
  if (["hi", "hello", "hey", "start", "menu", "help"].includes(text)) {
    await sendMainMenu(from);
    return;
  }

  // Handle list selections (course details)
  if (listId.startsWith("course_")) {
    const courseKey = listId.replace("course_", "");
    await sendCourseDetail(from, courseKey);
    return;
  }

  // Button/text routing
  if (text.includes("courses") || text.includes("fees") || text.includes("more courses")) {
    await sendCoursesMenu(from);
  } else if (text.includes("admission") || text.includes("apply")) {
    await sendAdmissionInfo(from);
  } else if (text.includes("study abroad")) {
    await sendStudyAbroadInfo(from);
  } else if (text.includes("register") || text.includes("register interest")) {
    await sendRegistrationFlow(from);
  } else if (text.includes("main menu") || text.includes("home")) {
    await sendMainMenu(from);
  } else if (text.includes("book consultation") || text.includes("book")) {
    await sendMessage(
      from,
      `📞 *Book Your Free Consultation*\n\nCall or WhatsApp us directly:\n*${INSTITUTE.phone}*\n\nOr visit us at:\n${INSTITUTE.address}\n\n🕐 Mon-Sat, 9am - 7pm`
    );
    await sendInteractiveButtons(from, "Anything else?", ["🏠 Main Menu", "📚 View Courses"]);
  } else if (session.step === "collect_name") {
    session.data.name = messageObj.text?.body?.trim();
    session.step = "collect_phone";
    await sendMessage(from, `Nice to meet you, *${session.data.name}*! 😊\n\nPlease enter your *phone number*:`);
  } else if (session.step === "collect_phone") {
    session.data.phone = messageObj.text?.body?.trim();
    session.step = "collect_course";
    await sendMessage(from, `Got it! Which course are you interested in?\n\n(e.g. German, IELTS, PTE, OET, Arabic, English)`);
  } else if (session.step === "collect_course") {
    session.data.course = messageObj.text?.body?.trim();
    session.step = "done";
    const msg =
      `✅ *Registration Received!*\n\n` +
      `*Name:* ${session.data.name}\n` +
      `*Phone:* ${session.data.phone}\n` +
      `*Course:* ${session.data.course}\n\n` +
      `Our team will contact you shortly.\n\n` +
      `📞 You can also reach us at: ${INSTITUTE.phone}`;
    await sendMessage(from, msg);
    await sendMainMenu(from);
  } else {
    // Default fallback
    await sendMessage(
      from,
      `Sorry, I didn't understand that. 😊\n\nType *"menu"* to see all options or call us at ${INSTITUTE.phone}`
    );
    await sendMainMenu(from);
  }
}

// ─── WEBHOOK ──────────────────────────────────────────────────────────────────
// Verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === CONFIG.VERIFY_TOKEN) {
    console.log("✅ Webhook verified!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
app.post("/webhook", (req, res) => {
  res.sendStatus(200); // Respond immediately

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) return;

    const msg = messages[0];
    const from = msg.from;

    console.log(`📨 Message from ${from}:`, JSON.stringify(msg));
    handleMessage(from, msg);
  } catch (err) {
    console.error("Webhook error:", err);
  }
});

// ─── BULK MESSAGE ENDPOINT ────────────────────────────────────────────────────
app.post("/send-bulk", async (req, res) => {
  const { numbers, message, secret } = req.body;

  // Simple secret protection
  if (secret !== process.env.BULK_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!Array.isArray(numbers) || !message) {
    return res.status(400).json({ error: "numbers (array) and message required" });
  }

  const results = [];
  for (const number of numbers) {
    try {
      await sendMessage(number, message);
      results.push({ number, status: "sent" });
      await new Promise((r) => setTimeout(r, 500)); // 500ms delay between messages
    } catch (e) {
      results.push({ number, status: "failed", error: e.message });
    }
  }

  res.json({ sent: results.length, results });
});

// Health check
app.get("/", (req, res) => res.json({ status: "Ghazala Institute WhatsApp Bot is running! 🚀" }));

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bot running on port ${PORT}`));
