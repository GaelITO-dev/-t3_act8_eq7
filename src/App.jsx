import { useState } from "react";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}