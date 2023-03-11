import * as Y from 'yjs';
import { getCommentsList, ydoc } from '../yjs-setup';
import { Comment } from '../collaboration/Comment';
import { sendAction } from './actions';

export class CommentService {
  /** @type {Y.Array<string>} */
  _commentsList;

  constructor() {
    this._commentsList = getCommentsList();
  }

  addComment({
    content,
    createdAt = new Date(),
    multiSelectElements,
    documentId,
    clientId,
    author = null,
    parentCommentId = null,
  }) {
    let commentToAdd = new Comment({
      content,
      createdAt,
      multiSelectElements,
      documentId,
      clientId,
      author,
      parentCommentId,
    });

    console.info(`Adding comment to list`, commentToAdd);

    this._commentsList.push([commentToAdd.toJSON()]);

    sendAction({ type: 'add_comment', content: commentToAdd.toAction() })
      .then(() =>
        console.log(`Action for comment with id: ${commentToAdd.id} was sent.`)
      )
      .catch(() => console.error(`Failed to send comment action`));
    return commentToAdd;
  }

  deleteCommentGroupById(comment) {
    // Could be a single comment, or a parent comment with all of its children/replies
    const commentsToDelete = this.fromJSON()
      .filter((c) => c.id === comment.id || c.parentCommentId === comment.id)
      .map((c) => c.id);

    console.info(`Deleting comments with ids: `, commentsToDelete);

    if (commentsToDelete?.length > 0) {
      const commentsToKeep = this.fromJSON().filter(
        (c) => !commentsToDelete.includes(c.id)
      );
      ydoc.transact(() => {
        this._commentsList.delete(0, getCommentsList().length);
        commentsToKeep.forEach((c) =>
          this._commentsList.push([JSON.stringify(c)])
        );
      });
    }
  }

  deleteAll() {
    console.info(`Deleting all comments`);
    const deleted = this.fromJSON().map((comment) => comment.id);
    this._commentsList.delete(0, this._commentsList.length);
  }

  /**
   *
   * @returns {Comment[]}
   */
  fromJSON() {
    return this._commentsList.toJSON().map((comment) => JSON.parse(comment));
  }
}
