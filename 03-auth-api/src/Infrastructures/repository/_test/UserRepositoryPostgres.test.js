const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const pool = require('../../database/postgres/pool');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('verifyAvailableUsername function', () => {
    it('should throw InvariantError when username not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'erudev' }); // memasukkan user baru dengan username erudev
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('erudev')).rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when username available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('erudev')).resolves.not.toThrowError(InvariantError);
    });
  });

  describe('addUser function', () => {
    it('should persist register user', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'erudev',
        password: 'secret',
        fullname: 'Eru Desu',
      });
      const fakeIDGenerator = () => '123'; // stub
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIDGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.findUserById('user-123');
      expect(users).toHaveLength(1);
    });

    it('should return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'erudev',
        password: 'secret',
        fullname: 'Eru Desu',
      });
      const fakeIDGenerator = () => '123'; // stub
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIDGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: 'erudev',
        fullname: 'Eru Desu',
      }));
    });
  });

  describe('getPasswordByUsername function', () => {
    it('should throw InvariantError when user not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getPasswordByUsername('erudev'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return username password when user is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: 'erudev',
        password: 'secret',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const password = await userRepositoryPostgres.getPasswordByUsername('erudev');

      // Assert
      expect(password).toBe('secret');
    });
  });

  describe('getIdByUsername function', () => {
    it('should throw InvariantError when user not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername('erudev'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return user id correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'erudev',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const id = await userRepositoryPostgres.getIdByUsername('erudev');

      // Assert
      expect(id).toBe('user-456');
    });
  });
});
