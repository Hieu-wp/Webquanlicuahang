# Bước 1: Build
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .

# Lệnh build trỏ chính xác vào nơi có pom.xml
RUN mvn -f webbanhang/webbanhang/pom.xml clean package -DskipTests

# Bước 2: Run
FROM openjdk:17-jdk-slim
WORKDIR /app
# Copy file jar từ thư mục target tương ứng
COPY --from=build /app/webbanhang/webbanhang/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
