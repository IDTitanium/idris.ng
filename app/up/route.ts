// Compatibility with health monitors configured for Laravel's conventional /up.
// Keep this independent of the client-only portfolio and external services.
export { GET } from '../health/route';

export const dynamic = 'force-dynamic';
