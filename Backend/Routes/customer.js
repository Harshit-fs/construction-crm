const { createNotification } = require("./notifications");

const express = require("express");
const router = express.Router();

const db = require("../Db");

// GET ALL CUSTOMERS
router.get("/all", (req, res) => {
  const sql = `
    SELECT
      customers.id,
      customers.name,
      customers.phone,
      customers.email,
      customers.address,
      customers.broker_id,
      brokers.name AS broker_name,
      customers.status,
      customers.created_at
    FROM customers
    LEFT JOIN brokers
      ON customers.broker_id = brokers.id
    ORDER BY customers.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("GET CUSTOMERS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch customers"
      });
    }

    res.json(result);
  });
});

// GET SINGLE CUSTOMER
router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      customers.id,
      customers.name,
      customers.phone,
      customers.email,
      customers.address,
      customers.broker_id,
      brokers.name AS broker_name,
      customers.status,
      customers.created_at
    FROM customers
    LEFT JOIN brokers
      ON customers.broker_id = brokers.id
    WHERE customers.id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("GET CUSTOMER ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch customer"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json(result[0]);
  });
});

// ADD CUSTOMER
router.post("/add", (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    broker_id,
    status
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    !broker_id ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all customer details"
    });
  }

  const sql = `
    INSERT INTO customers
    (name, phone, email, address, broker_id, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      name,
      phone,
      email,
      address,
      broker_id,
      status
    ],
    (err, result) => {
      if (err) {
        console.log("ADD CUSTOMER ERROR:", err);

        return res.status(500).json({
          message: "Customer could not be added"
        });
      }

      createNotification("New Customer Added", `Customer ${name} registered`, "customer", result.insertId);
      res.status(201).json({
        message: "Customer added successfully",
        id: result.insertId
      });
    }
  );
});

// UPDATE CUSTOMER
router.put("/:id", (req, res) => {
  const { id } = req.params;

  const {
    name,
    phone,
    email,
    address,
    broker_id,
    status
  } = req.body;

  if (
    !name ||
    !phone ||
    !email ||
    !address ||
    !broker_id ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all customer details"
    });
  }

  const sql = `
    UPDATE customers
    SET
      name = ?,
      phone = ?,
      email = ?,
      address = ?,
      broker_id = ?,
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
      broker_id,
      status,
      id
    ],
    (err, result) => {
      if (err) {
        console.log("UPDATE CUSTOMER ERROR:", err);

        return res.status(500).json({
          message: "Customer could not be updated"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Customer not found"
        });
      }

      res.json({
        message: "Customer updated successfully"
      });
    }
  );
});

// DELETE CUSTOMER
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM customers
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE CUSTOMER ERROR:", err);

      return res.status(500).json({
        message: "Customer could not be deleted"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Customer not found"
      });
    }

    res.json({
      message: "Customer deleted successfully"
    });
  });
});

module.exports = router;

