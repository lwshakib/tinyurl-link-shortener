# Contributing to TinyURL

We love your input! We want to make contributing to TinyURL as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use github to host code, to track issues and feature requests, and to accept pull requests.

## Software Prerequisites

To contribute to this project, you will need:
- **Git** (for version control)
- **Node.js** (v18 or higher) or **Bun** (v1.0+)
- **Docker** & **Docker Compose** (recommended for running the full stack)
- A Code Editor (VS Code recommended)

## Development Process

### 1. Fork the Project

Fork the project on Github and clone your fork locally:

```bash
git clone https://github.com/your-username/tinyurl-link-shortener.git
cd tinyurl-link-shortener
```

### 2. Configure Remote Upstream

Configure the remote for your fork:

```bash
git remote add upstream https://github.com/lwshakib/tinyurl-link-shortener.git
```

### 3. Create a Branch

Always create a new branch for your work. Do not work directly on `main`.

```bash
# Get the latest changes from upstream
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/my-amazing-feature
# or for bugs
git checkout -b fix/issue-description
```

### 4. Setup Environment

Install dependencies for all services:

**Main Server:**
```bash
cd server
bun install
```

**URL Generator Service:**
```bash
cd url-generation-service
bun install
```

**Frontend:**
```bash
cd web
npm install
```

### 5. Make Changes

Implement your feature or bug fix. Ensure you follow the existing coding style (TypeScript, functional components, etc.).

### 6. Commit Changes

Commit your changes with clear messages.

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 7. Push and Pull Request

Push your changes to your fork:

```bash
git push origin feature/my-amazing-feature
```

Then go to Github and open a **Pull Request** against the `main` branch.

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
