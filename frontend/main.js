import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;
let pythonProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 600,
    
    icon: path.join(__dirname, "public/pwd.png"), 
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false,
      webSecurity: false,
    },
    autoHideMenuBar: true,
  });

  // --- CRITICAL FIX ---
  // If the app is packaged, load the file. 
  // If developing (app.isPackaged is false), load the Vite server.
  const startUrl = app.isPackaged 
    ? `file://${path.join(__dirname, "../dist/index.html")}` 
    : "http://localhost:5173";

  console.log("Loading URL:", startUrl); // This log will tell us where it's looking
  mainWindow.loadURL(startUrl);

  // mainWindow.webContents.openDevTools(); // Keep commented out

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Start Python Backend
  const pythonScriptPath = path.join(__dirname, "../backend/app.py");
  console.log("Starting Python Backend at:", pythonScriptPath);
  
  pythonProcess = spawn("python", [pythonScriptPath]);

  pythonProcess.stdout.on("data", (data) => console.log(`[Python]: ${data}`));
  pythonProcess.stderr.on("data", (data) =>
    console.error(`[Python Error]: ${data}`),
  );
  pythonProcess.on("close", (code) => console.log(`Python Exited: ${code}`));
});

app.on("window-all-closed", function () {
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== "darwin") app.quit();
});