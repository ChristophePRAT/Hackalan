// Script one-shot à exécuter en dehors de Next.js (ex: ts-node scripts/ingest-docs.ts).
// Lit tous les fichiers .txt et .md dans data/medical-docs/,
// les découpe en chunks, génère leurs embeddings via Mistral,
// et les insère dans la table "medical_documents" de Supabase.
// À lancer une seule fois pour initialiser la base vectorielle.
