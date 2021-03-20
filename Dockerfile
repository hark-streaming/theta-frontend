FROM node:12

MAINTAINER dispatch <admin@bitwave.tv>

# Install global npm packages
RUN npm install -g typescript

# Install npm packages
COPY package.json package-lock.json /theta-bitwave/
RUN cd /theta-bitwave && \
    npm ci && \
    npm cache verify

# Copy source code
COPY . /theta-bitwave
WORKDIR /theta-bitwave

# Build server
RUN cd /theta-bitwave && \
    npm run build && \
    npm prune --production --dry-run

# Expose port
EXPOSE 3000

ENV HOST 0.0.0.0

# Start server
CMD [ "npm", "start" ]
