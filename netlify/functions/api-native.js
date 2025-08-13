import prisma from '../../src/config/prismaClient.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Ensure environment variables are available
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set');
}
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set');
}

export const handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('HTTP Method:', event.httpMethod);
    console.log('Path:', event.path);
    console.log('Raw Body:', event.body);
    console.log('Headers:', event.headers);

    // Parse body
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
        console.log('Parsed body:', body);
      } catch (e) {
        console.error('JSON parse error:', e);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid JSON in request body' })
        };
      }
    }

    // Route handling
    const path = event.path.replace('/.netlify/functions/api-native', '');
    
    if (event.httpMethod === 'POST' && path === '/login') {
      console.log('Login request received');
      
      const { email, password } = body;
      
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            message: 'Email and password are required',
            received: { email: !!email, password: !!password },
            rawBody: body
          })
        };
      }

      const user = await prisma.user.findUnique({
        where: { email: email },
      })
      
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid email or password' })
        };
      }
      
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid email or password' })
        };
      }
      
      const { password: _, ...userwithoutpassword } = user
      const token = jwt.sign({ userId: user.id, userName: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' })

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...userwithoutpassword, token })
      };
    }

    // Default response for unmatched routes
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found', path: path, method: event.httpMethod })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};
