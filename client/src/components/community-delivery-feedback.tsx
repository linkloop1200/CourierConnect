import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Star, ThumbsUp, ThumbsDown, Flag, Award, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FeedbackItem {
  id: string;
  deliveryId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  driverId: number;
  driverName: string;
  rating: number;
  comment: string;
  category: 'speed' | 'communication' | 'handling' | 'professionalism' | 'overall';
  isPublic: boolean;
  helpful: number;
  notHelpful: number;
  userVote?: 'helpful' | 'not_helpful';
  createdAt: Date;
  verified: boolean;
  tags: string[];
}

interface DriverStats {
  driverId: number;
  driverName: string;
  averageRating: number;
  totalReviews: number;
  categories: {
    speed: number;
    communication: number;
    handling: number;
    professionalism: number;
  };
  recentTrend: 'up' | 'down' | 'stable';
  badges: string[];
}

export default function CommunityDeliveryFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [driverStats, setDriverStats] = useState<DriverStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');
  const [showForm, setShowForm] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    deliveryId: 0,
    driverId: 0,
    rating: 5,
    comment: '',
    category: 'overall' as const,
    isPublic: true,
    tags: [] as string[]
  });

  const { toast } = useToast();

  // Initialize mock data
  useEffect(() => {
    const mockFeedback: FeedbackItem[] = [
      {
        id: 'fb-001',
        deliveryId: 1,
        userId: 1,
        userName: 'Anna de Vries',
        driverId: 1,
        driverName: 'Jan Vermeer',
        rating: 5,
        comment: 'Fantastische service! Pakket werd snel en veilig bezorgd. De chauffeur was zeer vriendelijk en professioneel.',
        category: 'overall',
        isPublic: true,
        helpful: 12,
        notHelpful: 1,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        verified: true,
        tags: ['snel', 'vriendelijk', 'professioneel']
      },
      {
        id: 'fb-002',
        deliveryId: 2,
        userId: 2,
        userName: 'Pieter Jansen',
        driverId: 2,
        driverName: 'Maria Santos',
        rating: 4,
        comment: 'Goed op tijd, maar pakket was een beetje beschadigd. Chauffeur heeft het wel netjes gemeld.',
        category: 'handling',
        isPublic: true,
        helpful: 8,
        notHelpful: 3,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        verified: true,
        tags: ['op-tijd', 'beschadigd', 'eerlijk']
      },
      {
        id: 'fb-003',
        deliveryId: 3,
        userId: 3,
        userName: 'Lisa Chen',
        driverId: 1,
        driverName: 'Jan Vermeer',
        rating: 5,
        comment: 'Uitstekende communicatie! Kreeg updates via de app en chauffeur belde toen hij in de buurt was.',
        category: 'communication',
        isPublic: true,
        helpful: 15,
        notHelpful: 0,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        verified: true,
        tags: ['communicatie', 'updates', 'betrouwbaar']
      }
    ];

    const mockDriverStats: DriverStats[] = [
      {
        driverId: 1,
        driverName: 'Jan Vermeer',
        averageRating: 4.8,
        totalReviews: 156,
        categories: {
          speed: 4.7,
          communication: 4.9,
          handling: 4.6,
          professionalism: 4.8
        },
        recentTrend: 'up',
        badges: ['Top Performer', 'Customer Favorite', 'Speed Champion']
      },
      {
        driverId: 2,
        driverName: 'Maria Santos',
        averageRating: 4.5,
        totalReviews: 89,
        categories: {
          speed: 4.4,
          communication: 4.3,
          handling: 4.2,
          professionalism: 4.6
        },
        recentTrend: 'stable',
        badges: ['Reliable Driver', 'Professional']
      }
    ];

    setFeedback(mockFeedback);
    setDriverStats(mockDriverStats);
  }, []);

  const submitFeedback = useMutation({
    mutationFn: async (data: typeof newFeedback) => {
      return apiRequest('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback verzonden",
        description: "Bedankt voor je feedback! Het helpt onze community.",
      });
      setShowForm(false);
      setNewFeedback({
        deliveryId: 0,
        driverId: 0,
        rating: 5,
        comment: '',
        category: 'overall',
        isPublic: true,
        tags: []
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    },
  });

  const voteOnFeedback = useMutation({
    mutationFn: async ({ feedbackId, vote }: { feedbackId: string, vote: 'helpful' | 'not_helpful' }) => {
      return apiRequest(`/api/feedback/${feedbackId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ vote }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
    },
  });

  const handleVote = (feedbackId: string, vote: 'helpful' | 'not_helpful') => {
    setFeedback(prev => prev.map(item => {
      if (item.id === feedbackId) {
        const newItem = { ...item };
        if (item.userVote === vote) {
          // Remove vote
          if (vote === 'helpful') newItem.helpful--;
          else newItem.notHelpful--;
          newItem.userVote = undefined;
        } else {
          // Add or change vote
          if (item.userVote === 'helpful') newItem.helpful--;
          else if (item.userVote === 'not_helpful') newItem.notHelpful--;
          
          if (vote === 'helpful') newItem.helpful++;
          else newItem.notHelpful++;
          newItem.userVote = vote;
        }
        return newItem;
      }
      return item;
    }));
    
    voteOnFeedback.mutate({ feedbackId, vote });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full"></div>;
    }
  };

  const filteredFeedback = feedback
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'rating':
          return b.rating - a.rating;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <span>Community Delivery Feedback</span>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Annuleren' : 'Feedback Geven'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{feedback.length}</div>
              <div className="text-sm text-gray-600">Totaal reviews</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getRatingColor(averageRating)}`}>
                {averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Gemiddelde rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {feedback.filter(f => f.verified).length}
              </div>
              <div className="text-sm text-gray-600">Geverifieerd</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{driverStats.length}</div>
              <div className="text-sm text-gray-600">Actieve chauffeurs</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                <SelectItem value="speed">Snelheid</SelectItem>
                <SelectItem value="communication">Communicatie</SelectItem>
                <SelectItem value="handling">Behandeling</SelectItem>
                <SelectItem value="professionalism">Professionaliteit</SelectItem>
                <SelectItem value="overall">Algemeen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sorteer op" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Meest recent</SelectItem>
                <SelectItem value="helpful">Meest behulpzaam</SelectItem>
                <SelectItem value="rating">Hoogste rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* New Feedback Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bezorging ID</label>
                <input
                  type="number"
                  value={newFeedback.deliveryId}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, deliveryId: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded"
                  placeholder="Bijv. 123"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Categorie</label>
                <Select
                  value={newFeedback.category}
                  onValueChange={(value: any) => setNewFeedback(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overall">Algemeen</SelectItem>
                    <SelectItem value="speed">Snelheid</SelectItem>
                    <SelectItem value="communication">Communicatie</SelectItem>
                    <SelectItem value="handling">Behandeling</SelectItem>
                    <SelectItem value="professionalism">Professionaliteit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                    className={`p-1 ${star <= newFeedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Commentaar</label>
              <Textarea
                value={newFeedback.comment}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Vertel over je ervaring..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newFeedback.isPublic}
                onChange={(e) => setNewFeedback(prev => ({ ...prev, isPublic: e.target.checked }))}
              />
              <label className="text-sm">Maak publiek zichtbaar voor anderen</label>
            </div>

            <Button 
              onClick={() => submitFeedback.mutate(newFeedback)}
              disabled={submitFeedback.isPending || !newFeedback.comment.trim()}
            >
              {submitFeedback.isPending ? 'Verzenden...' : 'Feedback Verzenden'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Driver Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Chauffeur Prestaties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {driverStats.map(driver => (
              <div key={driver.driverId} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{driver.driverName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{driver.driverName}</h4>
                      <div className="flex items-center space-x-2">
                        <div className={`text-lg font-bold ${getRatingColor(driver.averageRating)}`}>
                          {driver.averageRating.toFixed(1)}
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= driver.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({driver.totalReviews} reviews)</span>
                        {getTrendIcon(driver.recentTrend)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {driver.badges.map(badge => (
                      <Badge key={badge} className="bg-blue-100 text-blue-800 text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm">
                  {Object.entries(driver.categories).map(([category, rating]) => (
                    <div key={category} className="text-center">
                      <div className={`font-medium ${getRatingColor(rating)}`}>
                        {rating.toFixed(1)}
                      </div>
                      <div className="text-gray-600 capitalize text-xs">
                        {category === 'speed' ? 'Snelheid' :
                         category === 'communication' ? 'Communicatie' :
                         category === 'handling' ? 'Behandeling' :
                         'Professionaliteit'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map(item => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{item.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{item.userName}</h4>
                      {item.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Geverifieerd
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      Chauffeur: {item.driverName} • {item.createdAt.toLocaleDateString('nl-NL')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.category === 'overall' ? 'Algemeen' :
                     item.category === 'speed' ? 'Snelheid' :
                     item.category === 'communication' ? 'Communicatie' :
                     item.category === 'handling' ? 'Behandeling' :
                     'Professionaliteit'}
                  </Badge>
                </div>
              </div>

              <p className="text-gray-700 mb-3">{item.comment}</p>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(item.id, 'helpful')}
                    className={`flex items-center space-x-1 text-sm ${
                      item.userVote === 'helpful' ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{item.helpful}</span>
                  </button>
                  
                  <button
                    onClick={() => handleVote(item.id, 'not_helpful')}
                    className={`flex items-center space-x-1 text-sm ${
                      item.userVote === 'not_helpful' ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{item.notHelpful}</span>
                  </button>
                </div>

                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4 mr-1" />
                  Rapporteer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}