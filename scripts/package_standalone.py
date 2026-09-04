import os
import shutil
import zipfile
import time

def add_dir(zipf, dir_path):
    """Add a directory record to the zip archive with proper MS-DOS and Unix flags."""
    dir_name = dir_path.replace('\\', '/').rstrip('/') + '/'
    zinfo = zipfile.ZipInfo(dir_name)
    zinfo.date_time = (2026, 9, 4, 12, 0, 0)
    # Upper 16 bits: Unix permissions (0o755 = rwxr-xr-x)
    # Lower 16 bits: MS-DOS attributes (0x10 = FILE_ATTRIBUTE_DIRECTORY)
    zinfo.external_attr = (0o755 << 16) | 0x10
    zipf.writestr(zinfo, '')

def add_file(zipf, file_path, arc_name, is_executable=False, force_crlf=False):
    """Add a file to the zip archive with explicit attributes and correct line endings."""
    arc_name = arc_name.replace('\\', '/').lstrip('/')
    zinfo = zipfile.ZipInfo(arc_name)
    zinfo.date_time = (2026, 9, 4, 12, 0, 0)
    zinfo.compress_type = zipfile.ZIP_DEFLATED

    with open(file_path, 'rb') as f:
        data = f.read()

    if force_crlf:
        # Convert all line breaks to Windows CRLF (\r\n)
        text = data.decode('utf-8', errors='replace')
        text = text.replace('\r\n', '\n').replace('\r', '\n').replace('\n', '\r\n')
        data = text.encode('utf-8')

    mode = 0o755 if is_executable else 0o644
    # Upper 16 bits: Unix permissions
    # Lower 16 bits: MS-DOS attributes (0x20 = FILE_ATTRIBUTE_ARCHIVE)
    zinfo.external_attr = (mode << 16) | 0x20
    zipf.writestr(zinfo, data)

def package():
    base_dir = os.getcwd()
    dist_src = os.path.join(base_dir, 'dist')
    backend_data_src = os.path.join(base_dir, 'backend', 'data')
    pkg_dir = os.path.join(base_dir, 'standalone_staging')

    if os.path.exists(pkg_dir):
        shutil.rmtree(pkg_dir)
    os.makedirs(pkg_dir, exist_ok=True)

    # 1. Copy dist excluding any existing .zip or .map or hidden files
    pkg_dist = os.path.join(pkg_dir, 'dist')
    os.makedirs(pkg_dist, exist_ok=True)
    for root, dirs, files in os.walk(dist_src):
        for f in files:
            if f.endswith('.zip') or f.endswith('.map') or f.startswith('.'):
                continue
            src_file = os.path.join(root, f)
            rel_dir = os.path.relpath(root, dist_src)
            dest_folder = os.path.join(pkg_dist, rel_dir)
            os.makedirs(dest_folder, exist_ok=True)
            shutil.copy2(src_file, os.path.join(dest_folder, f))

    # 2. Copy backend/data
    pkg_backend_data = os.path.join(pkg_dir, 'backend', 'data')
    os.makedirs(pkg_backend_data, exist_ok=True)
    for f in os.listdir(backend_data_src):
        if f.endswith('.json'):
            shutil.copy2(os.path.join(backend_data_src, f), os.path.join(pkg_backend_data, f))

    # 3. Copy .env.example
    env_ex = os.path.join(base_dir, '.env.example')
    if os.path.exists(env_ex):
        shutil.copy2(env_ex, os.path.join(pkg_dir, '.env.example'))

    # 4. Write package.json
    prod_package_json = """{
  "name": "bis-sahayak-standalone",
  "version": "1.0.0",
  "private": true,
  "description": "BIS Sahayak - Intelligent AI Assistant for Bureau of Indian Standards",
  "scripts": {
    "start": "node dist/server.cjs"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2"
  }
}
"""
    with open(os.path.join(pkg_dir, 'package.json'), 'w', encoding='utf-8') as f:
        f.write(prod_package_json)

    # 5. Write start-windows.bat (with strict Windows CRLF line endings)
    windows_bat = """@echo off
TITLE BIS Sahayak - Standalone Prototype
COLOR 0B

echo ================================================================
echo          BIS Sahayak - AI Assistant for Indian Standards
echo               Smart India Hackathon (SIH PS26107)
echo ================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    COLOR 0C
    echo [ERROR] Node.js is required to run the local prototype!
    echo Please install Node.js (v18 or higher) from: https://nodejs.org/
    echo Once installed, double-click this file again.
    pause
    exit /b 1
)

if not exist "node_modules\\" (
    echo [INFO] First-time setup: Installing lightweight runtime dependencies...
    call npm install --omit=dev
    echo.
)

if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
    ) else (
        echo GEMINI_API_KEY=> .env
    )
)

echo [INFO] Starting BIS Sahayak Server on http://localhost:3000...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

call npm start
pause
"""
    with open(os.path.join(pkg_dir, 'start-windows.bat'), 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(windows_bat)

    # 6. Write start-linux-mac.sh
    sh_script = """#!/usr/bin/env bash
echo "================================================================"
echo "         BIS Sahayak - AI Assistant for Indian Standards        "
echo "================================================================"

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed! Please install Node.js from https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installing lightweight runtime dependencies..."
    npm install --omit=dev
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
fi

if command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open http://localhost:3000) &
elif command -v open &> /dev/null; then
    (sleep 2 && open http://localhost:3000) &
fi

echo "[INFO] Running BIS Sahayak server at http://localhost:3000..."
npm start
"""
    sh_path = os.path.join(pkg_dir, 'start-linux-mac.sh')
    with open(sh_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(sh_script)
    os.chmod(sh_path, 0o755)

    # 7. Write README.md
    readme_md = """# BIS Sahayak - Standalone Prototype (SIH PS26107)
Bureau of Indian Standards - AI-Powered Standards & Conformity Assistant

This package is a self-contained, pre-compiled standalone distribution. It can be run locally or shared directly without needing Google AI Studio.

## Quick Start:

### On Windows:
1. Extract all files from `bis-sahayak-standalone.zip`.
2. Double-click `start-windows.bat`.
3. It will install minimal runtime dependencies, launch the server, and automatically open your default browser to `http://localhost:3000`.

### On macOS / Linux:
1. Extract all files: `unzip bis-sahayak-standalone.zip`
2. Run:
```bash
chmod +x start-linux-mac.sh
./start-linux-mac.sh
```

### Manual Run:
```bash
npm install --omit=dev
npm start
```
Open `http://localhost:3000` in any web browser.

## Troubleshooting Extraction:
- **Windows Built-in Extractor**: Right-click `bis-sahayak-standalone.zip` -> select **Extract All...** -> Choose a destination folder and click **Extract**.
- **PowerShell (Terminal)**:
  `Expand-Archive -Path .\\bis-sahayak-standalone.zip -DestinationPath .\\bis-sahayak`
- **7-Zip / WinRAR**: Right click -> "Extract here" or "Extract to bis-sahayak-standalone/".
"""
    with open(os.path.join(pkg_dir, 'README.md'), 'w', encoding='utf-8', newline='\r\n') as f:
        f.write(readme_md)

    # 8. Create ZIP archive with explicit directory entries
    public_dir = os.path.join(base_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    zip_dest = os.path.join(public_dir, 'bis-sahayak-standalone.zip')

    # Collect all directories and files
    all_dirs = set()
    all_files = []

    for root, dirs, files in os.walk(pkg_dir):
        rel_root = os.path.relpath(root, pkg_dir)
        if rel_root != '.':
            all_dirs.add(rel_root.replace('\\', '/'))
        for d in dirs:
            dir_rel = os.path.relpath(os.path.join(root, d), pkg_dir).replace('\\', '/')
            all_dirs.add(dir_rel)
        for f in files:
            full_f = os.path.join(root, f)
            rel_f = os.path.relpath(full_f, pkg_dir).replace('\\', '/')
            all_files.append((full_f, rel_f))

    # Sort directories so parent dirs come first
    sorted_dirs = sorted(list(all_dirs))

    with zipfile.ZipFile(zip_dest, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # First write all directory entries
        for d in sorted_dirs:
            add_dir(zipf, d)

        # Then write files with appropriate attributes
        for full_f, rel_f in sorted(all_files, key=lambda x: x[1]):
            is_sh = rel_f.endswith('.sh')
            is_bat = rel_f.endswith('.bat')
            add_file(zipf, full_f, rel_f, is_executable=is_sh, force_crlf=is_bat)

    shutil.rmtree(pkg_dir)
    # Also copy to dist
    shutil.copy2(zip_dest, os.path.join(dist_src, 'bis-sahayak-standalone.zip'))
    print(f"Compliant ZIP package created at {zip_dest}, size: {os.path.getsize(zip_dest)} bytes")

if __name__ == '__main__':
    package()
