const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 404 when add comment to non-existing thread id', async () => {
      // Arrange
      const requestPayload = {
        content: 'Komentar',
      };
      const server = await createServer(container);
      const invalidThreadId = 'thread-xxx';

      const { accessToken } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${invalidThreadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 401 when no access token provided', async () => {
      // Arrange
      const requestPayload = {
        content: 'Komentar',
      };
      const server = await createServer(container);

      const { userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
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
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: {},
      };
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 201 and new comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'Komentar',
      };
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 401 when no access token provide', async () => {
      // Arrange
      const server = await createServer(container);
      const { userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toBeDefined();
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when another user tries to delete the comment that they dont own', async () => {
      // Arrange
      const server = await createServer(container);

      // add user and their comment
      const { userId: firstUserId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server, username: 'erudev' });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: firstUserId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: firstUserId });

      // create another user
      const { accessToken: anotherUserAccessToken } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server, username: 'johndoe' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${anotherUserAccessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Anda tidak memiliki izin untuk melakukan aksi ini');
    });

    it('should response 404 when delete comment with non-existing comment', async () => {
      // Arrange
      const server = await createServer(container);
      const threadId = 'thread-123';
      const nonExistCommentId = 'comment-xxx';

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${nonExistCommentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 200 and return success status', async () => {
      // Arrange
      const server = await createServer(container);

      const { accessToken, userId } = await ServerTestHelper
        .getAccessTokenAndUserIdHelper({ server });

      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
