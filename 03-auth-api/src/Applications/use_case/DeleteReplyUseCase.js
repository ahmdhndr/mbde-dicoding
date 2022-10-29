class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const {
      threadId, commentId, replyId, owner: ownerId,
    } = useCasePayload;

    await this._threadRepository.getThreadById(threadId);

    await this._commentRepository.checkCommentIsExist({ threadId, commentId });

    await this._replyRepository.checkReplyIsExist({ threadId, commentId, replyId });
    await this._replyRepository.verifyReplyAccess({ replyId, ownerId });
    await this._replyRepository.deleteReplyById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
