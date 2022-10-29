const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class CommentRepositoryPostgres {
  constructor(pool, idGenerator) {
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { threadId, content, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, threadId, content, owner, date],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.date, users.username
              FROM comments
              INNER JOIN users ON comments.owner = users.id
              WHERE comments.thread_id = $1
              ORDER BY comments.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async checkCommentIsExist({ threadId, commentId }) {
    const query = {
      text: `SELECT comments.id
              FROM comments
              INNER JOIN threads ON comments.thread_id = threads.id
              WHERE threads.id = $1
              AND comments.id = $2`,
      values: [threadId, commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('komentar tidak ditemukan');
    }
  }

  async verifyCommentAccess({ commentId, ownerId }) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak memiliki izin untuk melakukan aksi ini');
    }
  }

  async deleteCommentById(commentId) {
    const query = {
      text: `UPDATE comments
              SET is_deleted = TRUE,
                  content = '**komentar telah dihapus**'
              WHERE id = $1 RETURNING id`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('tidak dapat menghapus komentar karena komentar tidak ada');
    }
  }
}

module.exports = CommentRepositoryPostgres;
