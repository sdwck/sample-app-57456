FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/WeatherForecast.API/.", "src/WeatherForecast.API/"]
RUN dotnet publish "src/WeatherForecast.API/WeatherForecast.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WeatherForecast.API.dll"]