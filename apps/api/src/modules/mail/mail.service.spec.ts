import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService, MessageInfo } from './mail.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { APP_TITLE } from '../../common/constants';

// Mock external dependencies
jest.mock('@react-email/render');
jest.mock('nodemailer');
jest.mock('./templates/reset-password-link');
jest.mock('./templates/email-verification');
jest.mock('./templates/account-locked');

// Import mocked modules after jest.mock
import { render } from '@react-email/render';
import * as nodemailer from 'nodemailer';
import ResetPasswordLinkEmail from './templates/reset-password-link';
import VerificationCodeEmail from './templates/email-verification';
import AccountLockedEmail from './templates/account-locked';

describe('MailService', () => {
  let service: MailService;
  let configService: DeepMockProxy<ConfigService>;
  let mockRender: jest.MockedFunction<typeof render>;
  let mockSendMail: jest.MockedFunction<any>;
  let mockNodemailer: jest.Mocked<typeof nodemailer>;

  const mockConfig = {
    SMTP_HOST: 'smtp.example.com',
    SMTP_PORT: 587,
    SMTP_TLS: 'yes',
    SMTP_USER: 'test@example.com',
    SMTP_PASSWORD: 'password123',
    SMTP_FROM_EMAIL: 'noreply@example.com',
  };

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup nodemailer mock
    mockSendMail = jest.fn();
    const mockTransporter = {
      sendMail: mockSendMail,
    };
    mockNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;
    mockNodemailer.createTransport.mockReturnValue(mockTransporter as any);

    // Setup render mock
    mockRender = render as jest.MockedFunction<typeof render>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>({
            get: jest.fn((key: string) => mockConfig[key]),
          }),
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should create nodemailer transporter with correct configuration', () => {
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      });
    });

    it('should set secure to false when SMTP_TLS is not "yes"', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: ConfigService,
            useValue: mockDeep<ConfigService>({
              get: jest.fn((key: string) => {
                if (key === 'SMTP_TLS') return 'no';
                return mockConfig[key];
              }),
            }),
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);
      expect(testService).toBeDefined();
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      });
    });

    it('should handle undefined SMTP_TLS config', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: ConfigService,
            useValue: mockDeep<ConfigService>({
              get: jest.fn((key: string) => {
                if (key === 'SMTP_TLS') return undefined;
                return mockConfig[key];
              }),
            }),
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);
      expect(testService).toBeDefined();
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      });
    });
  });

  describe('sendMail', () => {
    it('should send email with correct parameters', async () => {
      const message: MessageInfo = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      };

      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await service.sendMail(message);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      });
    });

    it('should handle email sending errors', async () => {
      const message: MessageInfo = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML content</p>',
      };

      const error = new Error('SMTP connection failed');
      mockSendMail.mockRejectedValue(error);

      await expect(service.sendMail(message)).rejects.toThrow(
        'SMTP connection failed',
      );
    });

    it('should handle empty message fields', async () => {
      const message: MessageInfo = {
        to: '',
        subject: '',
        html: '',
      };

      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      await service.sendMail(message);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: '',
        subject: '',
        html: '',
      });
    });
  });

  describe('sendVerificationCode', () => {
    it('should send verification code email successfully', async () => {
      const email = 'user@example.com';
      const code = '123456';
      const renderedHtml = '<p>Your verification code is: 123456</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'verification-message-id' });

      await service.sendVerificationCode(email, code);

      expect(mockRender).toHaveBeenCalledWith(VerificationCodeEmail({ code }));
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Verification Code',
        html: renderedHtml,
      });
    });

    it('should handle render errors for verification email', async () => {
      const email = 'user@example.com';
      const code = '123456';
      const error = new Error('Template render failed');

      mockRender.mockRejectedValue(error);

      await expect(service.sendVerificationCode(email, code)).rejects.toThrow(
        'Template render failed',
      );
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should handle email sending errors for verification email', async () => {
      const email = 'user@example.com';
      const code = '123456';
      const renderedHtml = '<p>Your verification code is: 123456</p>';
      const error = new Error('Email send failed');

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockRejectedValue(error);

      await expect(service.sendVerificationCode(email, code)).rejects.toThrow(
        'Email send failed',
      );
    });

    it('should handle empty code parameter', async () => {
      const email = 'user@example.com';
      const code = '';
      const renderedHtml = '<p>Your verification code is: </p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'verification-message-id' });

      await service.sendVerificationCode(email, code);

      expect(mockRender).toHaveBeenCalledWith(VerificationCodeEmail({ code }));
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Verification Code',
        html: renderedHtml,
      });
    });
  });

  describe('sendResetPasswordLink', () => {
    it('should send reset password email with username', async () => {
      const email = 'user@example.com';
      const link = 'https://example.com/reset?token=abc123';
      const userName = 'John Doe';
      const renderedHtml = '<p>Click here to reset your password</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'reset-message-id' });

      await service.sendResetPasswordLink(email, link, userName);

      expect(mockRender).toHaveBeenCalledWith(
        ResetPasswordLinkEmail({ resetLink: link, userName }),
      );
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Reset Password Link',
        html: renderedHtml,
      });
    });

    it('should send reset password email without username', async () => {
      const email = 'user@example.com';
      const link = 'https://example.com/reset?token=abc123';
      const renderedHtml = '<p>Click here to reset your password</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'reset-message-id' });

      await service.sendResetPasswordLink(email, link);

      expect(mockRender).toHaveBeenCalledWith(
        ResetPasswordLinkEmail({ resetLink: link, userName: undefined }),
      );
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: 'Reset Password Link',
        html: renderedHtml,
      });
    });

    it('should handle render errors for reset password email', async () => {
      const email = 'user@example.com';
      const link = 'https://example.com/reset?token=abc123';
      const error = new Error('Template render failed');

      mockRender.mockRejectedValue(error);

      await expect(service.sendResetPasswordLink(email, link)).rejects.toThrow(
        'Template render failed',
      );
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should handle email sending errors for reset password email', async () => {
      const email = 'user@example.com';
      const link = 'https://example.com/reset?token=abc123';
      const renderedHtml = '<p>Click here to reset your password</p>';
      const error = new Error('Email send failed');

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockRejectedValue(error);

      await expect(service.sendResetPasswordLink(email, link)).rejects.toThrow(
        'Email send failed',
      );
    });

    it('should handle empty link parameter', async () => {
      const email = 'user@example.com';
      const link = '';
      const userName = 'John Doe';
      const renderedHtml = '<p>Click here to reset your password</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'reset-message-id' });

      await service.sendResetPasswordLink(email, link, userName);

      expect(mockRender).toHaveBeenCalledWith(
        ResetPasswordLinkEmail({ resetLink: '', userName }),
      );
    });
  });

  describe('sendAccountLockedEmail', () => {
    it('should send account locked email successfully', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      const lockedUntil = new Date('2024-01-01T12:00:00Z');
      const loginAttempts = 5;
      const renderedHtml = '<p>Your account has been locked</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'locked-message-id' });

      await service.sendAccountLockedEmail(
        email,
        username,
        lockedUntil,
        loginAttempts,
      );

      expect(mockRender).toHaveBeenCalledWith(
        AccountLockedEmail({ username, lockedUntil, loginAttempts }),
      );
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: email,
        subject: `${APP_TITLE} - Account Temporarily Locked`,
        html: renderedHtml,
      });
    });

    it('should handle render errors for account locked email', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      const lockedUntil = new Date('2024-01-01T12:00:00Z');
      const loginAttempts = 5;
      const error = new Error('Template render failed');

      mockRender.mockRejectedValue(error);

      await expect(
        service.sendAccountLockedEmail(
          email,
          username,
          lockedUntil,
          loginAttempts,
        ),
      ).rejects.toThrow('Template render failed');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('should handle email sending errors for account locked email', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      const lockedUntil = new Date('2024-01-01T12:00:00Z');
      const loginAttempts = 5;
      const renderedHtml = '<p>Your account has been locked</p>';
      const error = new Error('Email send failed');

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockRejectedValue(error);

      await expect(
        service.sendAccountLockedEmail(
          email,
          username,
          lockedUntil,
          loginAttempts,
        ),
      ).rejects.toThrow('Email send failed');
    });

    it('should handle zero login attempts', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      const lockedUntil = new Date('2024-01-01T12:00:00Z');
      const loginAttempts = 0;
      const renderedHtml = '<p>Your account has been locked</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'locked-message-id' });

      await service.sendAccountLockedEmail(
        email,
        username,
        lockedUntil,
        loginAttempts,
      );

      expect(mockRender).toHaveBeenCalledWith(
        AccountLockedEmail({ username, lockedUntil, loginAttempts: 0 }),
      );
    });

    it('should handle past lockedUntil date', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      const lockedUntil = new Date('2020-01-01T12:00:00Z'); // Past date
      const loginAttempts = 3;
      const renderedHtml = '<p>Your account has been locked</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'locked-message-id' });

      await service.sendAccountLockedEmail(
        email,
        username,
        lockedUntil,
        loginAttempts,
      );

      expect(mockRender).toHaveBeenCalledWith(
        AccountLockedEmail({ username, lockedUntil, loginAttempts }),
      );
    });

    it('should handle empty username', async () => {
      const email = 'user@example.com';
      const username = '';
      const lockedUntil = new Date('2024-01-01T12:00:00Z');
      const loginAttempts = 5;
      const renderedHtml = '<p>Your account has been locked</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'locked-message-id' });

      await service.sendAccountLockedEmail(
        email,
        username,
        lockedUntil,
        loginAttempts,
      );

      expect(mockRender).toHaveBeenCalledWith(
        AccountLockedEmail({ username: '', lockedUntil, loginAttempts }),
      );
    });

    it('should handle large number of login attempts', async () => {
      const email = 'user@example.com';
      const username = 'testuser';
      const lockedUntil = new Date('2024-01-01T12:00:00Z');
      const loginAttempts = 100;
      const renderedHtml = '<p>Your account has been locked</p>';

      mockRender.mockResolvedValue(renderedHtml);
      mockSendMail.mockResolvedValue({ messageId: 'locked-message-id' });

      await service.sendAccountLockedEmail(
        email,
        username,
        lockedUntil,
        loginAttempts,
      );

      expect(mockRender).toHaveBeenCalledWith(
        AccountLockedEmail({ username, lockedUntil, loginAttempts: 100 }),
      );
    });
  });

  describe('configuration handling', () => {
    it('should handle missing SMTP configuration gracefully', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: ConfigService,
            useValue: mockDeep<ConfigService>({
              get: jest.fn(() => undefined),
            }),
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);
      expect(testService).toBeDefined();
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: undefined,
        port: undefined,
        secure: false,
        auth: {
          user: undefined,
          pass: undefined,
        },
      });
    });

    it('should handle non-standard port configuration', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MailService,
          {
            provide: ConfigService,
            useValue: mockDeep<ConfigService>({
              get: jest.fn((key: string) => {
                if (key === 'SMTP_PORT') return 25;
                return mockConfig[key];
              }),
            }),
          },
        ],
      }).compile();

      const testService = module.get<MailService>(MailService);
      expect(testService).toBeDefined();
      expect(mockNodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 25,
        secure: true,
        auth: {
          user: 'test@example.com',
          pass: 'password123',
        },
      });
    });
  });
});
