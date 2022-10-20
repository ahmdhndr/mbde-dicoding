const RegisteredUser = require('../RegisteredUser');

describe('A RegisteredUser entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      username: 'erudev',
      fullname: 'Eru Desu',
    };

    // Action and Assert
    expect(() => new RegisteredUser(payload)).toThrowError('REGISTERED_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      username: 'erudev',
      fullname: 'Eru Desu',
    };

    // Action and Assert
    expect(() => new RegisteredUser(payload)).toThrowError('REGISTERED_USER.DID_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredUser object correctly', () => {
    // Arrange
    const payload = {
      id: 'user-123',
      username: 'erudev',
      fullname: 'Eru Desu',
    };

    // Action
    const { id, username, fullname } = new RegisteredUser(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(fullname).toEqual(payload.fullname);
  });
});
