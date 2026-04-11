// Découpe un document texte en chunks de taille fixe avec chevauchement (overlap).
// Utilisé lors de l'ingestion pour éviter de dépasser la fenêtre contextuelle de Mistral.
// Expose chunkText(text: string, chunkSize?: number, overlap?: number): string[].
