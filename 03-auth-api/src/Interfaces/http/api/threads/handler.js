const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const addThreadUseCase = await this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({ ...request.payload, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const { threadId } = request.params;
    const getDetailThreadUseCase = await this._container.getInstance(GetDetailThreadUseCase.name);
    const thread = await getDetailThreadUseCase.execute({ threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });

    return response;
  }
}

module.exports = ThreadsHandler;
