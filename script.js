const $ = (s) => document.querySelector(s);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

const fmt = (n) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

/* ---------- Intro: ein Satz, getippt, mit Pausen ---------- */
async function intro() {
  // Erster Satz steht allein in der Mitte und wirkt abgeschlossen
  const typed = $("#typed");
  const first = "Lieber Papa, du weißt, dein Sohn ist reich.";
  const second = " beschenkt an Luft und Liebe. Das Geld kommt auch bald von alleine, doch bis dahin …";
  let text = "";
  const put = () => { typed.textContent = text; };

  await wait(1800);
  for (const c of first) {
    text += c; put();
    await wait(c === "," ? 240 : 65);
  }

  await wait(3200); // Der Satz wirkt abgeschlossen

  // Punkt wird korrigiert: weg, dann Komma, dann geht's in derselben Zeile weiter
  text = text.slice(0, -1); put();
  await wait(500);
  text += ","; put();
  await wait(500);

  for (const c of second) {
    text += c; put();
    await wait(c === "." ? 700 : c === "," ? 240 : 60);
  }
  typed.classList.add("done");
  await wait(700);
  $("#next1").classList.add("show");
}

/* ---------- Kosten ---------- */
async function costs() {
  show("#costs");
  const rows = [...document.querySelectorAll(".row")];
  const sum = 131 + 19.95 + 150.99;

  rows[0].classList.add("show");
  await wait(900);
  rows[0].classList.add("struck");
  await wait(900);

  rows[1].classList.add("show");
  await wait(700);
  rows[1].classList.add("calc-open");
  await wait(400);
  $("#calc1").classList.add("show");
  await wait(1200);
  $("#calc2").classList.add("show");
  await wait(1400);

  rows[2].classList.add("show");
  await wait(900);
  rows[2].classList.add("struck");
  await wait(900);

  rows[3].classList.add("show");
  await wait(700);
  rows[4].classList.add("show");
  await wait(800);

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
    const ph = document.createElement("div");
    ph.style.width = w + "px"; ph.style.height = h + "px";
    who.parentNode.insertBefore(ph, who);
  }
  who.style.left = pad + Math.random() * (window.innerWidth - w - pad * 2) + "px";
  who.style.top = pad + Math.random() * (window.innerHeight - h - pad * 2) + "px";
}
who.addEventListener("mouseenter", dodge);
who.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
who.addEventListener("click", (e) => e.preventDefault());

/* ---------- Dokument ---------- */
let signed = false;

function openDoc() {
  $("#fDatum").value = new Date().toLocaleDateString("de-DE");
  show("#pdf");
}

async function sign() {
  if (signed) return;
  signed = true;
  const btn = $("#sign");
  btn.disabled = true;
  $("#sigPapa").classList.add("writing");
  await wait(1700);
  $("#sigPapa").classList.add("on");
  btn.textContent = "Unterschrieben ✓";
  $("#download").disabled = false;
}

function makePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const grey = [110, 110, 115], dark = [34, 34, 34], ink = [26, 63, 168];
  const L = 20, R = 190;
  doc.addFileToVFS("Caveat.ttf", window.PDF_FONTS.caveat);
  doc.addFont("Caveat.ttf", "Caveat", "normal");
  doc.addFileToVFS("HomemadeApple.ttf", window.PDF_FONTS.apple);
  doc.addFont("HomemadeApple.ttf", "HomemadeApple", "normal");

  // Briefkopf
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(226, 0, 21);
  doc.text("Papa GmbH", L, 25);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...grey);
  doc.text("ABTEILUNG FAMILIE & FINANZEN", L, 30);
  doc.text("Dok.-Nr. PAPA-2026-11", R, 30, { align: "right" });
  const seg = (R - L) / 4;
  [[226, 0, 21], [140, 29, 130], [31, 95, 139], [58, 157, 93]].forEach((c, i) => {
    doc.setFillColor(...c); doc.rect(L + seg * i, 33, seg, 1.2, "F");
  });

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(...dark);
  doc.text("Unterstützungsvereinbarung", L, 48);

  // Felder (handschriftlich = blau, kursiv)
  const rows = [
    ["Datum", $("#fDatum").value], ["Empfänger", $("#fName").value], ["Zeitraum", $("#fZeit").value],
    ["Betrag", $("#fBetrag").value], ["Zahlungsart", $("#fArt").value],
  ];
  let y = 60;
  rows.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...grey);
    doc.text(k, L, y);
    doc.setFont("Caveat", "normal"); doc.setFontSize(17); doc.setTextColor(...ink);
    doc.text(v || "", L + 32, y);
    doc.setDrawColor(200, 205, 220); doc.setLineDashPattern([0.8, 0.8], 0);
    doc.line(L + 30, y + 1.8, R, y + 1.8);
    y += 8;
  });
  doc.setLineDashPattern([], 0);

  y += 4;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(...dark);
  doc.text(doc.splitTextToSize(
    "Hiermit sagt der Unterzeichner (Papa) seinem Sohn für den oben genannten Zeitraum eine finanzielle Unterstützung zu, weil er ihn sehr liebt und nicht möchte, dass er hungern muss.",
    R - L), L, y);
  y += 20;

  // Tabelle
  doc.setFillColor(31, 95, 139); doc.rect(L, y, R - L, 7, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
  doc.text("Position", L + 2, y + 4.7); doc.text("Betrag", R - 2, y + 4.7, { align: "right" });
  y += 7;
  doc.setFontSize(10.5);
  [["Verpflegung", "131,00 €"], ["Adobe-Abo (Studium)", "19,95 €"], ["Bosch BKK (Krankenversicherung)", "150,99 €"]].forEach(([a, b]) => {
    doc.setFont("helvetica", "normal"); doc.setTextColor(...dark);
    doc.text(a, L + 2, y + 5); doc.text(b, R - 2, y + 5, { align: "right" });
    doc.setDrawColor(232, 232, 237); doc.line(L, y + 7.5, R, y + 7.5);
    y += 8;
  });
  doc.setFont("helvetica", "bold");
  doc.text("Gesamt", L + 2, y + 5); doc.text("301,94 €", R - 2, y + 5, { align: "right" });
  doc.setDrawColor(31, 95, 139); doc.setLineWidth(0.5); doc.line(L, y + 7.5, R, y + 7.5);
  doc.setLineWidth(0.2);
  y += 16;

  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...grey);
  doc.text("Miete und Telefon sind bereits geregelt.", L, y);
  y += 9;
  doc.setFont("helvetica", "bold"); doc.text("Anmerkung:", L, y);
  doc.setFont("Caveat", "normal"); doc.setFontSize(16); doc.setTextColor(...ink);
  doc.text(doc.splitTextToSize($("#fNote").value || "", R - L), L, y + 6);

  // Unterschriften
  const sy = 215;
  doc.setDrawColor(51, 51, 51);
  doc.line(L, sy, 88, sy); doc.line(122, sy, R, sy);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...grey);
  doc.text("Papa", L, sy + 5); doc.text("Josua", 122, sy + 5);
  doc.setFont("HomemadeApple", "normal"); doc.setFontSize(15); doc.setTextColor(...ink);
  doc.text("Dein Papa", L + 4, sy - 3, { angle: 4 });
  doc.text("Dein Josua", 126, sy - 3, { angle: 4 });

  // Fußzeile (unauffällig)
  doc.setDrawColor(232, 232, 237); doc.line(L, 275, R, 275);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(161, 161, 166);
  doc.text("Vertrag nicht bindend", L, 280);
  doc.text("Seite 1 von 1", R, 280, { align: "right" });

  doc.save("Unterstuetzungsvereinbarung.pdf");
}

$("#next1").addEventListener("click", costs);
$("#help").addEventListener("click", openDoc);
$("#sign").addEventListener("click", sign);
$("#download").addEventListener("click", makePdf);

intro();
