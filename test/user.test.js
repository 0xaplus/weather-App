const request = require("supertest");
const app = require("../server");
const User = require("../models/user.model");
const sendToken = require("../utils/jwtToken");

// Mock User model methods
jest.mock("../models/user.model", () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  comparePassword: jest.fn(),
}));

// Mock sendToken function
jest.mock("../utils/jwtToken", () => jest.fn());

describe("User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe("registerUser", () => {
    it("should register a new user", async () => {
      User.findOne.mockResolvedValue(null); // Mock user not found
      User.save.mockResolvedValue(); // Mock saving user

      const userData = { email: "test@example.com", password: "password" };
      const response = await request(app).post("/api/user/signup").send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body.msg).toBe("User registered successfully");
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app).post("/api/user/signup").send({});

      expect(response.statusCode).toBe(400);
      expect(response.body.msg).toBe("Field cannot be empty!");
    });

    it("should return 400 if user already exists", async () => {
      User.findOne.mockResolvedValue({}); // Mock user found

      const userData = { email: "test@example.com", password: "password" };
      const response = await request(app).post("/api/user/signup").send(userData);

      expect(response.statusCode).toBe(400);
      expect(response.body.msg).toBe("User already exists");
    });

    it("should return 500 if an error occurs during registration", async () => {
      User.findOne.mockRejectedValue(new Error("Database error"));

      const userData = { email: "test@example.com", password: "password" };
      const response = await request(app).post("/api/user/signup").send(userData);

      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual({});
    });
  });

  describe("loginUser", () => {
    it("should log in a user with valid credentials", async () => {
      const mockUser = { comparePassword: jest.fn().mockResolvedValue(true) };
      User.findOne.mockResolvedValue(mockUser);

      const userData = { email: "test@example.com", password: "password" };
      const response = await request(app).post("/api/user/login").send(userData);

      expect(response.statusCode).toBe(201);
      expect(sendToken).toHaveBeenCalledWith(mockUser, 201, expect.any(Object));
    });

    // Add more test cases for loginUser function
  });

  // Add tests for logoutUser function
});
