
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const db = require("../Db");


// =====================================
// UPLOAD FOLDER
// =====================================

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// =====================================
// MULTER CONFIG
// =====================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 100000) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});


const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp|gif|pdf|doc|docx|xls|xlsx|csv|txt/i;
        const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
        if (allowed.test(ext)) {
            cb(null, true);
        } else {
            cb(new Error("File type not allowed. Please upload PDF, Word, Excel, or Image files."));
        }
    }
});


// =====================================
// GET ALL DOCUMENTS
// =====================================

router.get("/all", (req, res) => {

    const sql = `
        SELECT
            documents.*,

            customers.name AS customer_name,

            projects.name AS project_name,

            properties.unit_number AS property_unit

        FROM documents

        LEFT JOIN customers
            ON documents.customer_id = customers.id

        LEFT JOIN projects
            ON documents.project_id = projects.id

        LEFT JOIN properties
            ON documents.property_id = properties.id

        ORDER BY documents.id DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.log("GET DOCUMENTS ERROR:", err);

            return res.status(500).json({
                message: "Error fetching documents"
            });
        }

        res.json(result);
    });
});


// =====================================
// GET SINGLE DOCUMENT
// =====================================

router.get("/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            documents.*,

            customers.name AS customer_name,

            projects.name AS project_name,

            properties.unit_number AS property_unit

        FROM documents

        LEFT JOIN customers
            ON documents.customer_id = customers.id

        LEFT JOIN projects
            ON documents.project_id = projects.id

        LEFT JOIN properties
            ON documents.property_id = properties.id

        WHERE documents.id = ?
    `;

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("GET DOCUMENT ERROR:", err);

            return res.status(500).json({
                message: "Error fetching document"
            });
        }

        if (result.length === 0) {

            return res.status(404).json({
                message: "Document not found"
            });
        }

        res.json(result[0]);
    });
});


// =====================================
// ADD DOCUMENT + FILE UPLOAD
// =====================================

router.post(
    "/add",
    upload.single("file"),
    (req, res) => {

        const {
            document_name,
            document_type,
            customer_id,
            project_id,
            property_id,
            description,
            status
        } = req.body;


        if (!document_name || !document_type) {

            return res.status(400).json({
                message: "Document name and type are required"
            });
        }


        let filePath = null;

        if (req.file) {

            filePath =
                "/uploads/" +
                req.file.filename;
        }


        const sql = `
            INSERT INTO documents
            (
                document_name,
                document_type,
                customer_id,
                project_id,
                property_id,
                file_path,
                description,
                status
            )

            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                document_name,

                document_type,

                customer_id || null,

                project_id || null,

                property_id || null,

                filePath,

                description || null,

                status || "Active"
            ],

            (err, result) => {

                if (err) {

                    console.log(
                        "ADD DOCUMENT ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message: "Error adding document"
                    });
                }


                res.status(201).json({

                    message:
                        "Document added successfully",

                    id: result.insertId,

                    file_path: filePath
                });
            }
        );
    }
);


// =====================================
// UPDATE DOCUMENT
// =====================================

router.put(
    "/:id",
    upload.single("file"),
    (req, res) => {

        const { id } = req.params;

        const {
            document_name,
            document_type,
            customer_id,
            project_id,
            property_id,
            description,
            status
        } = req.body;


        if (!document_name || !document_type) {

            return res.status(400).json({
                message:
                    "Document name and type are required"
            });
        }


        let sql;
        let values;


        // ---------------------------------
        // NEW FILE SELECTED
        // ---------------------------------

        if (req.file) {

            const filePath =
                "/uploads/" +
                req.file.filename;


            sql = `
                UPDATE documents

                SET
                    document_name = ?,
                    document_type = ?,
                    customer_id = ?,
                    project_id = ?,
                    property_id = ?,
                    file_path = ?,
                    description = ?,
                    status = ?

                WHERE id = ?
            `;


            values = [

                document_name,

                document_type,

                customer_id || null,

                project_id || null,

                property_id || null,

                filePath,

                description || null,

                status || "Active",

                id
            ];

        }


        // ---------------------------------
        // WITHOUT NEW FILE
        // ---------------------------------

        else {

            sql = `
                UPDATE documents

                SET
                    document_name = ?,
                    document_type = ?,
                    customer_id = ?,
                    project_id = ?,
                    property_id = ?,
                    description = ?,
                    status = ?

                WHERE id = ?
            `;


            values = [

                document_name,

                document_type,

                customer_id || null,

                project_id || null,

                property_id || null,

                description || null,

                status || "Active",

                id
            ];
        }


        db.query(
            sql,
            values,
            (err, result) => {

                if (err) {

                    console.log(
                        "UPDATE DOCUMENT ERROR:",
                        err
                    );

                    return res.status(500).json({
                        message:
                            "Error updating document"
                    });
                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        message:
                            "Document not found"
                    });
                }


                res.json({

                    message:
                        "Document updated successfully"

                });
            }
        );
    }
);


// =====================================
// DELETE DOCUMENT
// =====================================

router.delete("/:id", (req, res) => {

    const { id } = req.params;


    // First get file path
    const selectSql =
        "SELECT file_path FROM documents WHERE id = ?";


    db.query(
        selectSql,
        [id],
        (err, result) => {

            if (err) {

                console.log(
                    "GET FILE ERROR:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error finding document"
                });
            }


            if (result.length === 0) {

                return res.status(404).json({
                    message:
                        "Document not found"
                });
            }


            const filePath =
                result[0].file_path;


            // Delete DB record
            const deleteSql =
                "DELETE FROM documents WHERE id = ?";


            db.query(
                deleteSql,
                [id],
                (deleteErr, deleteResult) => {

                    if (deleteErr) {

                        console.log(
                            "DELETE DOCUMENT ERROR:",
                            deleteErr
                        );

                        return res.status(500).json({
                            message:
                                "Error deleting document"
                        });
                    }


                    // Delete physical file
                    if (filePath) {

                        const fullPath =
                            path.join(
                                __dirname,
                                "..",
                                filePath
                            );


                        if (
                            fs.existsSync(fullPath)
                        ) {

                            fs.unlinkSync(
                                fullPath
                            );
                        }
                    }


                    res.json({

                        message:
                            "Document deleted successfully"

                    });
                }
            );
        }
    );
});


module.exports = router;

