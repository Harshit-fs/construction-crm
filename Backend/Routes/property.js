
const express = require("express");
const router = express.Router();

const db = require("../Db");


// ===============================
// GET ALL PROPERTIES
// ===============================

router.get("/all", (req, res) => {

  const sql = `
    SELECT
      properties.id,
      properties.property_type,
      properties.area,
      properties.price,
      properties.location,
      properties.project_id,
      projects.name AS project_name,
      properties.unit_number,
      properties.floor,
      properties.status,
      properties.active_status,
      properties.customer_id,
      customers.name AS customer_name,
      properties.created_at

    FROM properties

    LEFT JOIN projects
      ON properties.project_id = projects.id

    LEFT JOIN customers
      ON properties.customer_id = customers.id

    ORDER BY properties.id DESC
  `;


  db.query(sql, (err, result) => {

    if (err) {

      console.log("GET PROPERTIES ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch properties"
      });

    }

    res.json(result);

  });

});


// ===============================
// GET SINGLE PROPERTY
// ===============================

router.get("/:id", (req, res) => {

  const { id } = req.params;


  const sql = `
    SELECT
      properties.id,
      properties.property_type,
      properties.area,
      properties.price,
      properties.location,
      properties.project_id,
      projects.name AS project_name,
      properties.unit_number,
      properties.floor,
      properties.status,
      properties.active_status,
      properties.customer_id,
      customers.name AS customer_name,
      properties.created_at

    FROM properties

    LEFT JOIN projects
      ON properties.project_id = projects.id

    LEFT JOIN customers
      ON properties.customer_id = customers.id

    WHERE properties.id = ?
  `;


  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("GET PROPERTY ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch property"
      });

    }


    if (result.length === 0) {

      return res.status(404).json({
        message: "Property not found"
      });

    }


    res.json(result[0]);

  });

});


// ===============================
// ADD PROPERTY
// ===============================

router.post("/add", (req, res) => {

  const {
    property_type,
    area,
    price,
    location,
    project_id,
    unit_number,
    floor,
    status,
    active_status,
    customer_id
  } = req.body;


  if (
    !property_type ||
    !area ||
    !location ||
    !status
  ) {

    return res.status(400).json({
      message: "Please fill all required property details"
    });

  }


  const finalActiveStatus =
    active_status === "Inactive"
      ? "Inactive"
      : "Active";


  const sql = `
    INSERT INTO properties
    (
      property_type,
      area,
      price,
      location,
      project_id,
      unit_number,
      floor,
      status,
      active_status,
      customer_id
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    sql,
    [
      property_type,
      area,
      price || 0,
      location,
      project_id || null,
      unit_number || null,
      floor || null,
      status,
      finalActiveStatus,
      customer_id || null
    ],

    (err, result) => {

      if (err) {

        console.log("ADD PROPERTY ERROR:", err);

        return res.status(500).json({
          message: "Property could not be added"
        });

      }


      res.status(201).json({

        message: "Property added successfully",

        id: result.insertId

      });

    }
  );

});


// ===============================
// UPDATE PROPERTY
// ===============================

router.put("/:id", (req, res) => {

  const { id } = req.params;


  const {
    property_type,
    area,
    price,
    location,
    project_id,
    unit_number,
    floor,
    status,
    active_status,
    customer_id
  } = req.body;


  if (
    !property_type ||
    !area ||
    !location ||
    !status
  ) {

    return res.status(400).json({
      message: "Please fill all required property details"
    });

  }


  const finalActiveStatus =
    active_status === "Inactive"
      ? "Inactive"
      : "Active";


  const sql = `
    UPDATE properties

    SET
      property_type = ?,
      area = ?,
      price = ?,
      location = ?,
      project_id = ?,
      unit_number = ?,
      floor = ?,
      status = ?,
      active_status = ?,
      customer_id = ?

    WHERE id = ?
  `;


  db.query(
    sql,
    [
      property_type,
      area,
      price || 0,
      location,
      project_id || null,
      unit_number || null,
      floor || null,
      status,
      finalActiveStatus,
      customer_id || null,
      id
    ],

    (err, result) => {

      if (err) {

        console.log("UPDATE PROPERTY ERROR:", err);

        return res.status(500).json({
          message: "Property could not be updated"
        });

      }


      if (result.affectedRows === 0) {

        return res.status(404).json({
          message: "Property not found"
        });

      }


      res.json({
        message: "Property updated successfully"
      });

    }
  );

});


// ===============================
// DELETE PROPERTY
// ===============================

router.delete("/:id", (req, res) => {

  const { id } = req.params;


  const sql = `
    DELETE FROM properties
    WHERE id = ?
  `;


  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("DELETE PROPERTY ERROR:", err);

      return res.status(500).json({
        message: "Property could not be deleted"
      });

    }


    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Property not found"
      });

    }


    res.json({
      message: "Property deleted successfully"
    });

  });

});


module.exports = router;

