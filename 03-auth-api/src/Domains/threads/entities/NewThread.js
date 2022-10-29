class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const { title, body, owner } = payload;

    this.title = payload.title;
    this.body = payload.body;
    this.owner = payload.owner;
  }

  _verifyPayload({ title, body, owner }) {
    if (!title || !body || !owner) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string') {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
