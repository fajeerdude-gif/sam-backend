// Temporary ambient declaration for the "cors" module.  
// Some deployment environments (e.g. Vercel) may not install @types/cors
// before compiling the server TypeScript. Adding this file prevents
// TS7016 errors during the build.

declare module 'cors';
