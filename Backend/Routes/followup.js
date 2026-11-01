const { createNotification } = require("./notifications");

const express = require("express");
const router = express.Router();

const db = require("../Db");

// ===============================
// GET ALL FOLLOW-UPS
// ===============================
router.get("/all", (req, res) => {

    const sql = `
        SELECT
            follow_ups.*,

            customers.name AS customer_name,
            leads.name AS lead_name,
            brokers.name AS broker_name,
            employees.name AS employee_name

        FROM follow_ups

        LEFT JOIN customers
            ON follow_ups.customer_id = customers.id

        LEFT JOIN leads
            ON follow_ups.lead_id = leads.id

        LEFT JOIN brokers
            ON follow_ups.broker_id = brokers.id

        LEFT JOIN employees
            ON follow_ups.employee_id = employees.id

        ORDER BY follow_ups.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.log("GET FOLLOW-UPS ERROR:", err);

            return res.status(500).json({
                message: "Error fetching follow-ups"
            });
        }

        res.json(result);
    });
});


// ===============================
// GET FOLLOW-UP BY ID
// ===============================
router.get("/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            follow_ups.*,

            customers.name AS customer_name,
            leads.name AS lead_name,
            brokers.name AS broker_name,
            employees.name AS employee_name

        FROM follow_ups

        LEFT JOIN customers
            ON follow_ups.customer_id = customers.id

        LEFT JOIN leads
            ON follow_ups.lead_id = leads.id

        LEFT JOIN brokers
            ON follow_ups.broker_id = brokers.id

        LEFT JOIN employees
            ON follow_ups.employee_id = employees.id

        WHERE follow_ups.id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log("GET FOLLOW-UP ERROR:", err);

            return res.status(500).json({
                message: "Error fetching follow-up"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Follow-up not found"
            });
        }

        res.json(result[0]);
    });
});


// ===============================
// ADD FOLLOW-UP
// ===============================
router.post("/add", (req, res) => {

    const {
        title,
        follow_up_date,
        customer_id,
        lead_id,
        broker_id,
        employee_id,
        notes,
        status
    } = req.body;


    if (!title || !follow_up_date) {

        return res.status(400).json({
            message: "Title and follow-up date are required"
        });
    }


    const sql = `
        INSERT INTO follow_ups
        (
            title,
            follow_up_date,
            customer_id,
            lead_id,
            broker_id,
            employee_id,
            notes,
            status
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            title,
            follow_up_date,
            customer_id || null,
            lead_id || null,
            broker_id || null,
            employee_id || null,
            notes || null,
            status || "Pending"
        ],

        (err, result) => {

            if (err) {

                console.log("ADD FOLLOW-UP ERROR:", err);

                return res.status(500).json({
                    message: "Error adding follow-up"
                });
            }


            res.status(201).json({

                message: "Follow-up added successfully",

                id: result.insertId

            });

        }
    );
});


// ===============================
// UPDATE FOLLOW-UP
// ===============================
router.put("/:id", (req, res) => {

    const { id } = req.params;

    const {
        title,
        follow_up_date,
        customer_id,
        lead_id,
        broker_id,
        employee_id,
        notes,
        status
    } = req.body;


    if (!title || !follow_up_date) {

        return res.status(400).json({
            message: "Title and follow-up date are required"
        });

    }


    const sql = `
        UPDATE follow_ups

        SET
            title = ?,
            follow_up_date = ?,
            customer_id = ?,
            lead_id = ?,
            broker_id = ?,
            employee_id = ?,
            notes = ?,
            status = ?

        WHERE id = ?
    `;


    db.query(
        sql,
        [
            title,
            follow_up_date,
            customer_id || null,
            lead_id || null,
            broker_id || null,
            employee_id || null,
            notes || null,
            status || "Pending",
            id
        ],

        (err, result) => {

            if (err) {

                console.log("UPDATE FOLLOW-UP ERROR:", err);

                return res.status(500).json({
                    message: "Error updating follow-up"
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Follow-up not found"
                });

            }


            res.json({
                message: "Follow-up updated successfully"
            });

        }
    );
});


// ===============================
// DELETE FOLLOW-UP
// ===============================
router.delete("/:id", (req, res) => {

    const { id } = req.params;


    const sql = `
        DELETE FROM follow_ups
        WHERE id = ?
    `;


    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("DELETE FOLLOW-UP ERROR:", err);

            return res.status(500).json({
                message: "Error deleting follow-up"
            });

        }


        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Follow-up not found"
            });

        }


        res.json({
            message: "Follow-up deleted successfully"
        });

    });

});


module.exports = router;

