const Jwt = require('@hapi/jwt');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'erudev',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.ACCESS_TOKEN_KEY);
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'erudev',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toBeCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({
        username: 'erudev',
      });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const refreshToken = await jwtTokenManager.createRefreshToken({
        username: 'erudev',
      });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(refreshToken))
        .resolves
        .not.toThrowError(InvariantError);
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt.token);
      const accessToken = await jwtTokenManager.createAccessToken({
        username: 'erudev',
      });

      // Action
      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      // Assert
      expect(expectedUsername).toEqual('erudev');
    });
  });
});
