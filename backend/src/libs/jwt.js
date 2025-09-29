import jwt from "jsonwebtoken";

// Esta función crea un token JWT firmado con nuestra clave secreta.
// Recibe un 'payload' (generalmente el ID del usuario) que se guardará dentro del token.
export function createAccessToken(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // La clave secreta del archivo .env
      {
        expiresIn: "1d", // El token expirará en 1 día
      },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
}
