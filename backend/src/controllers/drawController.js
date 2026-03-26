const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");
const parseJsonColumn = require("../utils/parseJsonColumn");

function getRandomNumbers(count = 5, min = 1, max = 45) {
  const set = new Set();
  while (set.size < count) {
    set.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(set);
}

function getPrize(matchCount) {
  if (matchCount === 5) return "Jackpot";
  if (matchCount === 4) return "Second Prize";
  if (matchCount === 3) return "Third Prize";
  return null;
}

const runMonthlyDraw = asyncHandler(async (req, res) => {
  const db = getDB();
  const drawNumbers = getRandomNumbers();
  const [users] = await db.query("SELECT id, name, email FROM users WHERE role = 'user'");
  const winners = [];

  for (const user of users) {
    const [scores] = await db.query(
      "SELECT value FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
      [user.id]
    );
    const values = scores.map((s) => s.value);
    const matchedNumbers = values.filter((v) => drawNumbers.includes(v));
    const uniqueMatched = Array.from(new Set(matchedNumbers));
    const prize = getPrize(uniqueMatched.length);

    if (prize) {
      winners.push({
        userId: user.id,
        matchedCount: uniqueMatched.length,
        prize,
        matchedNumbers: uniqueMatched
      });
    }
  }

  const [drawResult] = await db.query(
    "INSERT INTO draws (draw_date, numbers_json) VALUES (NOW(), ?)",
    [JSON.stringify(drawNumbers)]
  );
  const drawId = drawResult.insertId;

  // Store latest draw metadata for fast "latest draw" queries in UI
  await db.query(
    "INSERT INTO draw_results (draw_id, draw_date, numbers_json) VALUES (?, NOW(), ?)",
    [drawId, JSON.stringify(drawNumbers)]
  );

  for (const winner of winners) {
    await db.query(
      "INSERT INTO draw_winners (draw_id, user_id, matched_count, prize, matched_numbers_json) VALUES (?, ?, ?, ?, ?)",
      [drawId, winner.userId, winner.matchedCount, winner.prize, JSON.stringify(winner.matchedNumbers)]
    );
  }

  const [drawRows] = await db.query("SELECT id, draw_date FROM draws WHERE id = ?", [drawId]);
  const [winnerRows] = await db.query(
    `SELECT dw.user_id, dw.matched_count, dw.prize, dw.matched_numbers_json,
            u.name, u.email
     FROM draw_winners dw
     INNER JOIN users u ON dw.user_id = u.id
     WHERE dw.draw_id = ?`,
    [drawId]
  );
  const populatedDraw = {
    id: drawRows[0].id,
    drawDate: drawRows[0].draw_date,
    numbers: drawNumbers,
    winners: winnerRows.map((w) => ({
      user: { id: w.user_id, name: w.name, email: w.email },
      matchedCount: w.matched_count,
      prize: w.prize,
      matchedNumbers: parseJsonColumn(w.matched_numbers_json, [])
    }))
  };

  res.json({
    success: true,
    message: "Monthly draw completed",
    draw: populatedDraw
  });
});

const getLatestDraw = asyncHandler(async (req, res) => {
  const db = getDB();
  const [drawRows] = await db.query(
    "SELECT draw_id, draw_date, numbers_json FROM draw_results ORDER BY id DESC LIMIT 1"
  );
  if (!drawRows.length) return res.status(404).json({ success: false, message: "No draw available yet" });

  const latest = drawRows[0];
  const [winnerRows] = await db.query(
    `SELECT dw.user_id, dw.matched_count, dw.prize, dw.matched_numbers_json,
            u.name, u.email
     FROM draw_winners dw
     INNER JOIN users u ON dw.user_id = u.id
     WHERE dw.draw_id = ?`,
    [latest.draw_id]
  );
  const shapedDraw = {
    id: latest.draw_id,
    drawDate: latest.draw_date,
    numbers: parseJsonColumn(latest.numbers_json, []),
    winners: winnerRows.map((w) => ({
      user: { id: w.user_id, name: w.name, email: w.email },
      matchedCount: w.matched_count,
      prize: w.prize,
      matchedNumbers: parseJsonColumn(w.matched_numbers_json, [])
    }))
  };
  res.json({ success: true, draw: shapedDraw });
});

const getLatestDrawForMe = asyncHandler(async (req, res) => {
  const db = getDB();

  const [drawRows] = await db.query(
    "SELECT draw_id, draw_date, numbers_json FROM draw_results ORDER BY id DESC LIMIT 1"
  );

  if (!drawRows.length) {
    return res.status(404).json({ success: false, message: "No draw available yet" });
  }

  const latest = drawRows[0];
  const drawNumbers = parseJsonColumn(latest.numbers_json, []);

  // Use the last 5 scores (consistent with score submission + draw logic)
  const [scoreRows] = await db.query(
    "SELECT value FROM scores WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
    [req.user.id]
  );

  const values = scoreRows.map((s) => s.value);
  const matchedNumbers = values.filter((v) => drawNumbers.includes(v));
  const uniqueMatched = Array.from(new Set(matchedNumbers));
  const prize = getPrize(uniqueMatched.length);

  const myWin = prize
    ? { matchedCount: uniqueMatched.length, prize, matchedNumbers: uniqueMatched }
    : null;

  res.json({
    success: true,
    myWin,
    draw: {
      id: latest.draw_id,
      drawDate: latest.draw_date,
      numbers: drawNumbers
    }
  });
});

const getMyDrawResults = asyncHandler(async (req, res) => {
  const db = getDB();
  const [rows] = await db.query(
    `SELECT d.id AS drawId, d.draw_date AS drawDate, d.numbers_json,
            dw.matched_count, dw.prize, dw.matched_numbers_json
     FROM draw_winners dw
     INNER JOIN draws d ON dw.draw_id = d.id
     WHERE dw.user_id = ?
     ORDER BY d.id DESC`,
    [req.user.id]
  );
  const myResults = rows.map((r) => ({
    drawId: r.drawId,
    drawDate: r.drawDate,
    numbers: parseJsonColumn(r.numbers_json, []),
    winner: {
      matchedCount: r.matched_count,
      prize: r.prize,
      matchedNumbers: parseJsonColumn(r.matched_numbers_json, [])
    }
  }));
  res.json({ success: true, results: myResults });
});

module.exports = { runMonthlyDraw, getLatestDraw, getLatestDrawForMe, getMyDrawResults };
