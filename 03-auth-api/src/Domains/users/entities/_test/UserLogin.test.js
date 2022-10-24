const UserLogin = require('../UserLogin');

describe('A UserLogin entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      username: 'erudev',
    };

    // Action & Assert
    expect(() => new UserLogin(payload)).toThrowError('LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      username: 'erudev',
      password: 1234,
    };

    // Action & Assert
    expect(() => new UserLogin(payload)).toThrowError('LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create UserLogin entities correctly', () => {
    // Arrange
    const payload = {
      username: 'erudev',
      password: 'secret',
    };

    // Action
    const userLogin = new UserLogin(payload);

    // Assert
    expect(userLogin).toBeInstanceOf(UserLogin);
    expect(userLogin.username).toEqual(payload.username);
    expect(userLogin.password).toEqual(payload.password);
  });
});
