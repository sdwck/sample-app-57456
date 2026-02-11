FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/WeatherForecast.API/WeatherForecast.API.csproj", "src/WeatherForecast.API/"]
RUN dotnet restore "src/WeatherForecast.API/WeatherForecast.API.csproj"

COPY . .
WORKDIR "/src/src/WeatherForecast.API"
RUN dotnet build "./WeatherForecast.API.csproj" -c Release -o /app/build

FROM build AS publish
WORKDIR "/src/src/WeatherForecast.API"
RUN dotnet publish "./WeatherForecast.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WeatherForecast.API.dll"]
