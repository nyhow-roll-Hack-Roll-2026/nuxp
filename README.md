
# ⛏️ NUS Craft: Digital Achievements

> *"Surviving the Bell Curve, one block at an interactive time."*

**NUS Craft** is a Minecraft-themed gamified achievement system designed to track and celebrate the student journey at the National University of Singapore (NUS). From matriculation to graduation, students unlock achievements, earn XP, and collect resources in an infinite, interactive world map.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **🗺️ Infinite Achievement Map**: Explore a zoomable, pannable canvas organizing achievements into distinct biomes:
  - **General**: Spawn point and basics.
  - **Academic**: Lectures, tutorials, exams, and the Dean's List.
  - **Social**: CCAs, Hall life, and orientation.
  - **Exploration**: Campus landmarks, food spots, and hidden secrets.

- **🤝 Co-op Quests**: Invite friends to complete shared goals (e.g., *Pair Programming*, *Group Projects*). Achievements unlock only when both parties accept the invite.

- **📸 QR Scavenger Hunts**: Physical exploration meets digital rewards. Use the in-app scanner to unlock location-based achievements (e.g., visiting all faculties) by scanning unique QR codes.

- **💾 Memory & Guestbook**: Upload photos/videos as "proof" of your achievements and sign the global guestbook to leave your mark on the server history.

- **🎒 Resource Inventory**: Unlocking specific achievements grants access to useful real-world resources, such as "Senior's Stash" PDFs, Telegram bot links, and study playlists.

- **🤖 AI-Powered Lore**: Dynamic, gamified flavor text and tips powered by **Google Gemini API**.

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript), Tailwind CSS
- **Animation**: Framer Motion, CSS Keyframes (Pixel art effects)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nus-digital-achievements.git
   cd nus-digital-achievements
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file and add your Gemini API Key:
   ```env
   API_KEY=your_google_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 👥 Collaborators

This project was built with ❤️ (and caffeine) by:

*   **Tan Jo Shin**
*   **Lim Jia Tzer**
*   **Kristen Loh**
*   **Ong Yan Sheng**

## 🎮 How to Play

1. **Login**: Enter a username and select/upload a pixel-art avatar.
2. **Explore**: Drag and zoom around the map to find unlocked (colored) or locked (gray) achievements.
3. **Unlock**: Click an achievement to view requirements.
   - **Task**: Click "Complete".
   - **Scan**: Upload/Scan a QR code.
   - **Co-op**: Search for a user and send an invite.
4. **Level Up**: Earn XP to level up your profile and unlock trophies in the sidebar dashboard.

---
