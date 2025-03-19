const pool = require("../config/db");

// Create a new document
const createDocument = async (title, ownerId) => {
  const result = await pool.query(
    "INSERT INTO documents (title, owner_id) VALUES ($1, $2) RETURNING id",
    [title, ownerId]
  );
  return result.rows[0].id;
};

// Get document by ID
const getDocumentById = async (docId) => {
  const result = await pool.query("SELECT * FROM documents WHERE id = $1", [docId]);
  return result.rows[0];
};

// Update document content
const updateDocument = async (docId, content) => {
  await pool.query("UPDATE documents SET content = $1, updated_at = NOW() WHERE id = $2", [
    content,
    docId,
  ]);
};

module.exports = { createDocument, getDocumentById, updateDocument };
