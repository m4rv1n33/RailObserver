FROM eclipse-temurin:21-jdk AS build
WORKDIR /build
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# The wrapper is executable in git, but a checkout that drops the mode bit (a
# zip export, or a clone with core.fileMode off) otherwise fails here with a
# bare exit 126, which says nothing about why.
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline
COPY src/ src/
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app
RUN useradd --system --uid 1001 railobserver
COPY --from=build /build/target/*.jar app.jar
USER railobserver
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
