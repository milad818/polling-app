# ==============================================================================
# Stage 1 – dependency cache (shared by all subsequent stages)
#
# Pre-downloads every Maven dependency declared in pom.xml.
# Docker caches this layer and only re-executes it when pom.xml changes,
# which means CI and local rebuilds after source edits are very fast.
# ==============================================================================
FROM eclipse-temurin:21-jdk AS deps
WORKDIR /app

# Copy only the files Maven needs to resolve dependencies.
# Source code is intentionally excluded so this layer stays cached.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B --no-transfer-progress

# ==============================================================================
# Stage 2 – development
#
# Inherits the pre-fetched deps.docker-compose.dev.yml volume-mounts
# ./pollingapp/src into /app/src so that the host editor and the container
# always see the same source tree.
#
# The app starts via spring-boot:run (Maven plugin), which forks a JVM with
# the compiled classes. If spring-boot-devtools is added to pom.xml, the JVM
# will restart its application context automatically on class-file changes,
# giving near-instant hot-reload without rebuilding the Docker image.
#
# HEADS UP! Port 5005 is the Java Debug Wire Protocol port – connect IDE's
# remote-debugger to it for live breakpoints inside a running container.
# ==============================================================================
FROM deps AS development
COPY src ./src
EXPOSE 8080 5005
CMD ["./mvnw", "spring-boot:run", \
     "-Dspring-boot.run.jvmArguments=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"]

# ==============================================================================
# Stage 3 – builder (production compile)
#
# Produces the executable fat JAR.  Tests are deliberately skipped here
# because CI runs them in a dedicated step before building the image.
# The resulting JAR lives at target/pollingapp-*.jar.
# ==============================================================================
FROM deps AS builder
COPY src ./src
RUN ./mvnw package -DskipTests -B --no-transfer-progress

# ==============================================================================
# Stage 4 – production runtime
#
# Uses only the JRE (not the full JDK), dropping ~150 MB from the final image.
# No source files, no Maven, no build tooling – just the compiled JAR.
#
# To migrate to a real server:
#   • Push this image to a registry (Docker Hub, ECR, GCR, ACR …)
#   • Reference the registry tag in docker-compose.yml instead of `build:`
#   • Supply secrets via the orchestrator's secret manager, not a local .env
# ==============================================================================
FROM eclipse-temurin:21-jre AS production
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-jar", "app.jar"]
