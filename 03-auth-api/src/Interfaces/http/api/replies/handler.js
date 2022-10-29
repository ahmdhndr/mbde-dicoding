const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const { content } = request.payload;
    const addReplyUseCase = await this._container.getInstance(AddReplyUseCase.name);
    const addedReply = await addReplyUseCase.execute({
      threadId, commentId, content, owner,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    const deleteReplyUseCase = await this._container.getInstance(DeleteReplyUseCase.name);
    await deleteReplyUseCase.execute({
      threadId, commentId, replyId, owner,
    });

    return h.response({
      status: 'success',
    });
  }
}

module.exports = RepliesHandler;
