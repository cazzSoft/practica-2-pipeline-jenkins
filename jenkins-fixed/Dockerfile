FROM jenkins/jenkins:lts-jdk21

USER root

ARG NODE_VERSION=22.14.0
ARG DOCKER_VERSION=27.5.1

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl xz-utils \
    && curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
    && tar -xJf "node-v${NODE_VERSION}-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
    && rm "node-v${NODE_VERSION}-linux-x64.tar.xz" \
    && curl -fsSLO "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz" \
    && tar -xzf "docker-${DOCKER_VERSION}.tgz" -C /usr/local/bin --strip-components=1 docker/docker \
    && rm "docker-${DOCKER_VERSION}.tgz" \
    && rm -rf /var/lib/apt/lists/* \
    && node --version \
    && npm --version \
    && docker --version

USER jenkins
