# 🎮 Nexus Tic-Tac-Toe

A modern, responsive, neon glassmorphism Tic-Tac-Toe web application built with vanilla HTML5, CSS3, and modern JavaScript.

![Nexus Tic-Tac-Toe Preview](preview.png)

## ✨ Features

- **2 Game Modes**:
  - **Vs AI Bot**: Single player against an adaptive computer opponent.
  - **2 Players**: Pass-and-play local multiplayer on the same device.
- **3 AI Difficulty Levels**:
  - **Easy**: Casual play with mostly random moves.
  - **Medium**: Blocks player winning moves and seizes opportunities.
  - **Unbeatable (Minimax ⚡)**: Employs the minimax game theory algorithm; mathematically impossible to defeat!
- **Rich Aesthetics & Animations**:
  - Dark cyberpunk glassmorphism UI with ambient glowing orbs.
  - Radiant neon icons for Player X (Cyan) and Player O (Pink).
  - SVG dynamic animated strike-through winning line.
  - Confetti burst celebration on victory via HTML5 Canvas.
- **Synthesized Sound Effects**: Built with the native Web Audio API — zero external mp3 files required, complete with a mute/unmute toggle.
- **Persistent Scoreboard**: Stores your match history (X wins, O wins, Ties) in browser `localStorage`.
- **Full Accessibility**: Keyboard navigability (`Tab` to navigate, `Enter`/`Space` to move), high-contrast labels, and screen reader labels.

---

## 🚀 How to Run Locally

1. Open the [index.html](file:///c:/Users/Shashidhar%20R/OneDrive/Desktop/MILANA/tic-tac-toe/index.html) file directly in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, use VS Code's **Live Server** extension or run a local static server:
   ```bash
   npx serve .
   ```

---

## 📦 How to Push to GitHub

### Option A: Using the Command Line (Git Bash / PowerShell)

1. Open your terminal in the `tic-tac-toe` directory:
   ```bash
   cd "c:\Users\Shashidhar R\OneDrive\Desktop\MILANA\tic-tac-toe"
   ```
2. Initialize Git (already done if set up):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nexus Tic-Tac-Toe web game"
   ```
3. Create a new repository on [GitHub](https://github.com/new).
4. Link your remote and push:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Option B: Using GitHub Desktop

1. Open **GitHub Desktop**.
2. Click **File** -> **Add Local Repository...**.
3. Choose the `tic-tac-toe` folder: `c:\Users\Shashidhar R\OneDrive\Desktop\MILANA\tic-tac-toe`.
4. Click **Publish repository** to push it directly to your GitHub account!

---

## 🌐 Deploy Free with GitHub Pages

Once your code is on GitHub, you can play your game online from any phone or computer:
1. Go to your repository on GitHub.
2. Click **Settings** -> **Pages**.
3. Under **Branch**, select `main` and root `/`, then click **Save**.
4. In ~1 minute, GitHub will give you a public live URL (e.g., `https://your-username.github.io/your-repo/`)!
