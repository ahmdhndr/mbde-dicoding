const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    // await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 401 when no access token provided', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah judul',
        body: 'Isi thread',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah judul',
      };
      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: true,
        body: 'Isi thread',
      };
      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 201 and new thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Sebuah judul',
        body: 'Isi thread',
      };
      const server = await createServer(container);

      const { accessToken } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });
  });

  describe('when GET /threads/{threadsId}', () => {
    it('should return 200 with thread details, comments and replies', async () => {
      // Arrange
      const server = await createServer(container);

      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'erudev' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId, owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId, owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });
      await RepliesTableTestHelper.addReply({ id: 'reply-456', commentId: 'comment-456', owner: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(1);
    });

    it('should respond 200 with thread details empty comments', async () => {
      // Arrange
      const server = await createServer(container);

      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: 'user-123', owner: 'erudev' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: 'user-123' });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(0);
    });
  });
});
