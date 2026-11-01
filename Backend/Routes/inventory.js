
const express = require("express");
const router = express.Router();

const db = require("../Db");


// =====================================
// GET INVENTORY
// =====================================

router.get("/all", (req, res) => {

  const sql = `
    SELECT
      properties.id,
      properties.unit_number,
      properties.property_type,
      properties.area,
      properties.price,
      properties.location,

      properties.project_id,
      projects.name AS project_name,

      properties.customer_id,
      customers.name AS customer_name,

      customers.broker_id,
      brokers.name AS broker_name,

      properties.status,
      properties.active_status,
      properties.created_at

    FROM properties

    LEFT JOIN projects
      ON properties.project_id = projects.id

    LEFT JOIN customers
      ON properties.customer_id = customers.id

    LEFT JOIN brokers
      ON customers.broker_id = brokers.id

    ORDER BY properties.id DESC
  `;


  db.query(sql, (err, result) => {

    if (err) {

      console.log(
        "GET INVENTORY ERROR:",
        err
      );

      return res.status(500).json({
        message: "Failed to fetch inventory"
      });
    }


    res.json(result);

  });

});


/* =====================================================
   INVENTORY REPORT
   Uses the existing properties table
   ===================================================== */

router.get("/inventory", (req, res) => {
  const { search, status, from_date, to_date } = req.query;

  let sql = `
    SELECT
      properties.id,
      properties.unit_number AS item_name,
      properties.property_type AS category,
      properties.area,
      properties.price,
      properties.location,
      projects.name AS project_name,
      customers.name AS customer_name,
      brokers.name AS broker_name,
      properties.status,
      properties.active_status,
      DATE_FORMAT(
        properties.created_at,
        '%Y-%m-%d %H:%i:%s'
      ) AS date_time
    FROM properties
    LEFT JOIN projects
      ON properties.project_id = projects.id
    LEFT JOIN customers
      ON properties.customer_id = customers.id
    LEFT JOIN brokers
      ON customers.broker_id = brokers.id
    WHERE 1 = 1
  `;

  const values = [];

  if (search && search.trim()) {
    const searchValue = `%${search.trim()}%`;

    sql += `
      AND (
        properties.unit_number LIKE ?
        OR properties.property_type LIKE ?
        OR properties.location LIKE ?
        OR projects.name LIKE ?
        OR customers.name LIKE ?
        OR brokers.name LIKE ?
      )
    `;

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
    sql += ` AND properties.status = ?`;
    values.push(status);
  }

  if (from_date) {
    sql += ` AND properties.created_at >= ?`;
    values.push(`${from_date} 00:00:00`);
  }

  if (to_date) {
    sql += ` AND properties.created_at < DATE_ADD(?, INTERVAL 1 DAY)`;
    values.push(to_date);
  }

  sql += ` ORDER BY properties.id DESC`;

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("INVENTORY REPORT ERROR:", err);

      return res.status(500).json({
        message: "Error fetching inventory report",
      });
    }

    res.json(result);
  });
});


module.exports = router;
