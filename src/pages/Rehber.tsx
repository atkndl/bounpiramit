import { useState } from "react";
import { Search, Users, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Rehber() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - this would come from Supabase in a real implementation
  const contacts = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      email: "ahmet.yilmaz@boun.edu.tr",
      department: "Bilgisayar Mühendisliği",
      year: 3,
      phone: "+90 555 123 4567"
    },
    {
      id: 2,
      name: "Elif Kaya",
      email: "elif.kaya@boun.edu.tr",
      department: "İşletme",
      year: 2,
      phone: "+90 555 987 6543"
    },
    {
      id: 3,
      name: "Mehmet Demir",
      email: "mehmet.demir@boun.edu.tr",
      department: "Makine Mühendisliği",
      year: 4,
      phone: "+90 555 456 7890"
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Öğrenci Rehberi</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="İsim veya bölüm ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{contact.name}</CardTitle>
                <Badge variant="secondary">{contact.year}. Sınıf</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{contact.department}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Mesaj Gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sonuç bulunamadı</h3>
          <p className="text-muted-foreground">Arama kriterlerinize uygun öğrenci bulunamadı.</p>
        </div>
      )}
    </div>
  );
}