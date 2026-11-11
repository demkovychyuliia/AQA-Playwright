# Use the official Playwright image with Firefox and system dependencies
FROM mcr.microsoft.com/playwright:v1.64.1-noble

# Set the working directory inside the container
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci

# Copy the project files
COPY . .

# Run Playwright tests in Firefox
CMD ["npx", "playwright", "test", "--project=firefox", "--forbid-only"]
