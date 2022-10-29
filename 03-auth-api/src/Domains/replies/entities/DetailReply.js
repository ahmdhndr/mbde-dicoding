class DetailReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, commentId, content, username, date,
    } = payload;

    this.id = id;
    this.commentId = commentId;
    this.content = content;
    this.username = username;
    this.date = date;
  }

  _verifyPayload({
    id, commentId, username, content, date,
  }) {
    if (!id || !commentId || !username || !content || !date) {
      throw new Error('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof commentId !== 'string'
      || typeof username !== 'string'
      || typeof content !== 'string'
      || typeof date !== 'string'
    ) {
      throw new Error('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailReply;
