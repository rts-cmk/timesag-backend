import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Ensure Next infers the correct workspace root for output tracing
  // This prevents the warning about Next picking a parent directory
  // when multiple lockfiles are present on the machine.
  outputFileTracingRoot: path.resolve(__dirname),
}

export default nextConfig
