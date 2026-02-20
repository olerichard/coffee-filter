# Coffee Filter - Agent Guidelines

## Commands

### Backend (.NET)
- Build: `dotnet build Backend/Api/Api.csproj`
- Test: `dotnet test Backend/Api/Api.csproj`
- Run single test: `dotnet test --filter "TestMethodName"`
- Migrations: `dotnet ef migrations add <Name> --project Backend/Api/Api.csproj`
- Apply migrations: `dotnet ef database update --project Backend/Api/Api.csproj`

### Frontend (React/TypeScript)
- Build: `npm run build`
- Test: `npm run test`
- Run single test: `npm run test -- --run testName`
- Lint: `npm run lint`
- Format: `npm run format`
- Dev: `npm run dev`

## Code Style

### .NET (Backend)
- Nullable reference types enabled
- Implicit usings enabled
- Warnings treated as errors
- Use `required` for non-nullable properties
- Entity properties: `DbSet<Entity> Entities { get; set; } = null!;`
- Namespaces: `Api.FeatureArea.EntityName`
- No XML comments (1591 warnings suppressed)

### Validation
- Use FluentValidation for all request validation
- Always perform manual validation in controllers (not automatic validation)
- Inject the validator as `[FromServices]` and call `validator.ValidateAsync(request)`
- Return `BadRequest(validationResult.Errors)` if validation fails
- Example pattern (from AuthController/Login):
  ```csharp
  public async Task<IActionResult> Login(
      [FromBody] LoginRequest request, 
      [FromServices] LoginRequestValidator validator)
  {
      var validationResult = await validator.ValidateAsync(request);
      if (!validationResult.IsValid)
      {
          return BadRequest(validationResult.Errors);
      }
      // ... rest of method
  }
  ```

### TypeScript (Frontend)
- Strict mode enabled
- Single quotes, no semicolons, trailing commas
- Path aliases: `@/*` maps to `./src/*`
- TanStack Router/Query/Start stack
- Tailwind CSS for styling
- Use `clsx` and `tailwind-merge` for conditional classes

### General
- EF Core migrations auto-apply on startup
- Database in `~/.database/coffee-filter.db`
- Use FluentValidation for validation
- Follow existing folder structure: Features/FeatureArea/