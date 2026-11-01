const express = require("express");
const router = express.Router();
const db = require("../Db");

// =====================================
// GET ROLE PERMISSIONS
// =====================================

router.get("/:role", (req, res) => {
const role = req.params.role;

const sql = `     SELECT id, role, permission, allowed
    FROM role_permissions
    WHERE role = ?
    ORDER BY id ASC
  `;

db.query(sql, [role], (err, rows) => {
if (err) {
console.log("GET ROLE PERMISSIONS ERROR:", err);


  return res.status(500).json({
    message: "Permissions could not be loaded.",
    error: err.sqlMessage || err.message,
  });
}

return res.json({
  role: role,
  permissions: rows,
});


});
});

// =====================================
// SAVE ROLE PERMISSIONS
// =====================================

router.put("/:role", (req, res) => {
const role = req.params.role;

const permissions = Array.isArray(req.body.permissions)
? req.body.permissions
: [];

// Remove old permissions for this role
const deleteSql = `     DELETE FROM role_permissions
    WHERE role = ?
  `;

db.query(deleteSql, [role], (deleteErr) => {
if (deleteErr) {
console.log(
"DELETE ROLE PERMISSIONS ERROR:",
deleteErr
);


  return res.status(500).json({
    message: "Permissions could not be updated.",
    error:
      deleteErr.sqlMessage ||
      deleteErr.message,
  });
}

// No permission selected
if (permissions.length === 0) {
  return res.json({
    message:
      `${role} permissions saved successfully.`,
  });
}

// Prepare data
const values = permissions.map((permission) => [
  role,
  permission,
  1,
]);

// Insert selected permissions
const insertSql = `
  INSERT INTO role_permissions
  (role, permission, allowed)
  VALUES ?
`;

db.query(insertSql, [values], (insertErr) => {
  if (insertErr) {
    console.log(
      "INSERT ROLE PERMISSIONS ERROR:",
      insertErr
    );

    return res.status(500).json({
      message:
        "Permissions could not be saved.",
      error:
        insertErr.sqlMessage ||
        insertErr.message,
    });
  }

  return res.json({
    message:
      `${role} permissions saved successfully.`,
  });
});


});
});

module.exports = router;
