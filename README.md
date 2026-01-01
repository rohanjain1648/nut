# Mindful Echo

**Mindful Echo** is a voice-powered mental health companion designed to help users process thoughts, meditate, and track their well-being consistency through gamification.

![Mindful Echo Hero](./public/lovable-uploads/27118204-6379-43c3-ae62-c0acc400c497.png)

## 🌟 Features

### 🎙️ Voice Companion
- **Real-time Interaction**: Talk to the AI naturally.
- **Smart Orb**: A visual voice activity indicator that reacts to speaking and listening states.

### 🧘‍♂️ Mindfulness Tools
- **Guided Meditations**: Sessions for anxiety, focus, and sleep.
- **Breathing Exercises**: Interactive Box Breathing visualizer.
- **Grounding**: 5-4-3-2-1 Senses Grounding technique.

### 🏆 Gamification & Progress (New!)
- **Streak Counter**: Track consecutive days of mindfulness.
- **Yearly Heatmap**: GitHub-style activity graph for the last 365 days.
- **Badges**: Unlock achievements like "On Fire" (3-day streak) and "Zen Master".
- **Unlockable Themes**: 
    - 🌿 **Mint**: Default
    - 🌅 **Sunset**: Unlock with 3-day streak.
    - 🌊 **Ocean**: Unlock with 7-day streak.
    - 🌌 **Cosmic**: Unlock with 30-day streak.
- **Shareable Stats**: Generate beautiful images of your streaks to share on social media.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Backend/Db**: Supabase
- **AI/Voice**: ElevenLabs, Google Gemini (integration ready)
- **State Management**: React Query

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Account

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/mindful-echo.git
    cd mindful-echo
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
    # Add other API keys as needed (Gemini, ElevenLabs)
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

## 📦 Deployment

This project is optimized for deployment on **Vercel**.

1.  Import project to Vercel.
2.  Add Environment Variables from your `.env` file.
3.  Deploy!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
*Finding peace, one voice at a time.*
