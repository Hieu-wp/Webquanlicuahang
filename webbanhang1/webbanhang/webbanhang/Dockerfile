# Bước 1: Build dự án bằng Maven
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .

# Di chuyển vào đúng thư mục chứa pom.xml để build (Dựa trên cấu trúc webbanhang/webbanhang)
RUN mvn -f webbanhang/webbanhang/pom.xml clean package -DskipTests

# Bước 2: Chạy ứng dụng bằng JDK nhẹ
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy file .jar từ thư mục target nằm sâu bên trong cấu trúc đã build
COPY --from=build /app/webbanhang/webbanhang/target/*.jar app.jar

# Khai báo cổng
EXPOSE 8080

# Lệnh khởi chạy chính xác
ENTRYPOINT ["java", "-jar", "app.jar"]
