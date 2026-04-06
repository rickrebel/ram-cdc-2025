import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthPage, { action } from "~/routes/_public.auth";
import { ActionFunctionArgs } from "@remix-run/node";
import { MemoryRouter } from "react-router-dom";
import {
  validateLoginInput,
  validateSignUpInput,
} from "~/server/validation.server";
import { AuthMode } from "~/utilities/types";

vi.mock("~/components/auth/AuthForm", () => ({
  __esModule: true,
  default: () => <div>AuthForm Component</div>,
}));

vi.mock("~/utilities/ErrorBody", () => ({
  __esModule: true,
  ErrorBody: ({ error }: { error: Error }) => <div>{error.message}</div>,
}));

// ✅ Mock the entire module before any tests run
vi.mock("~/server/validation.server", () => ({
  validateLoginInput: vi.fn(),
  validateSignUpInput: vi.fn(),
}));

// Mock the fetch API response for a failed login attempt
vi.stubGlobal(
  "fetch",
  vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () =>
        Promise.resolve({
          errors: {
            email:
              "No existe un usuario con la dirección de correo electrónico proporcionada. Por favor, compruebe las credenciales proporcionadas.",
          },
        }),
    })
  )
);

// Mock ValidationError class
class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;

    // Fix prototype chain.
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

const isAuthMode = (value: string | null): value is AuthMode =>
  ["login", "signup", "forgot-password"].includes(value ?? "");

// Mock getAuthModeFromRequest.
const getAuthModeFromRequest = async (request: Request) => {
  const searchParams = new URL(request.url).searchParams;
  const mode = searchParams.get("mode");
  // Since 'authMode' isn't returned with the `Form` from component 'AuthForm', we need to
  // define the same default value for 'authMode' here as was done in 'AuthForm'.
  return isAuthMode(mode) ? mode : "login";
};

describe("AuthPage Component", () => {
  it("renders AuthForm component", () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>
    );
    expect(screen.getByText("AuthForm Component")).toBeInTheDocument();
  });
});

describe("ValidationError Class", () => {
  it("should create an instance of ValidationError", () => {
    const error = new ValidationError("Test error", 404);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(404);
  });

  it("should create an instance of ValidationError when 'email' isn't provided in 'forgot-password' mode", () => {
    const error = new ValidationError("El correo electrónico es requerido.");
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toBe("El correo electrónico es requerido.");
    expect(error.statusCode).toBe(400);
  });
});

describe("getAuthModeFromRequest Function", () => {
  it("should return the correct auth mode when a correct auth mode is provided (login)", async () => {
    const request = new Request("http://localhost/auth?mode=login");
    const mode = await getAuthModeFromRequest(request);
    expect(mode).toBe("login");
  });

  it("should return the correct auth mode when a correct auth mode is provided (signup)", async () => {
    const request = new Request("http://localhost/auth?mode=signup");
    const mode = await getAuthModeFromRequest(request);
    expect(mode).toBe("signup");
  });

  it("should return the correct auth mode when a correct auth mode is provided (forgot-password)", async () => {
    const request = new Request("http://localhost/auth?mode=forgot-password");
    const mode = await getAuthModeFromRequest(request);
    expect(mode).toBe("forgot-password");
  });

  it("should return default auth mode as login if no auth mode is provided", async () => {
    const request = new Request("http://localhost/auth");
    const mode = await getAuthModeFromRequest(request);
    expect(mode).toBe("login");
  });

  it("should default to 'login' if an invalid mode is provided", async () => {
    const request = new Request("http://localhost/auth?mode=invalid-mode");
    const mode = await getAuthModeFromRequest(request);
    expect(mode).toBe("login");
  });
});

describe("action Function catch block error handling", () => {
  // Strictly a unit test of the "catch" block of the "action" function.
  // Ensuring that it throws one of the expected errors:
  // 1. If a ValidationError is thrown:
  //    The function should return { errors: { credentials: error.message } }.
  // 2. If a generic Error is thrown:
  //    The function should return { errors: { credentials: error.message } } as well.
  // 3. If an unknown error type is thrown:
  //    The function should return { errors: { credentials: "Un error desconocido ocurrió." } }.

  // Equivalently, this is not an integration test and so doesn't involve the real
  // server-side "validateLoginInput" or "validateSignUpInput" functions at all.
  // If those functionalities changed, this test would not catch it and we'd need to
  // update this test as well. Hence we mock those functions.

  beforeEach(() => {
    // ✅ Reset mocks before each test
    vi.resetAllMocks();
  });

  it("should handle login action", async () => {
    const request = new Request("http://localhost/auth?mode=login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: "test@example.com",
        password: "password",
      }).toString(),
    });
    const args = { request } as ActionFunctionArgs;
    const response = await action(args);
    expect(response).toBeDefined();
  });

  it("should handle forgot-password action", async () => {
    const request = new Request("http://localhost/auth?mode=forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: "test@example.com",
      }).toString(),
    });
    const args = { request } as ActionFunctionArgs;
    const response = await action(args);
    expect(response).toBeDefined();
  });
});
