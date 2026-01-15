namespace Api.OpenApi
{
  using Microsoft.AspNetCore.Authentication;
  using Microsoft.AspNetCore.Authentication.JwtBearer;
  using Microsoft.AspNetCore.OpenApi;
  using Microsoft.OpenApi;

  internal sealed class BearerSecuritySchemeTransformer(
    IAuthenticationSchemeProvider authenticationSchemeProvider
  ) : IOpenApiDocumentTransformer
  {
    public async Task TransformAsync(
      OpenApiDocument document,
      OpenApiDocumentTransformerContext context,
      CancellationToken cancellationToken
    )
    {
      var authenticationSchemes = await authenticationSchemeProvider.GetAllSchemesAsync();
      var hasJwtBearer = authenticationSchemes.Any(scheme => scheme.Name == JwtBearerDefaults.AuthenticationScheme);

      if (!hasJwtBearer)
      {
        return;
      }

      document.Components ??= new OpenApiComponents();
      document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();

      var bearerScheme = new OpenApiSecurityScheme
      {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
      };

      document.Components.SecuritySchemes[JwtBearerDefaults.AuthenticationScheme] = bearerScheme;

      var securityRequirement = new OpenApiSecurityRequirement
      {
        [new OpenApiSecuritySchemeReference(JwtBearerDefaults.AuthenticationScheme, document)] = new List<string>(),
      };

      if (document.Paths == null)
      {
        return;
      }

      foreach (var pathItem in document.Paths.Values)
      {
        if (pathItem.Operations == null)
        {
          continue;
        }

        foreach (var operation in pathItem.Operations.Values)
        {
          operation.Security ??= new List<OpenApiSecurityRequirement>();
          operation.Security.Add(securityRequirement);
        }
      }
    }
  }
}
