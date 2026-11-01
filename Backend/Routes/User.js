const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../Middleware/auth");

const db = require("../Db");

// =====================================================
// GET ALL USERS
// =====================================================

router.get("/all", (req, res) => {
  const sql = `
    SELECT id, name, email, phone, role, status, created_at
    FROM users
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("GET USERS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch users"
      });
    }

    res.json(result);
  });
});


// =====================================================
// GET SINGLE USER
// =====================================================

router.get("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT id, name, email, phone, role, status, created_at
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("GET USER ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch user"
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(result[0]);
  });
});


// =====================================================
// ADD USER (PASSWORD HASHED WITH BCRYPT)
// =====================================================

router.post("/register", (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    status
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !password ||
    !role ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all user details"
    });
  }

  const checkSql = `
    SELECT id
    FROM users
    WHERE email = ?
  `;

  db.query(checkSql, [email], async (checkErr, checkResult) => {
    if (checkErr) {
      console.log("CHECK EMAIL ERROR:", checkErr);

      return res.status(500).json({
        message: "Database error"
      });
    }

    if (checkResult.length > 0) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    try {
      // Securely hash password with bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = `
        INSERT INTO users
        (name, email, phone, password, role, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          name,
          email,
          phone,
          hashedPassword,
          role,
          status
        ],
        (err, result) => {
          if (err) {
            console.log("ADD USER ERROR:", err);

            return res.status(500).json({
              message: "User could not be added"
            });
          }

          res.status(201).json({
            message: "User added successfully",
            id: result.insertId
          });
        }
      );
    } catch (hashErr) {
      console.error("HASH ERROR:", hashErr);
      return res.status(500).json({ message: "Error securing password" });
    }
  });
});


// =====================================================
// UPDATE USER (PASSWORD HASHED IF UPDATED)
// =====================================================

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    name,
    email,
    phone,
    password,
    role,
    status
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !role ||
    !status
  ) {
    return res.status(400).json({
      message: "Please fill all user details"
    });
  }

  // Password blank hai to purana password same rahega
  if (password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = `
        UPDATE users
        SET
          name = ?,
          email = ?,
          phone = ?,
          password = ?,
          role = ?,
          status = ?
        WHERE id = ?
      `;

      db.query(
        sql,
        [
          name,
          email,
          phone,
          hashedPassword,
          role,
          status,
          id
        ],
        (err, result) => {
          if (err) {
            console.log("UPDATE USER ERROR:", err);

            return res.status(500).json({
              message: "User could not be updated"
            });
          }

          res.json({
            message: "User updated successfully"
          });
        }
      );
    } catch (hashErr) {
      return res.status(500).json({ message: "Error securing password" });
    }
  } else {
    const sql = `
      UPDATE users
      SET
        name = ?,
        email = ?,
        phone = ?,
        role = ?,
        status = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        name,
        email,
        phone,
        role,
        status,
        id
      ],
      (err, result) => {
        if (err) {
          console.log("UPDATE USER ERROR:", err);

          return res.status(500).json({
            message: "User could not be updated"
          });
        }

        res.json({
          message: "User updated successfully"
        });
      }
    );
  }
});


// =====================================================
// DELETE USER
// =====================================================

router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM users
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE USER ERROR:", err);

      return res.status(500).json({
        message: "User could not be deleted"
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully"
    });
  });
});


// =====================================================
// LOGIN (BCRYPT VERIFICATION + JWT TOKEN GENERATION)
// =====================================================

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const sql = `
    SELECT id, name, email, phone, password, role, status
    FROM users
    WHERE email = ?
  `;

  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.log("LOGIN ERROR:", err);
      return res.status(500).json({
        message: "Database error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const user = result[0];

    // Verify password: check if hashed with bcrypt or legacy plaintext
    let passwordMatch = false;
    const isHashed = user.password && (user.password.startsWith("$2a$") || user.password.startsWith("$2b$"));

    try {
      if (isHashed) {
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // Support legacy plain text password
        passwordMatch = (password === user.password);
        // Automatically upgrade to bcrypt hash in DB
        if (passwordMatch) {
          const newHash = await bcrypt.hash(password, 10);
          db.query("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id], (updErr) => {
            if (!updErr) console.log(`Auto-migrated password to bcrypt for: ${user.email}`);
          });
        }
      }
    } catch (cmpErr) {
      console.error("Password compare error:", cmpErr);
      return res.status(500).json({ message: "Authentication error" });
    }

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    const permissionSql = `
      SELECT permission
      FROM role_permissions
      WHERE role = ? AND allowed = 1
    `;

    db.query(
      permissionSql,
      [user.role],
      (permissionErr, permissionRows) => {
        if (permissionErr) {
          console.log("LOGIN PERMISSIONS ERROR:", permissionErr);

          return res.status(500).json({
            message: "Could not load user permissions",
          });
        }

        const permissions = permissionRows.map(
          (row) => row.permission
        );

        // Generate JWT Token (valid for 7 days)
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.json({
          message: "Login successful",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            permissions,
          },
        });
      }
    );
  });
});

module.exports = router;
