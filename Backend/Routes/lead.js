const { createNotification } = require("./notifications");
const express = require("express");
const router = express.Router();

const db = require("../Db");

// ===============================
// GET ALL LEADS
// ===============================
router.get("/all", (req, res) => {
  const sql = `
    SELECT
      leads.id,
      leads.name,
      leads.phone,
      leads.email,
      leads.lead_source,
      leads.broker_id,
      brokers.name AS broker_name,
      leads.employee_id,
      employees.name AS employee_name,
      leads.status,
      leads.notes,
      leads.created_at
    FROM leads
    LEFT JOIN brokers
      ON leads.broker_id = brokers.id
    LEFT JOIN employees
      ON leads.employee_id = employees.id
    ORDER BY leads.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("GET LEADS ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch leads"
      });
    }

    res.json(result);
  });
});


// ===============================
// GET SINGLE LEAD
// ===============================
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      leads.id,
      leads.name,
      leads.phone,
      leads.email,
      leads.lead_source,
      leads.broker_id,
      brokers.name AS broker_name,
      leads.employee_id,
      employees.name AS employee_name,
      leads.status,
      leads.notes,
      leads.created_at
    FROM leads
    LEFT JOIN brokers
      ON leads.broker_id = brokers.id
    LEFT JOIN employees
      ON leads.employee_id = employees.id
    WHERE leads.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("GET LEAD ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch lead"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    res.json(result[0]);
  });
});


// ===============================
// ADD LEAD
// ===============================
router.post("/add", (req, res) => {
  const {
    name,
    phone,
    email,
    lead_source,
    broker_id,
    employee_id,
    status,
    notes
  } = req.body;

  if (
    !name ||
    !phone ||
    !lead_source ||
    !broker_id ||
    !employee_id ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all required lead details"
    });
  }

  const sql = `
    INSERT INTO leads
    (
      name,
      phone,
      email,
      lead_source,
      broker_id,
      employee_id,
      status,
      notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email || null,
      lead_source,
      broker_id,
      employee_id,
      status,
      notes || null
    ],
    (err, result) => {
      if (err) {
        console.log("ADD LEAD ERROR:", err);

        return res.status(500).json({
          message: "Lead could not be added"
        });
      }

      createNotification("New Lead Added", `Lead from ${name} (${phone})`, "lead", result.insertId);
      res.status(201).json({
        message: "Lead added successfully",
        id: result.insertId
      });
    }
  );
});


// ===============================
// UPDATE LEAD
// ===============================
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    name,
    phone,
    email,
    lead_source,
    broker_id,
    employee_id,
    status,
    notes
  } = req.body;

  if (
    !name ||
    !phone ||
    !lead_source ||
    !broker_id ||
    !employee_id ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all required lead details"
    });
  }

  const sql = `
    UPDATE leads
    SET
      name = ?,
      phone = ?,
      email = ?,
      lead_source = ?,
      broker_id = ?,
      employee_id = ?,
      status = ?,
      notes = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email || null,
      lead_source,
      broker_id,
      employee_id,
      status,
      notes || null,
      id
    ],
    (err, result) => {
      if (err) {
        console.log("UPDATE LEAD ERROR:", err);

        return res.status(500).json({
          message: "Lead could not be updated"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Lead not found"
        });
      }

      res.json({
        message: "Lead updated successfully"
      });
    }
  );
});


// ===============================
// DELETE LEAD
// ===============================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM leads
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE LEAD ERROR:", err);

      return res.status(500).json({
        message: "Lead could not be deleted"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    res.json({
      message: "Lead deleted successfully"
    });
  });
});


module.exports = router;