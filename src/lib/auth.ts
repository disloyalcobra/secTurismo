/* eslint-disable */
import { SignJWT, jwtVerify } from 'jose';

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('La variable de entorno JWT_SECRET no está definida. Configúrala en Vercel por seguridad.');
    }
    // Clave de desarrollo por defecto (nunca debe usarse en producción)
    return new TextEncoder().encode('super_secret_puebla_turismo_key_2026_change_me');
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // Expira en 1 hora como se especifica en los requerimientos (30-60 min)
    .sign(getSecretKey());
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, getSecretKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
