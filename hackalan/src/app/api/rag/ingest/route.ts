// POST /api/rag/ingest
// Reçoit un document médical (texte brut + métadonnées : source, titre).
// Pipeline : chunking via chunker.ts → embedding de chaque chunk via embeddings.ts
// → stockage dans la table "medical_documents" de Supabase (pgvector).
// Utilisé pour alimenter la base vectorielle avant la phase de vérification.
