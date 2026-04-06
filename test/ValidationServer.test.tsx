import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import {
  isValidCorreo,
  isUniqueCURP,
  isValidNombre,
  isValidCURP,
  isValidPassword,
  isValidCedulaProf,
  isValidDropDownOption,
  isValidNumericalValue,
  isValidCountrySelection,
  validateLoginInput,
  validateSignUpInput,
} from "~/server/validation.server";
import { prisma } from "~/server/database.server";
import { LoginCredentials, SignupCredentials } from "~/utilities/types";

describe("Validation Server Tests", () => {
  it("should validate email correctly", () => {
    expect(isValidCorreo("test@example.com")).toBe(true);
    expect(isValidCorreo("invalid-email")).toBe(false);
  });

  it("should validate unique CURP", async () => {
    prisma.clinicos.findFirst = vi.fn().mockResolvedValue(null);
    expect(await isUniqueCURP("validCURP")).toBe(true);

    prisma.clinicos.findFirst = vi
      .fn()
      .mockResolvedValue({ curp: "validCURP" });
    expect(await isUniqueCURP("validCURP")).toBe(false);
  });

  it("should validate name correctly", () => {
    expect(isValidNombre("John")).toBe(true);
    expect(isValidNombre("")).toBe(false);
  });

  it("should validate CURP correctly", () => {
    // A CURP has to be exactly 18 characters.
    expect(isValidCURP("ABCD123456EFGHIJ12")).toBe(true);
    expect(isValidCURP("invalidCURP")).toBe(
      "Respecto a la CURP: la CURP debe tener exactamente 18 caracteres."
    );

    // A CURP has to have the first 4 characters be alphabetic.
    expect(isValidCURP("1234000000AAAAAA00")).toBe(
      "Respecto a la CURP: los primeros 4 caracteres deben ser alfabéticos."
    );

    // After the first 4 characters, the next 6 characters must be numeric.
    expect(isValidCURP("ABCD123456EFGHIJ12")).toBe(true);

    // The last 2 characters must be numeric.
    expect(isValidCURP("ABCD123456EFGHIJ12")).toBe(true);
  });

  it("should validate password correctly", () => {
    // A valid password (7+ characters).
    expect(isValidPassword("abcdefg")).toBe(true);
    expect(isValidPassword("1234567")).toBe(true);

    // Too short (less than 7 characters).
    expect(isValidPassword("abcdef")).toBe(false);
    expect(isValidPassword("123456")).toBe(false);

    // Empty or falsy values.
    expect(isValidPassword("")).toBe(false);
  });

  it("should validate Cedula Prof correctly", () => {
    // Between 5 and 7 characters should be true.
    expect(isValidCedulaProf("12345")).toBe(true);
    // Less than 5 characters should be false.
    expect(isValidCedulaProf("123")).toBe(false);
    // More than 7 characters should be false.
    expect(isValidCedulaProf("12345678")).toBe(false);
  });

  it("should validate dropdown option correctly", () => {
    expect(isValidDropDownOption("option")).toBe(true);
    expect(isValidDropDownOption("Seleccione una opción")).toBe(false);
  });

  it("should validate numerical value correctly", () => {
    expect(isValidNumericalValue("10", 5)).toBe(true);
    expect(isValidNumericalValue("3", 5)).toBe(false);
  });

  it("should validate country selection correctly", () => {
    expect(isValidCountrySelection("Mexico")).toBe(true);
    expect(isValidCountrySelection(undefined)).toBe(true);
  });

  it("should validate login input correctly", () => {
    // Everything should be valid should not throw.
    const validInput: LoginCredentials = {
      email: "test@example.com",
      password: "Password$123",
      whichEstado: "CDMX",
    };
    expect(() => validateLoginInput(validInput)).not.toThrow();

    // Invalid email should throw.
    const invalidEmail: LoginCredentials = {
      email: "invalid-email",
      password: "Password$123",
      whichEstado: "CDMX",
    };
    expect(() => validateLoginInput(invalidEmail)).toThrow();

    // Invalid password (too short) should throw.
    const invalidPasswordInput: LoginCredentials = {
      email: "test@example.com",
      password: "abc",
      whichEstado: "CDMX",
    };
    expect(() => validateLoginInput(invalidPasswordInput)).toThrow();
  });

  it("should validate sign up input correctly", () => {
    // Everything should be valid should not throw.
    const validInput: SignupCredentials = {
      nombre: "John",
      apellidoPaterno: "Doe",
      license: "12345",
      institution: "UNAM",
      whichEstado: "CDMX",
      email: "test@example.com",
      password: "Password123$",
    };
    expect(() => validateSignUpInput(validInput)).not.toThrow();

    // Invalid name should throw.
    const invalidName: SignupCredentials = {
      nombre: "",
      apellidoPaterno: "Doe",
      license: "12345",
      institution: "UNAM",
      whichEstado: "CDMX",
      email: "test@example.com",
      password: "Password123$",
    };
    expect(() => validateSignUpInput(invalidName)).toThrow();

    // Invalid surname should throw.
    const invalidSurname: SignupCredentials = {
      nombre: "John",
      apellidoPaterno: "",
      license: "12345",
      institution: "UNAM",
      whichEstado: "CDMX",
      email: "test@example.com",
      password: "Password123$",
    };
    expect(() => validateSignUpInput(invalidSurname)).toThrow();

    // Invalid license should throw.
    const invalidLicense: SignupCredentials = {
      nombre: "John",
      apellidoPaterno: "Doe",
      license: "1234",
      institution: "UNAM",
      whichEstado: "CDMX",
      email: "test@example.com",
      password: "Password123$",
    };
    expect(() => validateSignUpInput(invalidLicense)).toThrow();

    // Invalid email should throw.
    const invalidEmail: SignupCredentials = {
      nombre: "John",
      apellidoPaterno: "Doe",
      license: "12345",
      institution: "UNAM",
      whichEstado: "CDMX",
      email: "invalid-email",
      password: "Password123$",
    };
    expect(() => validateSignUpInput(invalidEmail)).toThrow();

    // Invalid password (too short) should throw.
    const invalidPassword: SignupCredentials = {
      nombre: "John",
      apellidoPaterno: "Doe",
      license: "12345",
      institution: "UNAM",
      whichEstado: "CDMX",
      email: "test@example.com",
      password: "abc",
    };
    expect(() => validateSignUpInput(invalidPassword)).toThrow();
  });
});
