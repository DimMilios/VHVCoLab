export function getParams() {
  let params = (new URL(document.location)).searchParams;

  const documentId = (documentId = 'docId') => params.get(documentId);

  return {
    documentId
  }
}