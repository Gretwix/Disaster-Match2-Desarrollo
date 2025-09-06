import { useNavigate } from "@tanstack/react-router";

export default function Register() {
    const navigate = useNavigate();
    return (

       <div>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    Login to your account
                </h2>
            <button
              type="button"
              onClick={() => navigate({ to: "/Register" })}
              className="font-medium text-indigo-700 hover:underline cursor-pointer"
            >
              Sign up
            </button>
        </div>
    )
}