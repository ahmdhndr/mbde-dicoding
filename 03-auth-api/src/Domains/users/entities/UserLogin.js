class LoginUser {
  constructor(payload) {
    this._verifyPayload(payload);

    this.username = payload.username;
    this.password = payload.password;
  }

  _verifyPayload(payload) {
    const { username, password } = payload;
    if (!username || !password) {
      throw new Error('LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LoginUser;
