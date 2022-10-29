const pool = require('../../database/postgres/pool');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    const userId = 'user-123';
    const threadId = 'thread-123';
    await UsersTableTestHelper.addUser({ id: userId, username: 'erudev' });
    await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = {
        threadId: 'thread-123',
        content: 'Sebuah komentar',
        owner: 'user-123',
      };
      const fakeIDGenerator = () => '123'; // stub!

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIDGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);
      const comment = await CommentsTableTestHelper.findCommentById(addedComment.id);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: newComment.content,
        owner: newComment.owner,
      }));
      expect(comment).toHaveLength(1);
    });
  });

  describe('deleteCommentById function', () => {
    it('should be able to delete added comment by id', async () => {
      // Arrange
      const addedComment = {
        id: 'comment-123',
        threadId: 'thread-123',
      };

      await CommentsTableTestHelper.addComment({
        id: addedComment.id, threadId: addedComment.threadId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteCommentById(addedComment.id);
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');

      // Assert
      expect(comment[0].is_deleted).toEqual(true);
    });

    it('should throw NotFoundError when comment that want to be deleted did not exist', async () => {
      // Arrange
      const commentId = 'comment-123';

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(commentRepositoryPostgres.deleteCommentById(commentId))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return all comment that belongs to the thread id', async () => {
      // Arrange
      const aComment = {
        id: 'comment-123', content: 'Komentar a', date: '2020',
      };
      const bComment = {
        id: 'comment-456', content: 'Komentar b', date: '2021',
      };

      await CommentsTableTestHelper.addComment(aComment);
      await CommentsTableTestHelper.addComment(bComment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const listOfComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(listOfComments).toEqual([
        { ...aComment, username: 'erudev' },
        { ...bComment, username: 'erudev' },
      ]);
    });

    it('should return an empty array when comments not exist for the thread id', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const listOfComments = await commentRepositoryPostgres.getCommentsByThreadId('thread-123');

      // Assert
      expect(listOfComments).toEqual([]);
      expect(listOfComments).toHaveLength(0);
    });
  });

  describe('checkCommentIsExist function', () => {
    it('should throw NotFoundError when comment is not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(commentRepositoryPostgres.checkCommentIsExist({ threadId: 'thread-123', commentId: 'comment-123' })).rejects.toThrow(NotFoundError);
    });

    it('should not throw NotFoundError when comment is exist', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-456' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(commentRepositoryPostgres.checkCommentIsExist({ threadId: 'thread-123', commentId: 'comment-456' })).resolves.toBeUndefined();
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError when user has no access', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({ commentId: 'comment-123', ownerId: 'user-456' })).rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError when user has access', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Act & Assert
      await expect(commentRepositoryPostgres.verifyCommentAccess({ commentId: 'comment-123', ownerId: 'user-123' })).resolves.toBeUndefined();
    });
  });
});
