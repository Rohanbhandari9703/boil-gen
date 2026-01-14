#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
//parsing which mode 
const mode = process.argv[3] || "full";

// READ PROJECT NAME
const projectName = process.argv[2];

if (!projectName) {
  console.error("❌ Please provide a project name");
  console.log("Usage: install-mern <project-name>");
  process.exit(1);
}

const projectPath = path.join(process.cwd(), projectName);

if (fs.existsSync(projectPath)) {
  console.error("❌ Folder already exists");
  process.exit(1);
}


// CREATE PROJECT ROOT

fs.mkdirSync(projectPath);
console.log("📁 Project folder created");


// CREATE BACKEND STRUCTURE

function setupBackend(projectPath) {
  const backendPath = path.join(projectPath, "backend");
  
  console.log("🛠️ Setting up backend...");

  // CREATE BACKEND FOLDER
  fs.mkdirSync(backendPath, { recursive: true });
  console.log("📁 Backend folder created");

  // CREATE BACKEND STRUCTURE
  const folders = [
    "src",
    "src/config",
    "src/controllers",
    "src/routes",
    "src/models",
    "src/middlewares"
  ];

  folders.forEach(folder => {
    fs.mkdirSync(path.join(backendPath, folder), { recursive: true });
  });

  console.log("📂 Backend folder structure created");

  // INIT NPM PROJECT
  console.log("📦 Initializing npm project...");
  execSync("npm init -y", {
    cwd: backendPath,
    stdio: "inherit"
  });

  // INSTALL DEPENDENCIES
  console.log("📥 Installing dependencies...");
  execSync(
    "npm install express mongoose dotenv cors",
    {
      cwd: backendPath,
      stdio: "inherit"
    }
  );

  execSync(
    "npm install -D nodemon",
    {
      cwd: backendPath,
      stdio: "inherit"
    }
  );

  // UPDATE package.json
  const pkgPath = path.join(backendPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

  pkg.type = "module";
  pkg.scripts = {
    start: "node src/server.js",
    dev: "nodemon src/server.js"
  };

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("🛠 package.json updated");

  // WRITE app.js
  const appJs = `
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

export default app;
`;

  fs.writeFileSync(path.join(backendPath, "src/app.js"), appJs);

  // WRITE server.js
  const serverJs = `
import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(\`🚀 Server is running on port \${PORT}\`);
      console.log(\`🌐 URL: http://localhost:\${PORT}\`);
      console.log("Ctrl + C to stop the server");
    });
  })
  .catch(err => {
    console.error("❌ DB connection failed:", err.message);
  });
`;

  fs.writeFileSync(path.join(backendPath, "src/server.js"), serverJs);

  // WRITE .env
  const envFile = `
PORT=5000
MONGO_URI=mongodb://localhost:27017/mydb
`;

  fs.writeFileSync(path.join(backendPath, ".env"), envFile);

  // SAMPLE CONTROLLER
  const controller = `
export const sampleController = (req, res) => {
  res.json({ message: "Sample controller working" });
};
`;

  fs.writeFileSync(
    path.join(backendPath, "src/controllers/sample.controller.js"),
    controller
  );

  // SAMPLE ROUTE
  const route = `
import { Router } from "express";
import { sampleController } from "../controllers/sample.controller.js";

const router = Router();

router.get("/sample", sampleController);

export default router;
`;

  fs.writeFileSync(
    path.join(backendPath, "src/routes/sample.routes.js"),
    route
  );

  console.log("✅ Backend setup completed successfully");
}

// frontend setup
function setupFrontend(projectPath) {
  const frontendPath = path.join(projectPath, "frontend");
  
  console.log("⚛️ Setting up React frontend (Vite + JS + Tailwind)...");

  // 1️⃣ Create React app using Vite (non-interactive, relative folder name)
  execSync(
    'npm create vite@latest frontend -- --template react',
    {
      cwd: projectPath,
      env: { ...process.env, CI: 'true' },
      stdio: "inherit"
    }
  );

  // 2️⃣ Install frontend dependencies
  console.log("📥 Installing frontend dependencies...");
  execSync("npm install", {
    cwd: frontendPath,
    stdio: "inherit"
  });

  execSync(
    "npm install react-router-dom axios",
    {
      cwd: frontendPath,
      stdio: "inherit"
    }
  );

  execSync(
    "npm install -D tailwindcss postcss autoprefixer",
    {
      cwd: frontendPath,
      stdio: "inherit"
    }
  );

  // 3️⃣ Initialize Tailwind
  execSync(
    "npx tailwindcss init -p",
    {
      cwd: frontendPath,
      stdio: "inherit"
    }
  );

  console.log("🎨 Tailwind installed");

  // 4️⃣ Configure Tailwind
  const tailwindConfig = `
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

  fs.writeFileSync(
    path.join(frontendPath, "tailwind.config.js"),
    tailwindConfig
  );

  const indexCss = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

  fs.writeFileSync(
    path.join(frontendPath, "src/index.css"),
    indexCss
  );

  // 5️⃣ Create basic folder structure
  const feFolders = [
    "src/components",
    "src/pages",
    "src/services"
  ];

  feFolders.forEach(folder => {
    fs.mkdirSync(path.join(frontendPath, folder), { recursive: true });
  });

  // 6️⃣ Home page
  const homePage = `
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-blue-600">
        🚀 MERN-GEN Frontend Ready
      </h1>
    </div>
  );
}
`;

  fs.writeFileSync(
    path.join(frontendPath, "src/pages/Home.jsx"),
    homePage
  );

  // 7️⃣ App.jsx
  const appJsx = `
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
`;

  fs.writeFileSync(
    path.join(frontendPath, "src/App.jsx"),
    appJsx
  );

  console.log("✅ Frontend setup complete");
  console.log("📂 Frontend folder: ./frontend");
  console.log("🚀 To start frontend: cd frontend && npm run dev");
}
if (mode === "frontend") {
  setupFrontend(projectPath);
} else if (mode === "backend") {
  setupBackend(projectPath);
} else {
  // default: full stack
  setupBackend(projectPath);
  setupFrontend(projectPath);
}


