const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating get detail thread action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-123',
      title: 'Sebuah judul',
      body: 'Isi thread',
      username: 'dicoding',
      date: '2022',
      comments: [],
    });

    const expectedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'erudev',
        content: 'Komentar A',
        date: '2022',
        replies: [],
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'johndoe',
        content: 'Komentar B',
        date: '2021',
        replies: [],
      }),
    ];
    const listOfReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'Balasan A',
        date: '2022',
        username: 'janedoe',
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'Balasan B',
        date: '2021',
        username: 'erudev',
      }),
    ];

    const { commentId: commentIdReplyA, ...filteredDetailReplyA } = listOfReplies[0];
    const { commentId: commentIdReplyB, ...filteredDetailReplyB } = listOfReplies[1];

    const expectedCommentsAndReplies = [
      { ...expectedComments[0], replies: [filteredDetailReplyA] },
      { ...expectedComments[1], replies: [filteredDetailReplyB] },
    ];

    /* creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /* mocking needed function */
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(listOfReplies));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));

    /* creating use case instance */
    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const useCaseResult = await getDetailThreadUseCase.execute(useCaseParams);

    // Assert
    expect(useCaseResult).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsAndReplies,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParams.threadId);
  });
});
