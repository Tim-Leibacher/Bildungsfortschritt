// backend/src/middleware/validation.js
import { body, validationResult } from "express-validator";

// E-Mail-Validierung mit Umlaut-Unterstützung
export const validateEmail = body("email")
  .isEmail({
    allow_utf8_local_part: true, // Ermöglicht UTF-8 Zeichen vor dem @
    allow_display_name: false,
    require_display_name: false,
    allow_underscores: true,
    require_tld: true,
  })
  .withMessage(
    "Bitte geben Sie eine gültige E-Mail-Adresse ein. Umlaute sind erlaubt."
  )
  .normalizeEmail({
    all_lowercase: true,
    gmail_lowercase: true,
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
    gmail_convert_googlemaildotcom: false,
    outlookdotcom_lowercase: true,
    outlookdotcom_remove_subaddress: false,
    yahoo_lowercase: true,
    yahoo_remove_subaddress: false,
    icloud_lowercase: true,
    icloud_remove_subaddress: false,
  });

// Passwort-Validierung
export const validatePassword = body("password")
  .isLength({ min: 6, max: 128 })
  .withMessage("Passwort muss zwischen 6 und 128 Zeichen lang sein")
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage(
    "Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten"
  );

// Name-Validierung
export const validateName = (fieldName) =>
  body(fieldName)
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage(`${fieldName} muss zwischen 1 und 50 Zeichen lang sein`)
    .matches(/^[a-zA-ZäöüÄÖÜß\s-']+$/)
    .withMessage(
      `${fieldName} darf nur Buchstaben, Leerzeichen, Bindestriche und Apostrophe enthalten`
    );

// Lehrjahr-Validierung
export const validateLehrjahr = body("lehrjahr")
  .optional()
  .isInt({ min: 1, max: 4 })
  .withMessage("Lehrjahr muss zwischen 1 und 4 sein");

// Registrierungs-Validierung
export const registerValidation = [
  validateEmail,
  validatePassword,
  validateName("firstName"),
  validateName("lastName"),
  validateLehrjahr,
  body("isBB")
    .optional()
    .isBoolean()
    .withMessage("isBB muss ein Boolean-Wert sein"),
];

// Login-Validierung
export const loginValidation = [
  validateEmail,
  body("password").notEmpty().withMessage("Passwort ist erforderlich"),
];

// Middleware zum Prüfen der Validierungsergebnisse
export const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validierungsfehler",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Spezielle E-Mail-Normalisierung für deutsche Umlaute
export const normalizeGermanEmail = (email) => {
  if (!email) return email;

  // Konvertiere zu lowercase aber behalte Umlaute
  return email.toLowerCase().trim();
};

// Test-Funktion für E-Mail-Validierung
export const isValidEmailWithUmlauts = (email) => {
  // Unicode-bewusste E-Mail-Regex
  const unicodeEmailRegex =
    /^[\w.!#$%&'*+/=?^`{|}~\u00C0-\u017F-]+@[a-zA-Z0-9\u00C0-\u017F](?:[a-zA-Z0-9\u00C0-\u017F-]{0,61}[a-zA-Z0-9\u00C0-\u017F])?(?:\.[a-zA-Z0-9\u00C0-\u017F](?:[a-zA-Z0-9\u00C0-\u017F-]{0,61}[a-zA-Z0-9\u00C0-\u017F])?)*$/;

  return unicodeEmailRegex.test(email);
};
