const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class ReplyRepositoryPostgres {
  constructor(pool, idGenerator) {
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { commentId, content, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, content, owner, date],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async deleteReplyById(replyId) {
    const query = {
      text: `UPDATE replies
            SET is_deleted = TRUE,
                content = '**balasan telah dihapus**'
            WHERE id = $1 RETURNING id`,
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('tidak dapat menghapus balasan karena balasan tidak ada');
    }
  }

  async checkReplyIsExist({ threadId, commentId, replyId }) {
    const query = {
      text: `SELECT replies.id
              FROM replies
              INNER JOIN comments ON replies.comment_id = comments.id
              WHERE replies.id = $1
              AND replies.comment_id = $2
              AND comments.thread_id = $3
              AND replies.is_deleted = false`,
      values: [replyId, commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('balasan tidak ditemukan');
    }
  }

  async verifyReplyAccess({ replyId, ownerId }) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND owner = $2',
      values: [replyId, ownerId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthorizationError('Anda tidak memiliki izin untuk melakukan aksi ini');
    }
  }
}

module.exports = ReplyRepositoryPostgres;
