const DetailThread = require('../DetailThread');

describe('DetailThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Sebuah judul',
      body: 'Isi thread',
      username: 'user-123',
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'Sebuah judul',
      body: {},
      username: true,
      date: [],
      comments: 'comments',
    };

    // Action & Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Sebuah judul',
      body: 'Isi thread',
      username: 'user-123',
      date: '2022',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.comments).toEqual(payload.comments);
  });
});
