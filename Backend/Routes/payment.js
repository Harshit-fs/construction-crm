const { createNotification } = require("./notifications");

const express = require("express");
const router = express.Router();

const db = require("../Db");


// =====================================
// GET ALL PAYMENTS
// =====================================

router.get("/all", (req, res) => {

  const sql = `
    SELECT
      payments.id,

      payments.customer_id,
      customers.name AS customer_name,

      payments.broker_id,
      brokers.name AS broker_name,

      payments.project_id,
      projects.name AS project_name,

      payments.total_amount,
      payments.paid_amount,
      payments.pending_amount,

      payments.payment_date,
      payments.payment_method,
      payments.status,

      payments.created_at

    FROM payments

    LEFT JOIN customers
      ON payments.customer_id = customers.id

    LEFT JOIN brokers
      ON payments.broker_id = brokers.id

    LEFT JOIN projects
      ON payments.project_id = projects.id

    ORDER BY payments.id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log("GET PAYMENTS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch payments"
      });

    }

    res.json(result);

  });

});


// =====================================
// GET SINGLE PAYMENT
// =====================================

router.get("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    SELECT
      payments.id,

      payments.customer_id,
      customers.name AS customer_name,

      payments.broker_id,
      brokers.name AS broker_name,

      payments.project_id,
      projects.name AS project_name,

      payments.total_amount,
      payments.paid_amount,
      payments.pending_amount,

      payments.payment_date,
      payments.payment_method,
      payments.status,

      payments.created_at

    FROM payments

    LEFT JOIN customers
      ON payments.customer_id = customers.id

    LEFT JOIN brokers
      ON payments.broker_id = brokers.id

    LEFT JOIN projects
      ON payments.project_id = projects.id

    WHERE payments.id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("GET PAYMENT ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch payment"
      });

    }

    if (result.length === 0) {

      return res.status(404).json({
        message: "Payment not found"
      });

    }

    res.json(result[0]);

  });

});


// =====================================
// ADD PAYMENT
// =====================================

router.post("/add", (req, res) => {

  const {
    customer_id,
    broker_id,
    project_id,
    total_amount,
    paid_amount,
    payment_date,
    payment_method
  } = req.body;


  // Required fields

  if (
    !customer_id ||
    !project_id ||
    !total_amount ||
    !payment_date ||
    !payment_method
  ) {

    return res.status(400).json({
      message: "Please fill all required payment details"
    });

  }


  const total = Number(total_amount);
  const paid = Number(paid_amount || 0);

  // Broker optional
  const brokerId = broker_id
    ? Number(broker_id)
    : null;


  // Check paid amount

  if (paid < 0) {

    return res.status(400).json({
      message: "Paid amount cannot be negative"
    });

  }


  if (paid > total) {

    return res.status(400).json({
      message: "Paid amount cannot be greater than total amount"
    });

  }


  // Calculate pending amount

  const pending = total - paid;


  // Calculate status

  let status = "Pending";

  if (paid === total) {

    status = "Paid";

  } else if (paid > 0) {

    status = "Partial";

  }


  const sql = `
    INSERT INTO payments
    (
      customer_id,
      broker_id,
      project_id,
      total_amount,
      paid_amount,
      pending_amount,
      payment_date,
      payment_method,
      status
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    sql,
    [
      customer_id,
      brokerId,
      project_id,
      total,
      paid,
      pending,
      payment_date,
      payment_method,
      status
    ],

    (err, result) => {

      if (err) {

        console.log("ADD PAYMENT ERROR:", err);

        return res.status(500).json({
          message: "Payment could not be added"
        });

      }


      createNotification("Payment Received", `Payment of ₹${paid || total} received (${status})`, "payment", result.insertId);
      res.status(201).json({

        message: "Payment added successfully",

        id: result.insertId

      });

    }
  );

});


// =====================================
// UPDATE PAYMENT
// =====================================

router.put("/:id", (req, res) => {

  const { id } = req.params;

  const {
    customer_id,
    broker_id,
    project_id,
    total_amount,
    paid_amount,
    payment_date,
    payment_method
  } = req.body;


  if (
    !customer_id ||
    !project_id ||
    !total_amount ||
    !payment_date ||
    !payment_method
  ) {

    return res.status(400).json({
      message: "Please fill all required payment details"
    });

  }


  const total = Number(total_amount);
  const paid = Number(paid_amount || 0);

  // Broker optional
  const brokerId = broker_id
    ? Number(broker_id)
    : null;


  if (paid < 0) {

    return res.status(400).json({
      message: "Paid amount cannot be negative"
    });

  }


  if (paid > total) {

    return res.status(400).json({
      message: "Paid amount cannot be greater than total amount"
    });

  }


  const pending = total - paid;


  let status = "Pending";

  if (paid === total) {

    status = "Paid";

  } else if (paid > 0) {

    status = "Partial";

  }


  const sql = `
    UPDATE payments

    SET
      customer_id = ?,
      broker_id = ?,
      project_id = ?,
      total_amount = ?,
      paid_amount = ?,
      pending_amount = ?,
      payment_date = ?,
      payment_method = ?,
      status = ?

    WHERE id = ?
  `;


  db.query(
    sql,
    [
      customer_id,
      brokerId,
      project_id,
      total,
      paid,
      pending,
      payment_date,
      payment_method,
      status,
      id
    ],

    (err, result) => {

      if (err) {

        console.log("UPDATE PAYMENT ERROR:", err);

        return res.status(500).json({
          message: "Payment could not be updated"
        });

      }


      if (result.affectedRows === 0) {

        return res.status(404).json({
          message: "Payment not found"
        });

      }


      res.json({
        message: "Payment updated successfully"
      });

    }
  );

});


// =====================================
// DELETE PAYMENT
// =====================================

router.delete("/:id", (req, res) => {

  const { id } = req.params;


  const sql = `
    DELETE FROM payments
    WHERE id = ?
  `;


  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("DELETE PAYMENT ERROR:", err);

      return res.status(500).json({
        message: "Payment could not be deleted"
      });

    }


    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Payment not found"
      });

    }


    res.json({
      message: "Payment deleted successfully"
    });

  });

});


module.exports = router;

