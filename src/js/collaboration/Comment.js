export class Comment {
  constructor({
    content,
    createdAt,
    multiSelectElements,
    documentId,
    clientId,
    parentCommentId = null,
    author = null,
  }) {
    this.id = crypto.randomUUID();
    this.parentCommentId = parentCommentId;
    this.content = content;
    this.createdAt = createdAt;
    this.multiSelectElements = multiSelectElements;
    this.documentId = documentId;
    this.clientId = clientId;
    this.author = author;
  }

  toJSON() {
    return JSON.stringify({
      id: this.id,
      parentCommentId: this.parentCommentId,
      content: this.content,
      createdAt: this.createdAt,
      multiSelectElements: this.multiSelectElements,
      documentId: this.documentId,
      clientId: this.clientId,
      author: this.author,
    });
  }
}
