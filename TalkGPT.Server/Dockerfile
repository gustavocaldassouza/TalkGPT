# Use a base image with OpenJDK
FROM openjdk:21-jdk

EXPOSE 3000

# Set the working directory in the container
WORKDIR /app

# Copy the JAR file into the container at the specified working directory
COPY target/talkgpt-0.0.1-SNAPSHOT.jar /app/talkgpt-0.0.1-SNAPSHOT.jar

# Set the command to run the application when the container starts
CMD ["java", "-jar", "talkgpt-0.0.1-SNAPSHOT.jar"]