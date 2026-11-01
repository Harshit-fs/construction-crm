const { createNotification } = require("./notifications");
const express = require("express");
const router = express.Router();

const db = require("../Db");

// =====================================
// GET ALL PROJECTS
// =====================================

router.get("/all", (req, res) => {

  const sql = `
    SELECT
      id,
      name,
      location,
      project_type,
      description,
      image,
      start_date,
      completion_date,
      status,
      team,
      budget,
      progress,
      created_at
    FROM projects
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {
      console.log("GET PROJECTS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch projects"
      });
    }

    res.json(result);

  });

});


// =====================================
// GET SINGLE PROJECT
// =====================================

router.get("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    SELECT
      id,
      name,
      location,
      project_type,
      description,
      image,
      start_date,
      completion_date,
      status,
      team,
      budget,
      progress,
      created_at
    FROM projects
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log("GET PROJECT ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch project"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    res.json(result[0]);

  });

});


// =====================================
// ADD PROJECT
// =====================================

router.post("/add", (req, res) => {

  const {
    name,
    location,
    project_type,
    description,
    image,
    start_date,
    completion_date,
    status,
    team,
    budget,
    progress
  } = req.body;


  if (
    !name ||
    !location ||
    !project_type ||
    !status
  ) {

    return res.status(400).json({
      message: "Please fill all required project details"
    });

  }


  const sql = `
    INSERT INTO projects
    (
      name,
      location,
      project_type,
      description,
      image,
      start_date,
      completion_date,
      status,
      team,
      budget,
      progress
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;


  db.query(
    sql,
    [
      name,
      location,
      project_type,
      description || null,
      image || null,
      start_date || null,
      completion_date || null,
      status,
      team || null,
      budget || 0,
      progress || 0
    ],
    (err, result) => {

      if (err) {

        console.log("ADD PROJECT ERROR:", err);

        return res.status(500).json({
          message: "Project could not be added"
        });

      }


      createNotification("New Project Added", `Project ${name} created (${status})`, "project", result.insertId);
      res.status(201).json({
        message: "Project added successfully",
        id: result.insertId
      });

    }
  );

});


// =====================================
// UPDATE PROJECT
// =====================================

router.put("/:id", (req, res) => {

  const { id } = req.params;

  const {
    name,
    location,
    project_type,
    description,
    image,
    start_date,
    completion_date,
    status,
    team,
    budget,
    progress
  } = req.body;


  if (
    !name ||
    !location ||
    !project_type ||
    !status
  ) {

    return res.status(400).json({
      message: "Please fill all required project details"
    });

  }


  const sql = `
    UPDATE projects
    SET
      name = ?,
      location = ?,
      project_type = ?,
      description = ?,
      image = ?,
      start_date = ?,
      completion_date = ?,
      status = ?,
      team = ?,
      budget = ?,
      progress = ?
    WHERE id = ?
  `;


  db.query(
    sql,
    [
      name,
      location,
      project_type,
      description || null,
      image || null,
      start_date || null,
      completion_date || null,
      status,
      team || null,
      budget || 0,
      progress || 0,
      id
    ],
    (err, result) => {

      if (err) {

        console.log("UPDATE PROJECT ERROR:", err);

        return res.status(500).json({
          message: "Project could not be updated"
        });

      }


      if (result.affectedRows === 0) {

        return res.status(404).json({
          message: "Project not found"
        });

      }


      res.json({
        message: "Project updated successfully"
      });

    }
  );

});


// =====================================
// DELETE PROJECT
// =====================================

router.delete("/:id", (req, res) => {

  const { id } = req.params;

  const sql = `
    DELETE FROM projects
    WHERE id = ?
  `;


  db.query(sql, [id], (err, result) => {

    if (err) {

      console.log("DELETE PROJECT ERROR:", err);

      return res.status(500).json({
        message: "Project could not be deleted"
      });

    }


    if (result.affectedRows === 0) {

      return res.status(404).json({
        message: "Project not found"
      });

    }


    res.json({
      message: "Project deleted successfully"
    });

  });

});


module.exports = router;