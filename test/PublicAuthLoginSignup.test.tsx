import React from "react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { action } from "~/routes/_public.auth";
import { ActionFunctionArgs } from "@remix-run/node";
import {
  validateLoginInput,
  validateSignUpInput,
} from "~/server/validation.server";

// Mock validation functions
vi.mock("~/server/validation.server", () => ({
  validateLoginInput: vi.fn(),
  validateSignUpInput: vi.fn(),
}));

describe("Auth Action Function", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("Signup Validation", () => {
    it("should return an error for invalid signup credentials", async () => {
      vi.mocked(validateSignUpInput).mockImplementation(() => {
        throw {
          license: "Por favor ingrese un válido Cédula profesional.",
        };
      });

      const request = new Request("http://localhost/auth?mode=signup", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          nombre: "John",
          apellidoPaterno: "Doe",
          license: "11111111111111",
          whichEstado: "CDMX",
          email: "test@example.com",
          password: "Password$123",
        }).toString(),
      });

      const args = { request } as ActionFunctionArgs;
      const response = await action(args);

      let responseBody;
      if (response instanceof Response) {
        responseBody = await response.json();
      } else {
        responseBody = response;
      }

      expect(responseBody).toEqual({
        error: { license: "Por favor ingrese un válido Cédula profesional." },
      });
    });
  });

  describe("Login Validation", () => {
    it("should return an error for invalid login credentials", async () => {
      vi.mocked(validateLoginInput).mockImplementation(() => {
        throw {
          email:
            "Por favor, introduce una dirección de correo electrónico válida.",
        };
      });

      const request = new Request("http://localhost/auth?mode=login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: "invalid-email",
          password: "Password$123",
        }).toString(),
      });

      const args = { request } as ActionFunctionArgs;
      const response = await action(args);

      let responseBody;
      if (response instanceof Response) {
        responseBody = await response.json();
      } else {
        responseBody = response;
      }

      expect(responseBody).toEqual({
        error: {
          email:
            "Por favor, introduce una dirección de correo electrónico válida.",
        },
      });
    });
  });
});
