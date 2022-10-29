const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'erudev',
        password: 'secret',
        fullname: 'Eru Desu',
      });
      const fakeIDGenerator = () => '123';

      const newThread = new NewThread({
        title: 'Sebuah judul',
        body: 'Isi thread',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIDGenerator,
      );

      // Action
      await threadRepositoryPostgres.addThread(newThread);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'erudev',
        password: 'secret',
        fullname: 'Eru Desu',
      });
      const fakeIDGenerator = () => '123';

      const newThread = new NewThread({
        title: 'Sebuah judul',
        body: 'Isi thread',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIDGenerator,
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'Sebuah judul',
        owner: 'user-123',
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread is not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-not-available'))
        .rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when thread is available', async () => {
      // Arrange
      const userPayload = {
        id: 'user-123',
        username: 'erudev',
      };
      const newThreadPayload = {
        title: 'some title', body: 'body thread', owner: userPayload.id,
      };
      const expectedDetailThread = {
        id: 'thread-123',
        title: newThreadPayload.title,
        body: newThreadPayload.body,
        username: userPayload.username,
        date: '2022',
      };
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);
      await UsersTableTestHelper.addUser({ ...userPayload });
      await ThreadsTableTestHelper.addThread(newThreadPayload);

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(getThread).toStrictEqual(expectedDetailThread);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return all replies in a thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'erudev' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe' });

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-456', owner: 'user-456', threadId: 'thread-123' });

      const replies = [
        {
          id: 'reply-123', commentId: 'comment-123', content: 'Balasan a', date: '2021',
        },
        {
          id: 'reply-456', commentId: 'comment-123', content: 'Balasan b', date: '2022',
        },
      ];

      const expectedReplies = [
        { ...replies[0], username: 'johndoe' },
        { ...replies[1], username: 'erudev' },
      ];

      // const expectedReplies = [
      //   {
      //     id: 'reply-123',
      //     content: 'Balasan a',
      //     date: '2021',
      //     username: 'erudev',
      //   },
      //   {
      //     id: 'reply-456',
      //     content: 'Balasan b',
      //     date: '2022',
      //     username: 'johndoe',
      //   },
      // ];

      await RepliesTableTestHelper.addReply({ ...replies[0], owner: 'user-456' });
      await RepliesTableTestHelper.addReply({ ...replies[1], owner: 'user-123' });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const listOfReplies = await threadRepositoryPostgres.getRepliesByThreadId('thread-123');

      // Assert
      expect(listOfReplies).toEqual(expectedReplies);
    });
  });
});
