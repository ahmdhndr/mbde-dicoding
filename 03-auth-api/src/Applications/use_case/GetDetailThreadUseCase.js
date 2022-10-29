class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams) {
    const { threadId } = useCaseParams;
    const detailThread = await this._threadRepository.getThreadById(threadId);
    detailThread.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadReplies = await this._threadRepository.getRepliesByThreadId(threadId);

    for (let i = 0; i < detailThread.comments.length; i += 1) {
      detailThread.comments[i].replies = threadReplies
        .filter((reply) => reply.commentId === detailThread.comments[i].id)
        .map((reply) => {
          const { commentId, ...detailReply } = reply;
          return detailReply;
        });
    }

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
