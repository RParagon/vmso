import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { scheduledTasks } from './services/scheduledTasks'

// Initialize scheduled tasks
scheduledTasks.init();

createRoot(document.getElementById("root")!).render(<App />);
