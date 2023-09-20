const { check, validationResult } = require("express-validator");

// Middleware qui valide les donnÃ©es d'inscription de l'utilisateur
exports.validateUserSignUp = [
  check("nom")
    .trim()
    .notEmpty().withMessage("Nom is required")
    .isLength({ min: 2, max: 25 }).withMessage("Name must be between 2 and 25 characters"),
  check("prenom")
    .trim()
    .notEmpty().withMessage("Prenom is required")
    .isLength({ min: 2, max: 25 }).withMessage("Name must be between 2 and 25 characters"),
  check("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email"),
  check("mdp")
    .trim()
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8, max: 20 }).withMessage("Password must be between 8 and 20 characters"),
  check("number")
    .trim()
    .notEmpty().withMessage("Number is required")
    .isLength({ min: 8, max: 20 }).withMessage("Number must be between 8 and 20 characters"),
];


exports.userValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    } else {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(422).json({ success: false, errors: errorMessages });
    }
  };