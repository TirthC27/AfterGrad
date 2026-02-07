"""
AfterGrad — Single-Command Launcher
====================================
Builds both React frontends, then starts FastAPI on port 8001.

Usage:
    py run.py              # build + start (default)
    py run.py --skip-build # start server only (if already built)
    py run.py --port 3000  # use a custom port

Endpoints after launch:
    http://localhost:8001/          → Student Dashboard
    http://localhost:8001/alumni/   → Alumni Dashboard
    http://localhost:8001/api/      → REST API
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STUDENT_FE = ROOT / "frontend" / "student_frontend"
ALUMNI_FE = ROOT / "frontend" / "alumni_frontend"
BACKEND = ROOT / "backend" / "student_backend"


def run_cmd(cmd: list[str], cwd: Path, label: str):
    """Run a command and stream output. Exit on failure."""
    print(f"\n{'='*50}")
    print(f"  {label}")
    print(f"{'='*50}")
    result = subprocess.run(cmd, cwd=str(cwd), shell=True)
    if result.returncode != 0:
        print(f"\n❌ {label} failed (exit code {result.returncode})")
        sys.exit(1)
    print(f"✅ {label} done")


def install_deps(fe_dir: Path, name: str):
    """Install npm deps if node_modules is missing."""
    if not (fe_dir / "node_modules").is_dir():
        run_cmd(["npm", "install"], fe_dir, f"Installing {name} dependencies")


def build_frontend(fe_dir: Path, name: str):
    """Build a Vite-based React frontend."""
    install_deps(fe_dir, name)
    run_cmd(["npm", "run", "build"], fe_dir, f"Building {name}")


def main():
    parser = argparse.ArgumentParser(description="AfterGrad Launcher")
    parser.add_argument("--skip-build", action="store_true", help="Skip frontend builds")
    parser.add_argument("--port", type=int, default=8001, help="Server port (default: 8001)")
    args = parser.parse_args()

    # ── Build frontends ──────────────────────────────────────────────
    if not args.skip_build:
        print("\n🔨 Building both frontends...\n")
        build_frontend(STUDENT_FE, "Student Frontend")
        build_frontend(ALUMNI_FE, "Alumni Frontend")
    else:
        # Verify dist folders exist
        for fe, name in [(STUDENT_FE, "Student"), (ALUMNI_FE, "Alumni")]:
            if not (fe / "dist").is_dir():
                print(f"❌ {name} frontend not built yet. Run without --skip-build first.")
                sys.exit(1)

    # ── Start server ─────────────────────────────────────────────────
    print(f"\n{'='*50}")
    print(f"  🚀 Starting AfterGrad on port {args.port}")
    print(f"{'='*50}")
    print(f"\n  Student Dashboard  →  http://localhost:{args.port}/")
    print(f"  Alumni  Dashboard  →  http://localhost:{args.port}/alumni/")
    print(f"  REST API           →  http://localhost:{args.port}/api/health")
    print(f"\n  Press Ctrl+C to stop\n")

    os.chdir(str(BACKEND))
    subprocess.run(
        [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(args.port), "--reload"],
        cwd=str(BACKEND),
    )


if __name__ == "__main__":
    main()
