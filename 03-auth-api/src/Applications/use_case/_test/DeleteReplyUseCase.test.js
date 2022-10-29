const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action properly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-213',
      replyId: 'reply-456',
      owner: 'user-213',
    };
    const expectedDeletedReply = {
      id: 'reply-456',
    };

    /* creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /* mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockCommentRepository.checkCommentIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());

    mockReplyRepository.checkReplyIsExist = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyAccess = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /* creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.checkCommentIsExist).toBeCalledWith({
      threadId: useCasePayload.threadId, commentId: useCasePayload.commentId,
    });
    expect(mockReplyRepository.checkReplyIsExist).toBeCalledWith({
      threadId: useCasePayload.threadId,
      commentId: useCasePayload.commentId,
      replyId: useCasePayload.replyId,
    });
    expect(mockReplyRepository.verifyReplyAccess).toBeCalledWith({
      replyId: useCasePayload.replyId, ownerId: useCasePayload.owner,
    });
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(expectedDeletedReply.id);
  });
});
