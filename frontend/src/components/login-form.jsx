import { useState } from "react"
import { useNavigate, Link } from "react-router-dom" 
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {FaFacebook } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc";

// Import the auth service
import { authService } from "@/services/authentication"

export default function LoginForm({
  className,
  ...props
}) {
  // 1. Setup State for inputs, errors, and loading status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 2. Handle standard Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authService.login(email, password);

      if (result.success) {
        // Save the token/user data and redirect to the home page
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        navigate("/");
      } else {
        setError(result.message || "Invalid email or password.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center justify-center min-h-[80vh] bg-linear-to-br from-sky-100 via-blue-50 to-sky-100 p-5 font-sans w-full", className)} {...props}>
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {/* 3. Attach handleSubmit to the form */}
            <form onSubmit={handleSubmit}>
              <FieldGroup className="flex flex-col gap-4">
                
                {/* Display API error messages */}
                {error && (
                  <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-md text-center">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  {/* 4. Bind email state to input */}
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required 
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                  {/* 5. Bind password state to input */}
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required 
                  />
                </Field>
                
                <Field className="flex flex-col gap-2 mt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  
                  {/* Visual divider */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* 6. Attach OAuth functions directly to onClick */}
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => authService.loginWithGoogle()}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FcGoogle size={20} />
                    Login with Google
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => authService.loginWithFacebook()}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <FaFacebook className="h-4 w-4 text-blue-600" />
                    Login with Facebook
                  </Button>

                  <FieldDescription className="text-center mt-4">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="underline font-medium hover:text-sky-500 transition-colors">
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}