/* istanbul ignore file */
const ServerTestHelper = {
  async getAccessTokenAndUserIdHelper({ server, username = 'erudev' }) {
    const userPayload = {
      username,
      password: 'secret',
    };

    const responseUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        ...userPayload,
        fullname: 'Eru Desu',
      },
    });

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: userPayload,
    });

    const { id: userId } = JSON.parse(responseUser.payload).data.addedUser;
    const { accessToken } = JSON.parse(responseAuth.payload).data;

    return { userId, accessToken };
  },
};

module.exports = ServerTestHelper;
