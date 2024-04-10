# Use a base image with Maven and OpenJDK
FROM maven:3.9-eclipse-temurin-21 AS build

# Set the working directory in the container
WORKDIR /app

# Copy the Maven project
COPY . .

# Package the application
RUN mvn package

# Use a base image with OpenJDK
FROM openjdk:21-jdk

EXPOSE 3000

# Set the working directory in the container
WORKDIR /app

# Copy the packaged JAR file from the Maven build stage
COPY --from=build /app/target/talkgpt-0.0.1-SNAPSHOT.jar /app/talkgpt-0.0.1-SNAPSHOT.jar

# Set the command to run the application when the container starts
CMD ["java", "-jar", "talkgpt-0.0.1-SNAPSHOT.jar"]
