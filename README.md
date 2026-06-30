# Connect.Fitness 🏋️‍♂️✨
> **The Premium Aesthetic Workout Planner & Brand Integration Platform**

Welcome to **Connect.Fitness**, a premium, state-of-the-art fitness companion designed to help athletes achieve their dream aesthetic while offering a powerful partnership space for fitness brands, coaches, and supplement lines. 

Built with **Next.js**, **TypeScript**, and **Capacitor**, Connect.Fitness features high-fidelity visual trackers, dynamic nutrition calculation engines, and a gorgeous **interactive 3D smartphone mockup showcase** designed to pitch brand features directly in-app.

---

## 📱 Project Overview

Connect.Fitness is engineered for visual elegance and precise metric tracking. Grounded in the bodybuilding principles of aesthetic splits (like the *Xivi Aesthetic Blueprint*), it enables users to track weight, monitor nutrition ratios, log active workouts, and view target muscle engagement dynamically.

---

## ✨ Core Features

### 🏠 1. Premium Dashboard
* **Dynamic Calorie Progression**: Watch your daily caloric rings fill up in real-time as you log meals.
* **Golden Ratio Calculator (BWR)**: Log your height and weight to calculate and monitor your Body-Weight-Ratio (BWR) progress.
* **Daily Split Overview**: Instantly view what muscles are scheduled for target stimulation today.

### 🏋️ 2. Hypertrophy Workout Tracker
* **Real-time Logging**: Easily mark off active sets, weights, and reps during your workout session.
* **Hypertrophy Focus**: Adjust routine difficulties (*Easy*, *Intermediate*, *Hard*) on the fly to match your training capacity.
* **History Logs**: Seamlessly persist all logged workouts with details saved under history states.

### 🧍 3. Interactive Body Mapping
* **Muscle Visualizer**: Highlights target muscle groups (e.g. Pectorals, Latissimus Dorsi, Triceps) on a virtual body map depending on the active exercise.
* **Visual Guides**: Helps beginners and advanced lifters focus on the correct muscle hypertrophy zones.

### 🥗 4. Dynamic Nutrition Engine
* **Macro Ratio Tracking**: Shows precise breakdowns for Proteins, Carbohydrates, and Fats with visual color bars.
* **Cooking Method Factor**: Log meals (e.g., Chicken Breast, eggs) and choose cooking methods like *Grilled* or *Fried* to automatically recalculate fat and calorie adjustments.

### 🎥 5. 3D Brand Pitch Video Page
* **CSS 3D Device Mockup**: Features an interactive, bezel-less smartphone floating in 3D space with real physics-based rotation.
* **Narrated Presentation Timeline**: An auto-playing cinematic slide sequence showing the app's features in real-time with subtitles.
* **3D Orbit Mode**: Pause the video timeline to rotate the device in 3D with your mouse and interact with active screens live inside the phone mockups!
* **Brand Sponsorship Card Slides**: Visual highlights demonstrating opportunities for sponsors to integrate custom workout routines, product sales links, and supplement guides.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16** | Core full-stack web application structure (App Router) |
| **TypeScript** | Strict static type checking for reliable state mutations |
| **Vanilla CSS** | Fully-custom premium glassmorphism styling, radial glows, and typography |
| **Capacitor 8** | Native Android integration wrappers (compiles into `SaadWorkout.apk`) |
| **Playwright** | Automated browser frame capturing |
| **OpenCV (cv2)** | Compiles captured screenshots into smooth MP4 videos |

---

## 🚀 Local Development Setup

To run the Next.js web application locally:

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed on your system.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the app. Navigate to `/pitch` or click **Brand Pitch Video** in the sidebar navigation to view the 3D brand presentation.

---

## 📹 Automated Video Render Instructions

Connect.Fitness includes a customized Python script to compile the web-based 3D presentation into a high-quality, frame-accurate `.mp4` video.

### 1. Install Python Requirements
Ensure you have Python installed, then verify your packages:
```bash
pip install opencv-python-headless numpy playwright
playwright install chromium
```

### 2. Run the Render Script
With the project open, execute:
```bash
python generate_pitch_video.py
```
* **How it works**: The script starts the Next.js dev server, launches a headless Chromium browser, steps through the 900 frames of the pitch presentation sequentially, takes PNG snapshots of each frame, and outputs a smooth 30 FPS Full HD video named `brand_pitch_presentation.mp4` to your workspace root.

---

## 🤖 Mobile Build & Deployment (Capacitor)

Connect.Fitness is optimized for Android devices using Capacitor.

1. **Build the production bundle**:
   ```bash
   npm run build
   ```
2. **Sync the files to the Android project**:
   ```bash
   npx cap sync
   ```
3. **Open in Android Studio to run/compile the APK**:
   ```bash
   npx cap open android
   ```
   *Compile output generates the native package: `SaadWorkout.apk`.*
