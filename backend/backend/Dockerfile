FROM eclipse-temurin:24-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -Dmaven.test.skip=true

EXPOSE 8080

CMD java -jar target/*.jar
