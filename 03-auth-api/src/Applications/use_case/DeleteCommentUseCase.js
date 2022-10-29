class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner: ownerId } = useCasePayload;
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.checkCommentIsExist({ threadId, commentId });
    await this._commentRepository.verifyCommentAccess({ commentId, ownerId });
    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
