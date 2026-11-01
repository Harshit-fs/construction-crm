const express = require("express");
const router = express.Router();

const db = require("../Db");

// =====================================
// GET ALL EMPLOYEES
// =====================================

router.get("/all", (req, res) => {

  const sql = `
    SELECT
      employees.id,
      employees.name,
      employees.designation,
      employees.department,
      employees.phone,
      employees.email,
      employees.project_id,
      projects.name AS project_name,
      employees.status,
      employees.created_at

    FROM employees

    LEFT JOIN projects
      ON employees.project_id = projects.id

    ORDER BY employees.id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log("GET EMPLOYEES ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch employees"
      });
    }

    res.json(result);

  });

});


// =====================================
// GET SINGLE EMPLOYEE
// =====================================

router.get("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    SELECT
      employees.id,
      employees.name,
      employees.designation,
      employees.department,
      employees.phone,
      employees.email,
      employees.project_id,
      projects.name AS project_name,
      employees.status,
      employees.created_at

    FROM employees

    LEFT JOIN projects
      ON employees.project_id = projects.id

    WHERE employees.id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log("GET EMPLOYEE ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch employee"
      });
    }

    if (result.length === 0) {

      return res.status(404).json({
        message: "Employee not found"
      });

    }

    res.json(result[0]);

  });

});


// =====================================
// ADD EMPLOYEE
// =====================================

router.post("/add", (req, res) => {

  const {
    name,
    designation,
    department,
    phone,
    email,
    project_id,
    status
  } = req.body;


  if (
    !name ||
    !designation ||
    !department ||
    !phone ||
    !email ||
    !status
  ) {

    return res.status(400).json({
      message: "Please fill all required employee details"
    });

  }


  const sql = `
    INSERT INTO employees
    (
      name,
      designation,
      department,
      phone,
      email,
      project_id,
      status
    )

    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    sql,
    [
      name,
      designation,
      department,
      phone,
      email,
      project_id || null,
      status
    ],

    (err, result) => {

      if (err) {

        console.log("ADD EMPLOYEE ERROR:", err);

        return res.status(500).json({
          message: "Employee could not be added"
        });

      }


      res.status(201).json({

        message: "Employee added successfully",

        id: result.insertId

      });

    }
  );

});


// =====================================
// UPDATE EMPLOYEE
// =====================================

router.put("/:id", (req, res) => {

  const { id } = req.params;

  const {
    name,
    designation,
    department,
    phone,
    email,
    project_id,
    status
  } = req.body;


  if (
    !name ||
    !designation ||
    !department ||
    !phone ||
    !email ||
    !status
  ) {

    return res.status(400).json({
      message: "Please fill all required employee details"
    });

  }


  const sql = `
    UPDATE employees

    SET
      name = ?,
      designation = ?,
      department = ?,
      phone = ?,
      email = ?,
      project_id = ?,
      status = ?

    WHERE id = ?
  `;


  db.query(
    sql,
    [
      name,
      designation,
      department,
      phone,
      email,
      project_id || null,
      status,
      id
    ],

    (err, result) => {

      if (err) {

        console.log("UPDATE EMPLOYEE ERROR:", err);

        return res.status(500).json({
          message: "Employee could not be updated"
        });

      }


      if (result.affectedRows === 0) {

        return res.status(404).json({
          message: "Employee not found"
        });

      }


      res.json({
        message: "Employee updated successfully"
      });

    }
  );

});


// =====================================
// DELETE EMPLOYEE
// =====================================

router.delete("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM employees
    WHERE id = ?
  `;


  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("DELETE EMPLOYEE ERROR:", err);

      return res.status(500).json({
        message: "Employee could not be deleted"
      });

    }


    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Employee not found"
      });

    }


    res.json({
      message: "Employee deleted successfully"
    });

  });

});


module.exports = router;