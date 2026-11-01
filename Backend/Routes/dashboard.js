
const express = require("express");
const router = express.Router();
const db = require("../Db");

// =====================================================
// DASHBOARD SUMMARY API
// =====================================================
router.get("/summary", (req, res) => {

  const queries = {

    // ================================
    // PROJECTS
    // ================================

    projects: `
      SELECT
        COUNT(*) AS total,

        COALESCE(
          SUM(status = 'Ongoing'),
          0
        ) AS ongoing,

        COALESCE(
          SUM(status = 'Completed'),
          0
        ) AS completed,

        COALESCE(
          SUM(status = 'Upcoming'),
          0
        ) AS upcoming,

        COALESCE(
          SUM(status = 'On Hold'),
          0
        ) AS onHold

      FROM projects
    `,

    // ================================
    // CUSTOMERS
    // ================================

    customers: `
      SELECT
        COUNT(*) AS total
      FROM customers
    `,

    // ================================
    // BROKERS
    // ================================

    brokers: `
      SELECT
        COUNT(*) AS total
      FROM brokers
    `,

    // ================================
    // EMPLOYEES
    // ================================

    employees: `
      SELECT
        COUNT(*) AS total
      FROM employees
    `,

    // ================================
    // LEADS
    // ================================

    leads: `
      SELECT

        COUNT(*) AS total,

        COALESCE(
          SUM(status = 'New'),
          0
        ) AS newLeads,

        COALESCE(
          SUM(status = 'Contacted'),
          0
        ) AS contacted,

        COALESCE(
          SUM(status = 'Follow-up'),
          0
        ) AS followUp,

        COALESCE(
          SUM(status = 'Converted'),
          0
        ) AS converted

      FROM leads
    `,

    // ================================
    // PAYMENTS
    // ================================

    payments: `
      SELECT

        COALESCE(
          SUM(total_amount),
          0
        ) AS total,

        COALESCE(
          SUM(paid_amount),
          0
        ) AS paid,

        COALESCE(
          SUM(pending_amount),
          0
        ) AS pending

      FROM payments
    `,
  };


  const keys = Object.keys(queries);

  const results = {};

  let completed = 0;

  let hasError = false;


  keys.forEach((key) => {

    db.query(
      queries[key],
      (err, rows) => {

        if (hasError) {
          return;
        }


        // ================================
        // ERROR
        // ================================

        if (err) {

          hasError = true;

          console.log(
            "DASHBOARD ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Error fetching dashboard data",
            error:
              err.message,
          });
        }


        // ================================
        // SAVE RESULT
        // ================================

        results[key] =
          rows[0];


        completed++;


        // ================================
        // ALL QUERIES COMPLETE
        // ================================

        if (
          completed ===
          keys.length
        ) {

          res.json(
            results
          );

        }

      }
    );

  });

});


// =====================================================
// PENDING FOLLOW-UPS / TASKS
// =====================================================
router.get(
  "/pending-followups",
  (req, res) => {

    const sql = `

      SELECT

        follow_ups.id,

        follow_ups.title AS task,


        COALESCE(
          customers.name,
          leads.name
        ) AS customerLead,


        employees.name AS assignedTo,


        DATE_FORMAT(
          follow_ups.follow_up_date,
          '%Y-%m-%d'
        ) AS follow_up_date,


        follow_ups.status,


        follow_ups.notes


      FROM follow_ups


      LEFT JOIN customers
        ON follow_ups.customer_id =
           customers.id


      LEFT JOIN leads
        ON follow_ups.lead_id =
           leads.id


      LEFT JOIN employees
        ON follow_ups.employee_id =
           employees.id


      WHERE

        follow_ups.status IS NULL

        OR TRIM(
          LOWER(
            follow_ups.status
          )
        ) <> 'completed'


      ORDER BY

        CASE

          WHEN
            follow_ups.status IS NULL
            THEN 1

          WHEN
            TRIM(
              LOWER(
                follow_ups.status
              )
            ) = 'pending'
            THEN 1

          WHEN
            TRIM(
              LOWER(
                follow_ups.status
              )
            ) = 'in progress'
            THEN 2

          WHEN
            TRIM(
              LOWER(
                follow_ups.status
              )
            ) = 'overdue'
            THEN 3

          ELSE 4

        END,

        follow_ups.follow_up_date ASC,

        follow_ups.id DESC


      LIMIT 10

    `;


    db.query(
      sql,
      (err, result) => {

        // ================================
        // ERROR
        // ================================

        if (err) {

          console.log(
            "PENDING FOLLOWUP ERROR:",
            err
          );

          return res.status(500).json({
            message:
              "Error fetching pending follow-ups",

            error:
              err.message,
          });

        }


        // ================================
        // RESULT
        // ================================

        console.log(
          "PENDING FOLLOWUPS:",
          result
        );


        res.json(
          result
        );

      }
    );

  }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
