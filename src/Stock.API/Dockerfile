FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Stock.API/Stock.API.csproj", "src/Stock.API/"]
RUN dotnet restore "src/Stock.API/Stock.API.csproj"

COPY . .
WORKDIR "/src/src/Stock.API"
RUN dotnet build "./Stock.API.csproj" -c Release -o /app/build

FROM build AS publish
WORKDIR "/src/src/Stock.API"
RUN dotnet publish "./Stock.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Stock.API.dll"]
