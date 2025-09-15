import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, UserPlus, Mail, Phone, Calendar, MapPin, ArrowLeft, Eye, Edit, 
  FileText, Upload, History, Star, Clock, User, Globe, MessageCircle,
  VideoIcon, HeadphonesIcon, Home as HomeIcon, Package, Download
} from "lucide-react";

interface ClientProfile {
  id: string;
  fullName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeOfBirth: {
    city: string;
    state: string;
    country: string;
    timezone: string;
  };
  email: string;
  primaryPhone: string; // UID - mandatory
  currentPhone: string;
  whatsappNumber: string;
  personalNotes: string;
  consultationHistory: ConsultationRecord[];
  orderHistory: OrderRecord[];
  documents: DocumentRecord[];
  createdAt: string;
  lastUpdated: string;
}

interface ConsultationRecord {
  id: string;
  type: 'video' | 'audio' | 'chat' | 'in-person';
  date: string;
  duration: number;
  status: 'completed' | 'cancelled' | 'rescheduled';
  amount: number;
  notes: string;
}

interface OrderRecord {
  id: string;
  productName: string;
  amount: number;
  date: string;
  status: 'delivered' | 'shipped' | 'processing';
}

interface DocumentRecord {
  id: string;
  name: string;
  type: 'horoscope' | 'report' | 'certificate' | 'other';
  uploadDate: string;
  fileUrl: string;
}

export default function AdminClients() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState<Partial<ClientProfile>>({});
  const [timezones, setTimezones] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Fetch clients from API with search functionality
  const { data: clientsData, isLoading, refetch } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/clients?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
  });

  const clients = clientsData?.clients || [];

  // Fetch timezone data from API
  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const response = await fetch('/api/timezone/list');
        if (response.ok) {
          const data = await response.json();
          setTimezones(data.timezones.map((tz: any) => tz.value));
        } else {
          // Fallback to static list
          setTimezones([
            "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo",
            "Australia/Sydney", "America/Los_Angeles", "Europe/Paris", "Asia/Dubai"
          ]);
        }
      } catch (error) {
        console.error('Error fetching timezones:', error);
        // Fallback to static list
        setTimezones([
          "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo",
          "Australia/Sydney", "America/Los_Angeles", "Europe/Paris", "Asia/Dubai"
        ]);
      }
    };

    fetchTimezones();
  }, []);

  const filteredClients = clients?.filter((client: ClientProfile) => 
    client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.primaryPhone?.includes(searchTerm) ||
    client.currentPhone?.includes(searchTerm) ||
    client.placeOfBirth?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const addClientMutation = useMutation({
    mutationFn: async (clientData: Partial<ClientProfile>) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...clientData,
          phoneNumber: clientData.primaryPhone, // Map to backend field
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create client');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setShowAddClient(false);
      setNewClient({});
    }
  });

  const handleAddClient = () => {
    addClientMutation.mutate(newClient);
  };

  // Auto-detect timezone when place of birth changes
  const handlePlaceOfBirthChange = async (field: string, value: string) => {
    const updatedPlace = {
      ...newClient.placeOfBirth,
      [field]: value,
    };
    
    setNewClient({
      ...newClient,
      placeOfBirth: updatedPlace,
    });

    // Auto-detect timezone if we have city and country
    if (field === 'city' || field === 'country') {
      if (updatedPlace.city && updatedPlace.country) {
        try {
          const response = await fetch('/api/timezone/detect', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              city: updatedPlace.city,
              state: updatedPlace.state,
              country: updatedPlace.country,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.location) {
              setNewClient({
                ...newClient,
                placeOfBirth: {
                  city: data.location.city,
                  state: data.location.state,
                  country: data.location.country,
                  timezone: data.location.timezone,
                },
              });
            }
          }
        } catch (error) {
          console.error('Error detecting timezone:', error);
        }
      }
    }
  };

  const getTotalSpent = (client: any) => {
    if (!client.consultationHistory || !client.orderHistory) return 0;
    const consultationTotal = client.consultationHistory.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
    const orderTotal = client.orderHistory.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    return consultationTotal + orderTotal;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-16" data-testid="admin-clients">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/admin")}
              className="glass flex items-center space-x-2"
              data-testid="back-to-admin"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-4xl font-bold neon-text text-primary mb-2">
                Client Management
              </h1>
              <p className="text-muted-foreground">
                Comprehensive client profiles for Astrologer Arup Shastri's practice
              </p>
            </div>
          </div>
          <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
            <DialogTrigger asChild>
              <Button className="neon-button mt-4 sm:mt-0" data-testid="add-client-button">
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Client Profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={newClient.fullName || ''}
                        onChange={(e) => setNewClient({...newClient, fullName: e.target.value})}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newClient.email || ''}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newClient.dateOfBirth || ''}
                        onChange={(e) => setNewClient({...newClient, dateOfBirth: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeOfBirth">Time of Birth</Label>
                      <Input
                        id="timeOfBirth"
                        type="time"
                        value={newClient.timeOfBirth || ''}
                        onChange={(e) => setNewClient({...newClient, timeOfBirth: e.target.value})}
                        placeholder="e.g., 10:30 AM"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="primaryPhone">Primary Phone (UID) *</Label>
                      <Input
                        id="primaryPhone"
                        value={newClient.primaryPhone || ''}
                        onChange={(e) => setNewClient({...newClient, primaryPhone: e.target.value})}
                        placeholder="+91-9876543210"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentPhone">Current Phone</Label>
                      <Input
                        id="currentPhone"
                        value={newClient.currentPhone || ''}
                        onChange={(e) => setNewClient({...newClient, currentPhone: e.target.value})}
                        placeholder="+91-9876543210"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                      <Input
                        id="whatsappNumber"
                        value={newClient.whatsappNumber || ''}
                        onChange={(e) => setNewClient({...newClient, whatsappNumber: e.target.value})}
                        placeholder="+91-9876543210"
                      />
                    </div>
                  </div>
                </div>

                {/* Place of Birth */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Place of Birth</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newClient.placeOfBirth?.city || ''}
                        onChange={(e) => handlePlaceOfBirthChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={newClient.placeOfBirth?.state || ''}
                        onChange={(e) => setNewClient({
                          ...newClient, 
                          placeOfBirth: {
                            city: newClient.placeOfBirth?.city || '',
                            state: e.target.value,
                            country: newClient.placeOfBirth?.country || '',
                            timezone: newClient.placeOfBirth?.timezone || ''
                          }
                        })}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={newClient.placeOfBirth?.country || ''}
                        onChange={(e) => handlePlaceOfBirthChange('country', e.target.value)}
                        placeholder="Enter country"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={newClient.placeOfBirth?.timezone || ''}
                        onValueChange={(value) => setNewClient({
                          ...newClient, 
                          placeOfBirth: {
                            city: newClient.placeOfBirth?.city || '',
                            state: newClient.placeOfBirth?.state || '',
                            country: newClient.placeOfBirth?.country || '',
                            timezone: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detected" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Personal Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Astrologer Notes</h3>
                  <Textarea
                    value={newClient.personalNotes || ''}
                    onChange={(e) => setNewClient({...newClient, personalNotes: e.target.value})}
                    placeholder="Personal notes and observations about the client..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddClient(false)}>Cancel</Button>
                  <Button onClick={handleAddClient} disabled={addClientMutation.isPending}>
                    {addClientMutation.isPending ? 'Adding...' : 'Add Client'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients by name, email, phone, or city..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-3 py-1">
                Total Clients: {filteredClients.length}
              </Badge>
            </div>
          </div>
        </GlassCard>

        {/* Clients Grid */}
        <div className="grid gap-6">
          {filteredClients.map((client) => (
            <GlassCard key={client.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{client.fullName}</h3>
                      <p className="text-muted-foreground">{client.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Primary:</span>
                        <span className="text-sm">{client.primaryPhone}</span>
                      </div>
                      {client.whatsappNumber && (
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium">WhatsApp:</span>
                          <span className="text-sm">{client.whatsappNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">DOB:</span>
                        <span className="text-sm">{new Date(client.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Time:</span>
                        <span className="text-sm">{client.timeOfBirth}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Place:</span>
                        <span className="text-sm">{client.placeOfBirth.city}, {client.placeOfBirth.country}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Timezone:</span>
                        <span className="text-sm">{client.placeOfBirth.timezone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      {client.consultationHistory.length} Consultations
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                      ₹{getTotalSpent(client).toLocaleString()} Total Spent
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      {client.documents.length} Documents
                    </Badge>
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                      {client.orderHistory.length} Orders
                    </Badge>
                  </div>

                  {client.personalNotes && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground italic">Notes: {client.personalNotes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Client Profile: {client.fullName}</DialogTitle>
                      </DialogHeader>
                      <Tabs defaultValue="profile" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="profile">Profile</TabsTrigger>
                          <TabsTrigger value="consultations">Consultations</TabsTrigger>
                          <TabsTrigger value="orders">Orders</TabsTrigger>
                          <TabsTrigger value="documents">Documents</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="profile" className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <User className="w-5 h-5" />
                                  <span>Personal Information</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div><strong>Full Name:</strong> {client.fullName}</div>
                                <div><strong>Email:</strong> {client.email}</div>
                                <div><strong>Date of Birth:</strong> {new Date(client.dateOfBirth).toLocaleDateString()}</div>
                                <div><strong>Time of Birth:</strong> {client.timeOfBirth}</div>
                                <div><strong>Primary Phone:</strong> {client.primaryPhone}</div>
                                <div><strong>Current Phone:</strong> {client.currentPhone}</div>
                                <div><strong>WhatsApp:</strong> {client.whatsappNumber}</div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                  <MapPin className="w-5 h-5" />
                                  <span>Birth Location</span>
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div><strong>City:</strong> {client.placeOfBirth.city}</div>
                                <div><strong>State:</strong> {client.placeOfBirth.state}</div>
                                <div><strong>Country:</strong> {client.placeOfBirth.country}</div>
                                <div><strong>Timezone:</strong> {client.placeOfBirth.timezone}</div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {client.personalNotes && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Astrologer Notes</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p>{client.personalNotes}</p>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="consultations" className="space-y-4">
                          {client.consultationHistory.map((consultation) => (
                            <Card key={consultation.id}>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    {consultation.type === 'video' && <VideoIcon className="w-5 h-5 text-blue-500" />}
                                    {consultation.type === 'audio' && <HeadphonesIcon className="w-5 h-5 text-green-500" />}
                                    {consultation.type === 'chat' && <MessageCircle className="w-5 h-5 text-purple-500" />}
                                    {consultation.type === 'in-person' && <HomeIcon className="w-5 h-5 text-orange-500" />}
                                    <span className="font-medium capitalize">{consultation.type} Consultation</span>
                                  </div>
                                  <Badge variant={consultation.status === 'completed' ? 'default' : 'outline'}>
                                    {consultation.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div><strong>Date:</strong> {new Date(consultation.date).toLocaleDateString()}</div>
                                  <div><strong>Duration:</strong> {consultation.duration} minutes</div>
                                  <div><strong>Amount:</strong> ₹{consultation.amount}</div>
                                </div>
                                {consultation.notes && (
                                  <p className="mt-3 text-sm text-muted-foreground italic">{consultation.notes}</p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>
                        
                        <TabsContent value="orders" className="space-y-4">
                          {client.orderHistory.map((order) => (
                            <Card key={order.id}>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <Package className="w-5 h-5 text-green-500" />
                                    <span className="font-medium">{order.productName}</span>
                                  </div>
                                  <Badge variant={order.status === 'delivered' ? 'default' : 'outline'}>
                                    {order.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div><strong>Amount:</strong> ₹{order.amount}</div>
                                  <div><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </TabsContent>
                        
                        <TabsContent value="documents" className="space-y-4">
                          {client.documents.map((document) => (
                            <Card key={document.id}>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <div>
                                      <div className="font-medium">{document.name}</div>
                                      <div className="text-sm text-muted-foreground capitalize">{document.type}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(document.uploadDate).toLocaleDateString()}
                                    </span>
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          
                          <Card className="border-dashed">
                            <CardContent className="p-6 text-center">
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">Upload new documents</p>
                              <Button variant="outline" className="mt-2">
                                <Upload className="w-4 h-4 mr-2" />
                                Choose Files
                              </Button>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <GlassCard className="p-12 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Start by adding your first client profile.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddClient(true)} className="neon-button">
                <UserPlus className="w-4 h-4 mr-2" />
                Add First Client
              </Button>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}