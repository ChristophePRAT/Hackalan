// POST /api/rag/verify
// API route principale du pipeline RAG de vérification médicale.
//
// Flow :
//   1. Reçoit le contenu généré par Mistral (article, méditation, etc.)
//   2. Extrait les claims santé via mistral-large-latest
//   3. Pour chaque claim : embedding → recherche des chunks les plus proches dans Supabase (pgvector)
//   4. Vérifie chaque claim contre les chunks récupérés via mistral-large-latest
//   5. Retourne un score de fiabilité global + détail par claim (verified / unverified / incorrect) avec sources
