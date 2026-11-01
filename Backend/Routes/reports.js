
const express = require("express");
const router = express.Router();

const db = require("../Db");


// =====================================================
// CUSTOMER REPORT
// =====================================================
router.get("/customers", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            customers.id,
            customers.name,
            customers.phone,
            customers.email,
            brokers.name AS broker,
            customers.status,

            DATE_FORMAT(
                customers.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM customers

        LEFT JOIN brokers
            ON customers.broker_id = brokers.id

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                customers.name LIKE ?
                OR customers.phone LIKE ?
                OR customers.email LIKE ?
                OR brokers.name LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND customers.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND customers.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND customers.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY customers.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("CUSTOMER REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching customer report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// BROKER REPORT
// =====================================================
router.get("/brokers", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            brokers.id,
            brokers.name,
            brokers.phone,
            brokers.email,
            brokers.commission,
            brokers.status,

            DATE_FORMAT(
                brokers.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM brokers

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                brokers.name LIKE ?
                OR brokers.phone LIKE ?
                OR brokers.email LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND brokers.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND brokers.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND brokers.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY brokers.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("BROKER REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching broker report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// BROKER PAYMENT REPORT
// =====================================================
router.get("/broker-payments", (req, res) => {

    const {
        search,
        broker_id,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            brokers.id AS broker_id,
            brokers.name AS broker_name,

            COALESCE(
                SUM(payments.paid_amount),
                0
            ) AS total_paid

        FROM brokers

        LEFT JOIN payments
            ON payments.broker_id = brokers.id

        WHERE 1 = 1
    `;

    const values = [];

    // ===============================
    // SEARCH BROKER
    // ===============================

    if (search) {

        sql += `
            AND brokers.name LIKE ?
        `;

        values.push(`%${search}%`);
    }


    // ===============================
    // FILTER BROKER
    // ===============================

    if (broker_id) {

        sql += `
            AND brokers.id = ?
        `;

        values.push(broker_id);
    }


    // ===============================
    // FILTER PAYMENT STATUS
    // ===============================

    if (status) {

        sql += `
            AND payments.status = ?
        `;

        values.push(status);
    }


    // ===============================
    // DATE FROM
    // ===============================

    if (from_date) {

        sql += `
            AND payments.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }


    // ===============================
    // DATE TO
    // ===============================

    if (to_date) {

        sql += `
            AND payments.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }


    sql += `
        GROUP BY
            brokers.id,
            brokers.name

        ORDER BY
            total_paid DESC
    `;


    db.query(sql, values, (err, result) => {

        if (err) {

            console.log(
                "BROKER PAYMENT REPORT ERROR:",
                err
            );

            return res.status(500).json({
                message:
                    "Error fetching broker payment report"
            });
        }


        res.json(result);
    });

});


// =====================================================
// LEAD REPORT
// =====================================================
router.get("/leads", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            leads.id,
            leads.name,
            leads.lead_source AS source,
            brokers.name AS broker,
            employees.name AS employee,
            leads.status,

            DATE_FORMAT(
                leads.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM leads

        LEFT JOIN brokers
            ON leads.broker_id = brokers.id

        LEFT JOIN employees
            ON leads.employee_id = employees.id

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                leads.name LIKE ?
                OR leads.phone LIKE ?
                OR leads.email LIKE ?
                OR leads.lead_source LIKE ?
                OR brokers.name LIKE ?
                OR employees.name LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND leads.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND leads.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND leads.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY leads.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("LEAD REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching lead report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// PROJECT REPORT
// =====================================================
router.get("/projects", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            projects.id,
            projects.name,
            projects.location,
            projects.project_type AS type,
            projects.budget,
            CONCAT(projects.progress, '%') AS progress,
            projects.status,

            DATE_FORMAT(
                projects.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM projects

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                projects.name LIKE ?
                OR projects.location LIKE ?
                OR projects.project_type LIKE ?
                OR projects.team LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND projects.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND projects.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND projects.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY projects.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("PROJECT REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching project report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// PROPERTY REPORT
// =====================================================
router.get("/properties", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            properties.id,
            properties.unit_number AS property,
            projects.name AS project,
            properties.property_type AS type,
            properties.area,
            properties.price,
            properties.status,

            DATE_FORMAT(
                properties.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM properties

        LEFT JOIN projects
            ON properties.project_id = projects.id

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                properties.unit_number LIKE ?
                OR properties.property_type LIKE ?
                OR properties.location LIKE ?
                OR projects.name LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND properties.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND properties.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND properties.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY properties.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("PROPERTY REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching property report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// PAYMENT REPORT
// =====================================================
router.get("/payments", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            payments.id,
            customers.name AS customer,
            projects.name AS project,
            payments.total_amount AS total,
            payments.paid_amount AS paid,
            payments.pending_amount AS pending,
            payments.payment_method AS method,
            payments.status,

            DATE_FORMAT(
                payments.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM payments

        LEFT JOIN customers
            ON payments.customer_id = customers.id

        LEFT JOIN projects
            ON payments.project_id = projects.id

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                customers.name LIKE ?
                OR projects.name LIKE ?
                OR payments.payment_method LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND payments.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND payments.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND payments.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY payments.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("PAYMENT REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching payment report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// SALES REPORT
// =====================================================
router.get("/sales", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            properties.id,
            customers.name AS customer,
            properties.unit_number AS property,
            projects.name AS project,
            properties.price AS amount,
            brokers.name AS broker,
            properties.status,

            DATE_FORMAT(
                properties.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM properties

        LEFT JOIN customers
            ON properties.customer_id = customers.id

        LEFT JOIN projects
            ON properties.project_id = projects.id

        LEFT JOIN brokers
            ON customers.broker_id = brokers.id

        WHERE properties.customer_id IS NOT NULL
        AND properties.status = 'Sold'
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                customers.name LIKE ?
                OR properties.unit_number LIKE ?
                OR projects.name LIKE ?
                OR brokers.name LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND properties.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND properties.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND properties.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY properties.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log("SALES REPORT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching sales report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// PENDING PAYMENT REPORT
// =====================================================
router.get("/pending-payments", (req, res) => {

    const {
        search,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            payments.id,
            customers.name AS customer,
            projects.name AS project,
            payments.total_amount AS total,
            payments.paid_amount AS paid,
            payments.pending_amount AS pending,
            payments.status,

            DATE_FORMAT(
                payments.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time

        FROM payments

        LEFT JOIN customers
            ON payments.customer_id = customers.id

        LEFT JOIN projects
            ON payments.project_id = projects.id

        WHERE payments.pending_amount > 0
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                customers.name LIKE ?
                OR projects.name LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue
        );
    }

    if (from_date) {
        sql += `
            AND payments.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND payments.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY payments.pending_amount DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log(
                "PENDING PAYMENT REPORT ERROR:",
                err
            );

            return res.status(500).json({
                message:
                    "Error fetching pending payment report"
            });
        }

        res.json(result);
    });
});


// =====================================================
// FOLLOW-UP REPORT
// =====================================================
router.get("/followups", (req, res) => {

    const {
        search,
        status,
        from_date,
        to_date
    } = req.query;

    let sql = `
        SELECT
            follow_ups.id,
            follow_ups.title AS task,

            COALESCE(
                customers.name,
                leads.name
            ) AS customerLead,

            employees.name AS assignedTo,

            DATE_FORMAT(
                follow_ups.created_at,
                '%Y-%m-%d %H:%i:%s'
            ) AS date_time,

            follow_ups.status,
            follow_ups.notes

        FROM follow_ups

        LEFT JOIN customers
            ON follow_ups.customer_id = customers.id

        LEFT JOIN leads
            ON follow_ups.lead_id = leads.id

        LEFT JOIN employees
            ON follow_ups.employee_id = employees.id

        WHERE 1 = 1
    `;

    const values = [];

    if (search) {
        sql += `
            AND (
                follow_ups.title LIKE ?
                OR customers.name LIKE ?
                OR leads.name LIKE ?
                OR employees.name LIKE ?
                OR follow_ups.notes LIKE ?
            )
        `;

        const searchValue = `%${search}%`;

        values.push(
            searchValue,
            searchValue,
            searchValue,
            searchValue,
            searchValue
        );
    }

    if (status) {
        sql += `
            AND follow_ups.status = ?
        `;

        values.push(status);
    }

    if (from_date) {
        sql += `
            AND follow_ups.created_at >= ?
        `;

        values.push(`${from_date} 00:00:00`);
    }

    if (to_date) {
        sql += `
            AND follow_ups.created_at < DATE_ADD(?, INTERVAL 1 DAY)
        `;

        values.push(to_date);
    }

    sql += `
        ORDER BY follow_ups.id DESC
    `;

    db.query(sql, values, (err, result) => {

        if (err) {
            console.log(
                "FOLLOW-UP REPORT ERROR:",
                err
            );

            return res.status(500).json({
                message:
                    "Error fetching follow-up report"
            });
        }

        res.json(result);
    });
});




/* =====================================================
   INVENTORY REPORT
   ===================================================== */

router.get("/inventory", (req, res) => {
  const { search, status, from_date, to_date } = req.query;

  let sql = `
    SELECT
      p.id,
      p.unit_number AS item_name,
      p.property_type AS category,
      p.area,
      p.price,
      p.location,
      pr.name AS project_name,
      c.name AS customer_name,
      b.name AS broker_name,
      p.status,
      p.active_status,
      DATE_FORMAT(
        p.created_at,
        '%Y-%m-%d %H:%i:%s'
      ) AS date_time
    FROM properties p
    LEFT JOIN projects pr
      ON p.project_id = pr.id
    LEFT JOIN customers c
      ON p.customer_id = c.id
    LEFT JOIN brokers b
      ON c.broker_id = b.id
    WHERE 1 = 1
  `;

  const values = [];

  if (search && search.trim()) {
    sql += `
      AND (
        p.unit_number LIKE ?
        OR p.property_type LIKE ?
        OR p.location LIKE ?
        OR pr.name LIKE ?
        OR c.name LIKE ?
        OR b.name LIKE ?
      )
    `;

    const searchValue = `%${search.trim()}%`;
    values.push(
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue,
      searchValue
    );
  }

  if (status) {
    sql += ` AND p.status = ?`;
    values.push(status);
  }

  if (from_date) {
    sql += ` AND p.created_at >= ?`;
    values.push(`${from_date} 00:00:00`);
  }

  if (to_date) {
    sql += ` AND p.created_at < DATE_ADD(?, INTERVAL 1 DAY)`;
    values.push(to_date);
  }

  sql += ` ORDER BY p.id DESC`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("INVENTORY REPORT ERROR:", err);
      return res.status(500).json({
        message: "Error fetching inventory report",
        error: err.message
      });
    }

    res.json(result);
  });
});


module.exports = router;

