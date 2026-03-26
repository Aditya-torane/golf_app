const asyncHandler = require("../utils/asyncHandler");
const { getDB } = require("../config/database");

const getCharities = asyncHandler(async (req, res) => {
  const db = getDB();
  const { name } = req.query;
  const nameFilter = name ? String(name).trim() : "";

  const [charities] = await db.query(
    `
      SELECT
        id,
        name,
        description,
        donation_percentage AS donationPercentage,
        created_at AS createdAt
      FROM charities
      ${nameFilter ? "WHERE name LIKE ? " : ""}
      ORDER BY created_at DESC
    `,
    nameFilter ? [`%${nameFilter}%`] : []
  );
  res.json({ success: true, charities });
});

const createCharity = asyncHandler(async (req, res) => {
  const { name, description, donationPercentage } = req.body;
  if (!name || !description || donationPercentage == null) {
    return res.status(400).json({ success: false, message: "Name, description, and donation percentage are required" });
  }

  const db = getDB();
  const [result] = await db.query(
    "INSERT INTO charities (name, description, donation_percentage) VALUES (?, ?, ?)",
    [name, description, Number(donationPercentage)]
  );
  const [rows] = await db.query(
    "SELECT id, name, description, donation_percentage AS donationPercentage FROM charities WHERE id = ?",
    [result.insertId]
  );
  const charity = rows[0];
  res.status(201).json({ success: true, message: "Charity created", charity });
});

const updateCharity = asyncHandler(async (req, res) => {
  const db = getDB();
  const fields = [];
  const values = [];
  if (req.body.name != null) { fields.push("name = ?"); values.push(req.body.name); }
  if (req.body.description != null) { fields.push("description = ?"); values.push(req.body.description); }
  if (req.body.donationPercentage != null) { fields.push("donation_percentage = ?"); values.push(Number(req.body.donationPercentage)); }
  if (!fields.length) return res.status(400).json({ success: false, message: "No update data provided" });
  values.push(req.params.id);
  const [result] = await db.query(`UPDATE charities SET ${fields.join(", ")} WHERE id = ?`, values);
  if (!result.affectedRows) {
    return res.status(404).json({ success: false, message: "Charity not found" });
  }
  const [rows] = await db.query(
    "SELECT id, name, description, donation_percentage AS donationPercentage FROM charities WHERE id = ?",
    [req.params.id]
  );
  const updated = rows[0];
  res.json({ success: true, message: "Charity updated", charity: updated });
});

const deleteCharity = asyncHandler(async (req, res) => {
  const db = getDB();
  await db.query("DELETE FROM user_charities WHERE charity_id = ?", [req.params.id]);
  const [result] = await db.query("DELETE FROM charities WHERE id = ?", [req.params.id]);
  if (!result.affectedRows) {
    return res.status(404).json({ success: false, message: "Charity not found" });
  }
  res.json({ success: true, message: "Charity deleted" });
});

const selectCharity = asyncHandler(async (req, res) => {
  const { charityId } = req.body;
  const db = getDB();
  const [charityRows] = await db.query(
    "SELECT id, name, description, donation_percentage AS donationPercentage FROM charities WHERE id = ?",
    [charityId]
  );
  if (!charityRows.length) {
    return res.status(404).json({ success: false, message: "Charity not found" });
  }
  const charity = charityRows[0];

  await db.query(
    `INSERT INTO user_charities (user_id, charity_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE charity_id = VALUES(charity_id)`,
    [req.user.id, charity.id]
  );
  const selection = { user_id: req.user.id, charity };

  res.json({ success: true, message: "Charity selected", selection });
});

const getMyCharity = asyncHandler(async (req, res) => {
  const db = getDB();
  const [rows] = await db.query(
    `SELECT uc.user_id, c.id, c.name, c.description, c.donation_percentage AS donationPercentage
     FROM user_charities uc
     INNER JOIN charities c ON uc.charity_id = c.id
     WHERE uc.user_id = ?
     LIMIT 1`,
    [req.user.id]
  );
  if (!rows.length) {
    return res.status(404).json({ success: false, message: "No charity selected yet" });
  }
  const selection = { user_id: rows[0].user_id, charity: rows[0] };
  res.json({ success: true, selection });
});

module.exports = {
  getCharities,
  createCharity,
  updateCharity,
  deleteCharity,
  selectCharity,
  getMyCharity
};
