# Development Guidelines

## Project Architecture

### File Structure

// TBD

### Naming Conventions

- **Files**: Use kebab-case for file names (e.g., `user-profile.tsx`)
- **Components**: Use PascalCase for React components (e.g., `UserProfile`)
- **Variables/Functions**: Use camelCase (e.g., `getUserData`)
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types**: Use PascalCase with descriptive names (e.g., `UserProfileData`)

### Component Guidelines

- Create small, focused components with single responsibilities
- Use TypeScript for all components with proper type definitions
- Prefer function components with hooks over class components
- Use `const` declarations for component definitions
- Extract complex logic into custom hooks when appropriate
- Props should be explicitly typed

### State Management

- Use React's built-in state management (useState, useReducer) for component-level state
- For complex state logic, consider custom hooks or context API
- Avoid prop drilling by using React Context for deeply nested components
- Keep state as close to where it's used as possible

### Styling Guidelines

- Use Tailwind CSS for styling with utility-first approach
- Create component-specific styles using Tailwind classes
- Use CSS modules or styled-components only when Tailwind is insufficient
- Maintain consistent spacing and color schemes across the application
- Follow mobile-first responsive design principles

### TypeScript Guidelines

- Enable strict mode in TypeScript configuration
- Define explicit types for all function parameters and return values
- Use `type` instead of `interface`
- Avoid `any` type; use `unknown` when necessary and narrow types appropriately
- Leverage TypeScript's utility types (Pick, Omit, Partial, etc.) when appropriate

#### Async/Await Guidelines

- Prioritize async/await over Promise chains
- Use `Promise.all()` or `Promise.allSettled()` for parallel processing
- Always implement error handling
- Explicitly define return types for asynchronous functions
- Consider implementing timeout handling

#### Other Guidelines

- For import statements, do not use absolute paths; always use import aliases starting with `@/`
- Use `pnpm` for package management and CLI commands

### GitHub Usage Rules

- When task completed, execute `pnpm check:fix` to format file changes
- Commit messages must use one of the following prefixes: chore, fix, feat, docs
- Commit messages should be written in Japanese describing what was changed and why
- Make commits frequently with very small granularity
- Since Lint, test, and typecheck are basically verified in CI, confirm local success before pushing
- PRs will never be merged as long as there are CI errors
- Branches should start with prefixes like feat, fix, docs, chore, etc., and clearly indicate the issue number. Example: fix/issue-1

### Performance Guidelines

- Implement code splitting for route-based components
- Use React.memo() for components that render frequently with the same props
- Optimize images using Next.js Image component
- Implement lazy loading for non-critical components
- Monitor bundle size and remove unused dependencies

### Testing Guidelines

- Write unit tests for utility functions and complex business logic
- Use React Testing Library for component testing
- Implement integration tests for critical user flows
- Maintain test coverage above 80% for core functionality
- Mock external dependencies and API calls in tests

### Security Guidelines

- Sanitize all user inputs to prevent XSS attacks
- Use environment variables for sensitive configuration
- Implement proper authentication and authorization checks
- Validate data on both client and server sides
- Keep dependencies updated to avoid security vulnerabilities

### Documentation Guidelines

- Document complex business logic and algorithms
- Maintain up-to-date README files for setup instructions
- Use JSDoc comments for utility functions and complex components
- Keep component props well-documented with TypeScript interfaces
- Document API endpoints and data structures

## Development Workflow

1. Create feature branch from main
2. Implement changes following guidelines above
3. Run tests and ensure all pass
4. Run linting and type checking
5. Create pull request with descriptive title and body
6. Address code review feedback
7. Merge after approval and CI success

## Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm tc`: Run type checking
- `pnpm check`: Run linting
- `pnpm check:fix`: Run linting with auto-fix
- `pnpm test`: Run test suite
