# 🎙️ Audiotex

Audiotex is a modern **AI-powered transcription app** built with **React (Vite)** and **TailwindCSS**, featuring **real-time speech-to-text streaming** with [AssemblyAI](https://www.assemblyai.com/) and **authentication with Supabase**.  
It lets you record audio, upload files, and manage transcription history securely.

---

## 🔗 Live Preview

[Try Audiotex ](https://audiotex-kappa.vercel.app/) 

---

## ✨ Features
- 🔐 **Authentication** – User login, signup, and password reset (via Supabase Auth).  
- 🎤 **Live Recording** – Stream microphone input to AssemblyAI in real time.  
- 📂 **File Upload** – Upload audio files for transcription.  
- 📝 **History Management** – Save, edit, and delete past transcriptions.  
- 🎨 **Modern UI** – Styled with TailwindCSS, responsive, and user-friendly.  
- 🔒 **Protected Routes** – Private pages accessible only after login.  

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS  
- **Auth & DB**: Supabase  
- **Transcription API**: AssemblyAI  
- **Deployment**: Vercel  

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/audiotex.git
cd audiotex
2. Install dependencies
npm install

3. Set up environment variables
Create a .env file in the root directory with:
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_ASSEMBLYAI_API_KEY=your-assemblyai-api-key

4. Start the dev server
npm run dev

📜 Scripts

npm run dev – Start dev server

npm run build – Build for production

npm run preview – Preview production build

npm run lint – Run linter

📦 Deployment
This project is deployed on Vercel. Make sure to set your environment variables in the Vercel dashboard.

🤝 Contributing
Contributions are welcome!

Fork the repo

Create a new branch (feature/my-feature)

Commit changes

Open a PR

📄 License
This project is licensed under the MIT License.

👨‍💻 Author
Built by Vikas Pawar ✨
