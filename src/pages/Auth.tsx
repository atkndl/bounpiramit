import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, UserPlus, LogIn, Mail, Shield } from 'lucide-react';

export default function Auth() {
  const { user, signIn, signUp, resetPassword, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      setIsSubmitting(false);
      return;
    }

    if (!email.endsWith('@std.bogazici.edu.tr')) {
      alert('Sadece @std.bogazici.edu.tr uzantılı e-posta adresleri kabul edilir.');
      setIsSubmitting(false);
      return;
    }

    await signUp(email, password, fullName);
    setIsSubmitting(false);
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn(email, password);
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    await resetPassword(email);
    setIsSubmitting(false);
    setShowForgotPassword(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-light">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-light p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Boğaziçi Piramit</h1>
          <p className="text-white/80">Öğrenci topluluğuna hoş geldiniz</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Hesap</CardTitle>
            <CardDescription className="text-center">
              Giriş yapın veya yeni hesap oluşturun
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Giriş
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Kayıt
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">E-posta Adresiniz</Label>
                      <Input
                        id="reset-email"
                        name="email"
                        type="email"
                        placeholder="ornek@std.bogazici.edu.tr"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {isSubmitting ? 'Gönderiliyor...' : 'Şifre Sıfırla'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowForgotPassword(false)}
                        disabled={isSubmitting}
                      >
                        İptal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ornek@std.bogazici.edu.tr"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifre</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Şifrenizi girin"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-primary"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Şifremi Unuttum
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </Button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Ad Soyad</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Ad Soyadınızı girin"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta (@std.bogazici.edu.tr)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ornek@std.bogazici.edu.tr"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Güçlü bir şifre oluşturun"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Şifrenizi tekrar girin"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-white/80">
            <Shield className="w-4 h-4" />
            <span>
              Tüm kişisel verileriniz <strong>Supabase</strong> güvencesi ile korunmakta ve 
              3. şahıslar tarafından erişilemez durumdadır.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}