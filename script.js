const $ = (s) => document.querySelector(s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

const fmt = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/* ---------- Intro ---------- */
async function intro() {
  const el = $("#line1");
  const text = "Lieber Papa, Du weißt, dein Sohn ist reich";
  for (const ch of text) {
    el.textContent += ch;
    await wait(55);
  }
  await wait(1500);
  $("#line2").classList.add("show");
  await wait(1800);
  el.classList.add("done");
  $("#line3").classList.add("show");
  await wait(1200);
  $("#next1").classList.add("show");
}

/* ---------- Kosten ---------- */
async function costs() {
  show("#costs");
  const rows = [...document.querySelectorAll(".row")];
  const sum = 131 + 19.95 + 150.99;

  // Miete
  rows[0].classList.add("show");
  await wait(900);
  rows[0].classList.add("struck");
  await wait(900);

  // Essen mit Rechnung
  rows[1].classList.add("show");
  await wait(700);
  rows[1].classList.add("calc-open");
  await wait(400);
  $("#calc1").classList.add("show");
  await wait(1200);
  $("#calc2").classList.add("show");
  await wait(1400);

  // Telefon
  rows[2].classList.add("show");
  await wait(900);
  rows[2].classList.add("struck");
  await wait(900);

  rows[3].classList.add("show");
  await wait(700);
  rows[4].classList.add("show");
  await wait(800);

  // Summe hochzählen
  $("#total").classList.add("show");
  const t0 = performance.now();
  await new Promise((resolve) => {
    const tick = (now) => {
      const p = Math.min((now - t0) / 1400, 1);
      $("#totalNum").textContent = fmt(sum * (1 - Math.pow(1 - p, 3)));
      p < 1 ? requestAnimationFrame(tick) : resolve();
    };
    requestAnimationFrame(tick);
  });
  await wait(500);
  $("#choices").classList.add("show");
}

/* ---------- Ausweich-Button ---------- */
const who = $("#who");
function dodge() {
  const pad = 12;
  const w = who.offsetWidth, h = who.offsetHeight;
  if (!who.classList.contains("run")) {
    const r = who.getBoundingClientRect();
    who.classList.add("run");
    who.style.left = r.left + "px";
    who.style.top = r.top + "px";
    // Platzhalter, damit das Layout nicht springt
    const ph = document.createElement("div");
    ph.style.width = w + "px"; ph.style.height = h + "px";
    who.parentNode.insertBefore(ph, who);
  }
  const x = pad + Math.random() * (window.innerWidth - w - pad * 2);
  const y = pad + Math.random() * (window.innerHeight - h - pad * 2);
  who.style.left = x + "px";
  who.style.top = y + "px";
}
who.addEventListener("mouseenter", dodge);
who.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
who.addEventListener("click", (e) => e.preventDefault());

/* ---------- PDF ---------- */
function makePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setTextColor(29, 29, 31);

  doc.setFontSize(10); doc.setTextColor(110, 110, 115);
  doc.text("Vereinbarung · nicht bindend", 20, 25);

  doc.setFontSize(26); doc.setTextColor(29, 29, 31); doc.setFont("helvetica", "bold");
  doc.text("Unterstützungszusage", 20, 40);

  doc.setFont("helvetica", "normal"); doc.setFontSize(13);
  const body = doc.splitTextToSize(
    "Ich, Papa, unterstütze meinen Sohn im nächsten Monat mit 301,94 €, weil ich ihn so sehr liebe und nicht möchte, dass er hungern muss.",
    170
  );
  doc.text(body, 20, 55);

  let y = 85;
  [["Essen", "131,00 €"], ["Adobe-Abo (Uni)", "19,95 €"], ["Bosch BKK (Krankenkasse)", "150,99 €"]].forEach(([a, b]) => {
    doc.text(a, 20, y); doc.text(b, 190, y, { align: "right" });
    doc.setDrawColor(232, 232, 237); doc.line(20, y + 3, 190, y + 3);
    y += 11;
  });
  doc.setFont("helvetica", "bold");
  doc.text("Zusammen", 20, y + 2); doc.text("301,94 €", 190, y + 2, { align: "right" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110, 110, 115);
  doc.text("Miete und Telefon sind schon geregelt. Das Geld kommt bald von alleine, versprochen.", 20, y + 16);

  doc.setDrawColor(29, 29, 31);
  doc.line(20, 220, 85, 220); doc.line(115, 220, 190, 220);
  doc.text("Papa", 20, 226); doc.text("Dein Sohn", 115, 226);

  doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(255, 59, 48);
  doc.text("VERTRAG NICHT BINDEND", 105, 255, { align: "center" });

  doc.save("Unterstuetzungszusage.pdf");
}

$("#next1").addEventListener("click", costs);
$("#help").addEventListener("click", () => show("#pdf"));
$("#download").addEventListener("click", makePdf);

intro();
