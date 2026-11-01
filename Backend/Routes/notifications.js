const express = require("express");
const router = express.Router();
const db = require("../Db");

/**
 * Reusable helper to create in-app notifications
 */
function createNotification(title, message, type = "general", reference_id = null) {
  const sql = `
    INSERT INTO notifications (title, message, type, reference_id, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, NOW())
  `;

  db.query(sql, [title, message, type, reference_id], (err, result) => {
    if (err) {
      console.error("NOTIFICATION INSERT ERROR:", err.message);
    } else {
      console.log(`Notification created: [${type}] ${title}`);
    }
  });
}

// =========================================================
// GET ALL NOTIFICATIONS
// =========================================================
router.get("/all", (req, res) => {
  const sql = `
    SELECT id, title, message, type, reference_id, is_read, created_at
    FROM notifications
    ORDER BY created_at DESC, id DESC
    LIMIT 100
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.log("GET NOTIFICATIONS ERROR:", err);
      return res.status(500).json({
        message: "Notifications could not be loaded",
      });
    }

    return res.json(rows);
  });
});

// =========================================================
// GET UNREAD COUNT
// =========================================================
router.get("/unread-count", (req, res) => {
  const sql = `SELECT COUNT(*) AS count FROM notifications WHERE is_read = 0`;

  db.query(sql, (err, rows) => {
    if (err) {
      return res.status(500).json({ count: 0 });
    }
    return res.json({ count: rows[0].count });
  });
});

// =========================================================
// MARK SINGLE NOTIFICATION READ
// =========================================================
router.put("/read/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "A valid notification ID is required",
    });
  }

  db.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [id],
    (err, result) => {
      if (err) {
        console.log("MARK NOTIFICATION READ ERROR:", err);
        return res.status(500).json({
          message: "Notification could not be marked as read",
        });
      }

      return res.json({
        message: "Notification marked as read",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// =========================================================
// MARK ALL NOTIFICATIONS READ
// =========================================================
router.put("/read-all", (req, res) => {
  db.query(
    "UPDATE notifications SET is_read = 1 WHERE is_read = 0",
    (err, result) => {
      if (err) {
        console.log("MARK ALL READ ERROR:", err);
        return res.status(500).json({
          message: "Failed to mark all as read",
        });
      }

      return res.json({
        message: "All notifications marked as read",
        updatedCount: result.affectedRows,
      });
    }
  );
});

// =========================================================
// CREATE NOTIFICATION (MANUAL POST)
// =========================================================
router.post("/add", (req, res) => {
  const { title, message, type, reference_id } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message are required" });
  }

  const sql = `
    INSERT INTO notifications (title, message, type, reference_id, is_read, created_at)
    VALUES (?, ?, ?, ?, 0, NOW())
  `;

  db.query(sql, [title, message, type || "general", reference_id || null], (err, result) => {
    if (err) {
      console.log("ADD NOTIFICATION ERROR:", err);
      return res.status(500).json({ message: "Failed to create notification" });
    }

    return res.status(201).json({
      message: "Notification created successfully",
      id: result.insertId,
    });
  });
});

// =========================================================
// DELETE NOTIFICATION
// =========================================================
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  db.query("DELETE FROM notifications WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.log("DELETE NOTIFICATION ERROR:", err);
      return res.status(500).json({ message: "Failed to delete notification" });
    }

    return res.json({ message: "Notification deleted successfully" });
  });
});

module.exports = router;
module.exports.createNotification = createNotification;
