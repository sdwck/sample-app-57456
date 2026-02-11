FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/Order.API/Order.API.csproj", "src/Order.API/"]
RUN dotnet restore "src/Order.API/Order.API.csproj"

COPY . .
WORKDIR "/src/src/Order.API"
RUN dotnet build "./Order.API.csproj" -c Release -o /app/build

FROM build AS publish
WORKDIR "/src/src/Order.API"
RUN dotnet publish "./Order.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Order.API.dll"]
