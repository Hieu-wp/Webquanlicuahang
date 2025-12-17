# Bước 1: Build dự án
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
# Di chuyển vào thư mục chứa pom.xml và build
RUN mvn -f webbanhang/pom.xml clean package -DskipTests

# Bước 2: Chạy dự án
FROM openjdk:17-jdk-slim
# Copy file jar từ thư mục target nằm bên trong webbanhang
COPY --from=build /webbanhang/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
