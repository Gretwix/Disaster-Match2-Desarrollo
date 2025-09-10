import { useNavigate } from "@tanstack/react-router";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Welcome to Disaster Match</h1>
      <button onClick={() => navigate({ to: "/Login" })} className="cursor-pointer text-blue-700">Go to Login</button>
    </div>
  );
}
