FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Backend/Api/Api.csproj Backend/Api/
RUN dotnet restore Backend/Api/Api.csproj

COPY Backend/ Backend/
RUN dotnet publish Backend/Api/Api.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:5186
EXPOSE 5186

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Api.dll"]
