import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "../lib/auth";
import { Settings, User, Lock, Bell, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Breadcrumb } from "@/components/breadcrumb";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        </div>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 space-y-2">
            <Card className="shadow-sm border-2 p-2">
              <TabsList className="flex flex-col md:h-auto p-0 bg-transparent space-y-1">
                <TabsTrigger 
                  value="account" 
                  className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <User className="h-4 w-4 mr-2" />
                  Akun
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Kata Sandi
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifikasi
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="w-full justify-start px-3 py-2 h-9 font-normal data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Privasi
                </TabsTrigger>
              </TabsList>
            </Card>
          </div>
          
          <div className="flex-1">
            <TabsContent value="account" className="mt-0">
              <Card className="shadow-sm border-2">
                <CardHeader className="bg-muted/10">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Informasi Akun
                  </CardTitle>
                  <CardDescription>
                    Ubah informasi akun Anda di sini.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama</Label>
                    <Input id="name" defaultValue={user.name || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Email tidak dapat diubah.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Peran</Label>
                    <Input id="role" defaultValue={user.role} disabled />
                    <p className="text-xs text-muted-foreground">
                      Peran tidak dapat diubah.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/5 px-6 py-4 border-t">
                  <Button>Simpan Perubahan</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="password" className="mt-0">
              <Card className="shadow-sm border-2">
                <CardHeader className="bg-muted/10">
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2 text-primary" />
                    Ubah Kata Sandi
                  </CardTitle>
                  <CardDescription>
                    Ubah kata sandi Anda untuk keamanan akun.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Kata Sandi Baru</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Konfirmasi Kata Sandi</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/5 px-6 py-4 border-t">
                  <Button>Ubah Kata Sandi</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <Card className="shadow-sm border-2">
                <CardHeader className="bg-muted/10">
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-primary" />
                    Pengaturan Notifikasi
                  </CardTitle>
                  <CardDescription>
                    Atur preferensi notifikasi Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifikasi</Label>
                        <p className="text-sm text-muted-foreground">
                          Terima notifikasi melalui email.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Pengingat Penilaian</Label>
                        <p className="text-sm text-muted-foreground">
                          Dapatkan pengingat untuk penilaian yang belum selesai.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Pembaruan Sistem</Label>
                        <p className="text-sm text-muted-foreground">
                          Dapatkan informasi tentang pembaruan sistem.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/5 px-6 py-4 border-t">
                  <Button>Simpan Preferensi</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-0">
              <Card className="shadow-sm border-2">
                <CardHeader className="bg-muted/10">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Privasi dan Keamanan
                  </CardTitle>
                  <CardDescription>
                    Kelola pengaturan privasi dan keamanan akun Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Verifikasi Dua Langkah</Label>
                        <p className="text-sm text-muted-foreground">
                          Aktifkan verifikasi dua langkah untuk keamanan tambahan.
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Aktivitas Login</Label>
                        <p className="text-sm text-muted-foreground">
                          Dapatkan notifikasi saat ada login baru ke akun Anda.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/5 px-6 py-4 border-t">
                  <Button>Simpan Pengaturan</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
