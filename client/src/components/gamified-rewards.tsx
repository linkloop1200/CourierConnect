import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, Gift, Zap, Target, Award, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'discount' | 'freeDelivery' | 'priority' | 'upgrade';
  value: string;
  available: boolean;
}

interface UserStats {
  totalPoints: number;
  level: number;
  deliveriesCompleted: number;
  streak: number;
  rank: number;
  nextLevelProgress: number;
}

export default function GamifiedRewards() {
  const [selectedTab, setSelectedTab] = useState("achievements");

  // Mock user stats
  const userStats: UserStats = {
    totalPoints: 1250,
    level: 8,
    deliveriesCompleted: 47,
    streak: 12,
    rank: 156,
    nextLevelProgress: 65
  };

  const achievements: Achievement[] = [
    {
      id: "first_delivery",
      title: "Eerste Bezorging",
      description: "Verstuur je eerste pakket",
      icon: <Gift className="h-6 w-6" />,
      points: 50,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      rarity: 'common'
    },
    {
      id: "speed_demon", 
      title: "Snelheidsduivel",
      description: "5 bezorgingen binnen 1 uur",
      icon: <Zap className="h-6 w-6" />,
      points: 200,
      unlocked: true,
      progress: 5,
      maxProgress: 5,
      rarity: 'rare'
    },
    {
      id: "streak_master",
      title: "Streak Master",
      description: "10 dagen achtereen bestellen",
      icon: <Target className="h-6 w-6" />,
      points: 300,
      unlocked: false,
      progress: 7,
      maxProgress: 10,
      rarity: 'epic'
    },
    {
      id: "eco_warrior",
      title: "Eco Krijger",
      description: "25 groene bezorgingen",
      icon: <Award className="h-6 w-6" />,
      points: 500,
      unlocked: false,
      progress: 18,
      maxProgress: 25,
      rarity: 'epic'
    },
    {
      id: "vip_customer",
      title: "VIP Klant",
      description: "100 succesvolle bezorgingen",
      icon: <Trophy className="h-6 w-6" />,
      points: 1000,
      unlocked: false,
      progress: 47,
      maxProgress: 100,
      rarity: 'legendary'
    }
  ];

  const rewards: Reward[] = [
    {
      id: "discount_10",
      title: "10% Korting",
      description: "10% korting op je volgende bezorging",
      cost: 200,
      type: 'discount',
      value: '10%',
      available: true
    },
    {
      id: "free_delivery",
      title: "Gratis Bezorging",
      description: "Eén gratis bezorging binnen Amsterdam",
      cost: 350,
      type: 'freeDelivery',
      value: 'Gratis',
      available: true
    },
    {
      id: "priority_delivery",
      title: "Priority Bezorging",
      description: "Je pakket krijgt voorrang",
      cost: 150,
      type: 'priority',
      value: 'Priority',
      available: true
    },
    {
      id: "express_upgrade",
      title: "Express Upgrade",
      description: "Gratis upgrade naar express bezorging",
      cost: 500,
      type: 'upgrade',
      value: 'Express',
      available: false
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Gewoon';
      case 'rare': return 'Zeldzaam';
      case 'epic': return 'Episch';
      case 'legendary': return 'Legendarisch';
      default: return 'Gewoon';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return '💰';
      case 'freeDelivery': return '🚚';
      case 'priority': return '⚡';
      case 'upgrade': return '⭐';
      default: return '🎁';
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>Jouw Prestaties</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 mx-auto bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {userStats.level}
                </div>
                <Badge className="absolute -top-2 -right-2 bg-yellow-500">
                  Level
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">Niveau</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-brand-blue">{userStats.totalPoints}</p>
              <p className="text-sm text-gray-600">Punten</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{userStats.deliveriesCompleted}</p>
              <p className="text-sm text-gray-600">Bezorgingen</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">#{userStats.rank}</p>
              <p className="text-sm text-gray-600">Ranglijst</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Voortgang naar niveau {userStats.level + 1}</span>
              <span className="text-sm text-gray-600">{userStats.nextLevelProgress}%</span>
            </div>
            <Progress value={userStats.nextLevelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Prestaties</TabsTrigger>
          <TabsTrigger value="rewards">Beloningen</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranglijst</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Prestaties & Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`border rounded-lg p-4 ${
                      achievement.unlocked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${
                          achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${getRarityColor(achievement.rarity)} text-white mb-2`}>
                          {getRarityText(achievement.rarity)}
                        </Badge>
                        <p className="text-sm font-medium">+{achievement.points} punten</p>
                      </div>
                    </div>

                    {!achievement.unlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Voortgang</span>
                          <span className="text-xs text-gray-600">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gift className="h-5 w-5" />
                  <span>Punten Winkel</span>
                </div>
                <Badge variant="outline" className="text-brand-blue">
                  {userStats.totalPoints} punten beschikbaar
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id}
                    className={`border rounded-lg p-4 ${
                      reward.available && userStats.totalPoints >= reward.cost
                        ? 'border-brand-blue'
                        : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {getTypeIcon(reward.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{reward.title}</h3>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-brand-blue">
                          {reward.cost} punten
                        </p>
                        <Button
                          size="sm"
                          disabled={!reward.available || userStats.totalPoints < reward.cost}
                          className="mt-2"
                        >
                          {userStats.totalPoints < reward.cost ? 'Te weinig punten' : 'Inwisselen'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Maandelijkse Ranglijst</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Emma de Vries", points: 2850, avatar: "👩" },
                  { rank: 2, name: "Jan Bakker", points: 2720, avatar: "👨" },
                  { rank: 3, name: "Lisa Chen", points: 2640, avatar: "👩‍💼" },
                  { rank: 4, name: "Ahmed Hassan", points: 2580, avatar: "👨‍💻" },
                  { rank: 5, name: "Sophie Mueller", points: 2450, avatar: "👩‍🎓" },
                  { rank: userStats.rank, name: "Jij", points: userStats.totalPoints, avatar: "⭐", isCurrentUser: true }
                ].map((user) => (
                  <div 
                    key={user.rank}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.isCurrentUser ? 'bg-brand-blue-light border-2 border-brand-blue' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        user.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                      </div>
                      <div>
                        <p className={`font-medium ${user.isCurrentUser ? 'text-brand-blue' : ''}`}>
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.points} punten</p>
                      </div>
                    </div>
                    <div className="text-2xl">{user.avatar}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Statistieken</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{userStats.streak}</p>
                  <p className="text-sm text-gray-600">Dagen streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">89%</p>
                  <p className="text-sm text-gray-600">Succes ratio</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">4.8⭐</p>
                  <p className="text-sm text-gray-600">Gem. rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}