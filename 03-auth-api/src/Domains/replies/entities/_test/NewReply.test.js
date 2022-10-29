const NewReply = require('../NewReply');

describe('NewReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: {},
      commentId: true,
      owner: 123,
    };

    // Action & Assert
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newReply object correctly', () => {
    // Arrange
    const payload = {
      content: 'Sebuah balasan',
      owner: 'user-123',
      commentId: 'comment-123',
    };

    // Action
    const newReply = new NewReply(payload);

    // Assert
    expect(newReply.content).toEqual(payload.content);
  });
});
