const DetailReply = require('../DetailReply');

describe('DetailReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'erudev',
    };

    // Act & Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      commentId: 789,
      content: [],
      username: true,
      date: {},
    };

    // Act & Assert
    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailReply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      commentId: 'comment-123',
      content: 'Sebuah balasan',
      username: 'someuser',
      date: '2022',
    };

    // Action
    const detailReply = new DetailReply(payload);

    // Assert
    expect(detailReply.id).toEqual(payload.id);
    expect(detailReply.content).toEqual(payload.content);
    expect(detailReply.username).toEqual(payload.username);
    expect(detailReply.date).toEqual(payload.date);
  });
});
