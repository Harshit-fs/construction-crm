
const express = require("express");
const router = express.Router();

const db = require("../Db");


// ===============================
// GET ALL BROKERS
// ===============================
router.get("/all", (req, res) => {

  const sql = `
    SELECT *
    FROM brokers
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log("GET BROKERS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch brokers"
      });
    }

    res.json(result);
  });
});


// ===============================
// GET SINGLE BROKER
// ===============================
router.get("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    SELECT *
    FROM brokers
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log("GET BROKER ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch broker"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Broker not found"
      });
    }

    res.json(result[0]);
  });
});


// ===============================
// ADD BROKER
// ===============================
router.post("/add", (req, res) => {

  const {
    name,
    phone,
    email,
    address,
    commission,
    status
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    commission === "" ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all broker details"
    });
  }

  const sql = `
    INSERT INTO brokers
    (
      name,
      phone,
      email,
      address,
      commission,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email,
      address,
      commission,
      status
    ],
    (err, result) => {

      if (err) {
        console.log("ADD BROKER ERROR:", err);

        return res.status(500).json({
          message: "Broker could not be added"
        });
      }

      res.status(201).json({
        message: "Broker added successfully",
        id: result.insertId
      });
    }
  );
});


// ===============================
// UPDATE BROKER
// ===============================
router.put("/:id", (req, res) => {

  const { id } = req.params;

  const {
    name,
    phone,
    email,
    address,
    commission,
    status
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    commission === "" ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all broker details"
    });
  }

  const sql = `
    UPDATE brokers
    SET
      name = ?,
      phone = ?,
      email = ?,
      address = ?,
      commission = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email,
      address,
      commission,
      status,
      id
    ],
    (err, result) => {

      if (err) {
        console.log("UPDATE BROKER ERROR:", err);

        return res.status(500).json({
          message: "Broker could not be updated"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Broker not found"
        });
      }

      res.json({
        message: "Broker updated successfully"
      });
    }
  );
});


// ===============================
// DELETE BROKER
// ===============================
router.delete("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM brokers
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("DELETE BROKER ERROR:", err);

      return res.status(500).json({
        message: "Broker could not be deleted"
      });
    }

    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Broker not found"
      });
    }

    res.json({
      message: "Broker deleted successfully"
    });

  });
});


module.exports = router;

