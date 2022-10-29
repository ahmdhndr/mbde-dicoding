const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');

describe('AuthenticationRepositoryPostgres', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addToken function', () => {
    it('should add token to database', async () => {
      // Arrange
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action
      await authenticationRepositoryPostgres.addToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('checkAvailabilityToken function', () => {
    it('should throw InvariantError if token not available', async () => {
      // Arrange
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action & Assert
      await expect(authenticationRepositoryPostgres.checkAvailabilityToken(token))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should not throw InvariantError if token available', async () => {
      // Arrange
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action & Assert
      await expect(authenticationRepositoryPostgres.checkAvailabilityToken(token))
        .resolves.not.toThrowError();
    });
  });

  describe('deleteToken function', () => {
    it('should delete token from database', async () => {
      // Arrange
      const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      await authenticationRepositoryPostgres.deleteToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
