import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, LogIn, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().min(1, "Usuário é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Floating pets animation component
const FloatingPets = () => {
  const pets = ['🐶', '🐱', '🐰', '🐹', '🐦', '🐠', '🐢', '🦔'];
  const [visiblePets, setVisiblePets] = useState<Array<{id: number, emoji: string, x: number, y: number, delay: number}>>([]);

  useEffect(() => {
    const generatePet = (id: number) => ({
      id,
      emoji: pets[Math.floor(Math.random() * pets.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    });

    // Generate initial pets
    const initialPets = Array.from({ length: 6 }, (_, i) => generatePet(i));
    setVisiblePets(initialPets);

    // Add new pets periodically
    const interval = setInterval(() => {
      setVisiblePets(current => {
        const newPets = current.filter(pet => Date.now() - pet.id < 15000); // Keep pets for 15s
        if (newPets.length < 8) {
          newPets.push(generatePet(Date.now()));
        }
        return newPets;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {visiblePets.map((pet) => (
        <div
          key={pet.id}
          className="absolute text-2xl opacity-20 animate-pulse"
          style={{
            left: `${pet.x}%`,
            top: `${pet.y}%`,
            animationDelay: `${pet.delay}s`,
            animationDuration: '4s'
          }}
        >
          {pet.emoji}
        </div>
      ))}
    </div>
  );
};

// Paw prints animation component
const PawPrints = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-10 left-10 text-blue-200 dark:text-blue-800 opacity-30">
        <div className="animate-bounce" style={{ animationDelay: '0s' }}>🐾</div>
      </div>
      <div className="absolute top-32 right-20 text-purple-200 dark:text-purple-800 opacity-30">
        <div className="animate-bounce" style={{ animationDelay: '1s' }}>🐾</div>
      </div>
      <div className="absolute bottom-20 left-1/4 text-pink-200 dark:text-pink-800 opacity-30">
        <div className="animate-bounce" style={{ animationDelay: '2s' }}>🐾</div>
      </div>
      <div className="absolute bottom-32 right-10 text-green-200 dark:text-green-800 opacity-30">
        <div className="animate-bounce" style={{ animationDelay: '0.5s' }}>🐾</div>
      </div>
    </div>
  );
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin",
      password: "admin",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => login(data.email, data.password),
    onSuccess: () => {
      toast({
        title: "Login realizado!",
        description: "Bem-vindo ao Gloss Pet Dashboard.",
      });
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast({
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
    },
  });



  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animations */}
      <FloatingPets />
      <PawPrints />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-400/20 to-blue-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative mx-auto mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="text-white font-bold text-2xl flex items-center gap-1">
                <span>🐾</span>
                <span className="text-lg">PM</span>
              </div>
            </div>
            {/* Floating hearts around logo */}
            <div className="absolute -top-2 -right-2 text-pink-400 animate-bounce">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="absolute -bottom-1 -left-2 text-blue-400 animate-bounce" style={{ animationDelay: '1s' }}>
              <Star className="w-3 h-3 fill-current" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            PetManager Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
            Sistema Profissional de Gestão para Pet Shops
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
            <span>🏆</span>
            <span>Solução Completa</span>
            <span>•</span>
            <span>🎯</span>
            <span>Fácil de Usar</span>
          </div>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 ring-1 ring-white/20" data-testid="card-auth">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-center flex items-center justify-center gap-3 text-xl">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <LogIn className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Entre no Sistema
              </span>
            </CardTitle>
            <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
              <span>🔐</span>
              <span>Acesse sua conta para gerenciar o pet shop</span>
            </p>
          </CardHeader>

          <CardContent className="pb-6">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <span>👤</span>
                    <span>Usuário</span>
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    {...loginForm.register("email")}
                    data-testid="input-login-email"
                    className={`transition-all duration-200 ${
                      loginForm.formState.errors.email 
                        ? "border-red-500 focus:ring-red-200" 
                        : "focus:ring-blue-200 focus:border-blue-400"
                    }`}
                    placeholder="Digite: admin"
                  />
                  {loginForm.formState.errors.email && (
                    <span className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span>
                      {loginForm.formState.errors.email.message}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <span>🔑</span>
                    <span>Senha</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...loginForm.register("password")}
                      data-testid="input-login-password"
                      className={`transition-all duration-200 pr-12 ${
                        loginForm.formState.errors.password 
                          ? "border-red-500 focus:ring-red-200" 
                          : "focus:ring-blue-200 focus:border-blue-400"
                      }`}
                      placeholder="Digite: admin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-0 h-full px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <span className="text-sm text-red-500 flex items-center gap-1">
                      <span>⚠️</span>
                      {loginForm.formState.errors.password.message}
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loginMutation.isPending}
                  data-testid="button-login-submit"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Entrando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>🚀</span>
                      Entrar no Sistema
                    </span>
                  )}
                </Button>
              </form>
          </CardContent>

          <CardFooter className="pt-6">
            <div className="w-full text-center">
              <Separator className="mb-6" />
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-2">
                  <span>🎯</span>
                  <span>Sistema Profissional de Gestão para Pet Shops</span>
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 border border-blue-100 dark:border-gray-600">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium flex items-center justify-center gap-2">
                    <span>💡</span>
                    <span>Credenciais para teste: <strong>admin</strong> / <strong>admin</strong></span>
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2">
                  <span className="flex items-center gap-1">
                    <span>✨</span>
                    <span>Moderno</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>🛡️</span>
                    <span>Seguro</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>⚡</span>
                    <span>Rápido</span>
                  </span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}