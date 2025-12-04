import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, Gift, Zap, Users, Target, Award, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Delivery, Driver } from "@shared/schema";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  threshold: number;
  current: number;
  completed: boolean;
  completedAt?: Date;
  reward: string;
  category: 'deliveries' | 'speed' | 'quality' | 'team' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface CelebrationEffect {
  id: string;
  type: 'confetti' | 'fireworks' | 'stars' | 'sparkles';
  x: number;
  y: number;
  active: boolean;
}

export default function InteractiveMilestoneCelebrations() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [celebrationEffects, setCelebrationEffects] = useState<CelebrationEffect[]>([]);
  const [activeCelebration, setActiveCelebration] = useState<string | null>(null);

  const { data: deliveries } = useQuery<Delivery[]>({
    queryKey: ['/api/deliveries'],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['/api/drivers'],
  });

  // Initialize milestones
  useEffect(() => {
    const mockMilestones: Milestone[] = [
      {
        id: 'first_delivery',
        title: 'Eerste Bezorging',
        description: 'Voltooi je eerste succesvolle bezorging',
        icon: <Trophy className="h-6 w-6" />,
        threshold: 1,
        current: 1,
        completed: true,
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reward: '+50 punten, Welkomstbonus',
        category: 'deliveries',
        rarity: 'common'
      },
      {
        id: 'speed_demon',
        title: 'Snelheidsduivel',
        description: 'Bezorg 5 pakketten binnen de verwachte tijd',
        icon: <Zap className="h-6 w-6" />,
        threshold: 5,
        current: 3,
        completed: false,
        reward: '+200 punten, Snelheidsbonus',
        category: 'speed',
        rarity: 'rare'
      },
      {
        id: 'century_club',
        title: 'Eeuw Club',
        description: 'Voltooi 100 bezorgingen',
        icon: <Star className="h-6 w-6" />,
        threshold: 100,
        current: 67,
        completed: false,
        reward: '+500 punten, Speciale badge',
        category: 'deliveries',
        rarity: 'epic'
      },
      {
        id: 'team_player',
        title: 'Teamspeler',
        description: 'Help 3 collega-chauffeurs',
        icon: <Users className="h-6 w-6" />,
        threshold: 3,
        current: 2,
        completed: false,
        reward: '+150 punten, Team bonus',
        category: 'team',
        rarity: 'rare'
      },
      {
        id: 'perfect_week',
        title: 'Perfecte Week',
        description: '7 dagen achtereen 100% succesvolle bezorgingen',
        icon: <Target className="h-6 w-6" />,
        threshold: 7,
        current: 4,
        completed: false,
        reward: '+300 punten, Perfectie bonus',
        category: 'quality',
        rarity: 'epic'
      },
      {
        id: 'legend_status',
        title: 'Legendarische Status',
        description: 'Bereik 1000 bezorgingen met 99% succesrate',
        icon: <Award className="h-6 w-6" />,
        threshold: 1000,
        current: 67,
        completed: false,
        reward: '+1000 punten, Legendarische titel',
        category: 'special',
        rarity: 'legendary'
      }
    ];
    setMilestones(mockMilestones);
  }, [deliveries]);

  // Trigger celebration effects
  const triggerCelebration = (milestone: Milestone) => {
    setActiveCelebration(milestone.id);
    
    // Create celebration effects
    const effects: CelebrationEffect[] = [];
    const effectCount = milestone.rarity === 'legendary' ? 20 : 
                       milestone.rarity === 'epic' ? 15 : 
                       milestone.rarity === 'rare' ? 10 : 5;

    for (let i = 0; i < effectCount; i++) {
      effects.push({
        id: `effect-${i}`,
        type: milestone.rarity === 'legendary' ? 'fireworks' : 
              milestone.rarity === 'epic' ? 'stars' : 
              milestone.rarity === 'rare' ? 'sparkles' : 'confetti',
        x: Math.random() * 100,
        y: Math.random() * 100,
        active: true
      });
    }

    setCelebrationEffects(effects);

    // Clear effects after animation
    setTimeout(() => {
      setCelebrationEffects([]);
      setActiveCelebration(null);
    }, 3000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-purple-500 to-pink-500';
      case 'epic': return 'from-purple-400 to-blue-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-purple-500';
      case 'epic': return 'border-purple-400';
      case 'rare': return 'border-blue-400';
      default: return 'border-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deliveries': return <Trophy className="h-4 w-4" />;
      case 'speed': return <Zap className="h-4 w-4" />;
      case 'quality': return <Target className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'special': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredMilestones = milestones.filter(milestone => 
    selectedCategory === 'all' || milestone.category === selectedCategory
  );

  const completedCount = milestones.filter(m => m.completed).length;
  const totalPoints = milestones
    .filter(m => m.completed)
    .reduce((sum, m) => sum + parseInt(m.reward.match(/\+(\d+)/)?.[1] || '0'), 0);

  return (
    <div className="space-y-6 relative">
      {/* Celebration Effects Overlay */}
      {celebrationEffects.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {celebrationEffects.map(effect => (
            <div
              key={effect.id}
              className="absolute animate-bounce"
              style={{
                left: `${effect.x}%`,
                top: `${effect.y}%`,
                animationDuration: '2s',
                animationDelay: `${Math.random() * 1000}ms`
              }}
            >
              {effect.type === 'confetti' && <div className="w-2 h-2 bg-yellow-400 rounded"></div>}
              {effect.type === 'stars' && <Star className="h-4 w-4 text-yellow-400 animate-spin" />}
              {effect.type === 'sparkles' && <Sparkles className="h-3 w-3 text-blue-400 animate-pulse" />}
              {effect.type === 'fireworks' && <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>}
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <span>Mijlpaal Vieringen</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                {completedCount} voltooid
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {totalPoints} punten verdiend
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          <div className="flex space-x-2 mb-6 flex-wrap">
            {['all', 'deliveries', 'speed', 'quality', 'team', 'special'].map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="mb-2"
              >
                {category !== 'all' && getCategoryIcon(category)}
                <span className="ml-1 capitalize">
                  {category === 'all' ? 'Alle' : 
                   category === 'deliveries' ? 'Bezorgingen' :
                   category === 'speed' ? 'Snelheid' :
                   category === 'quality' ? 'Kwaliteit' :
                   category === 'team' ? 'Team' : 'Speciaal'}
                </span>
              </Button>
            ))}
          </div>

          {/* Milestones Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMilestones.map(milestone => (
              <Card
                key={milestone.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  milestone.completed 
                    ? `${getRarityBorderColor(milestone.rarity)} border-2` 
                    : 'border-gray-200'
                } ${activeCelebration === milestone.id ? 'animate-pulse' : ''}`}
              >
                {/* Rarity Gradient Background */}
                {milestone.completed && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(milestone.rarity)} opacity-10`}></div>
                )}

                <CardHeader className="relative">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${
                      milestone.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <div className={`${
                        milestone.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {milestone.icon}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        milestone.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                        milestone.rarity === 'epic' ? 'bg-blue-100 text-blue-800' :
                        milestone.rarity === 'rare' ? 'bg-cyan-100 text-cyan-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.rarity === 'legendary' ? 'Legendarisch' :
                         milestone.rarity === 'epic' ? 'Episch' :
                         milestone.rarity === 'rare' ? 'Zeldzaam' : 'Gewoon'}
                      </Badge>
                      {milestone.completed && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 text-white">✓</div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{milestone.title}</h3>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Voortgang</span>
                      <span className="font-medium">
                        {milestone.current}/{milestone.threshold}
                      </span>
                    </div>
                    <Progress 
                      value={(milestone.current / milestone.threshold) * 100} 
                      className="h-2"
                    />
                  </div>

                  {/* Reward */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Gift className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Beloning:</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{milestone.reward}</p>
                  </div>

                  {/* Completion Status */}
                  {milestone.completed ? (
                    <div className="text-center">
                      <div className="text-green-600 text-sm font-medium">
                        Voltooid op {milestone.completedAt?.toLocaleDateString('nl-NL')}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => triggerCelebration(milestone)}
                        className="mt-2"
                        disabled={activeCelebration === milestone.id}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Vier opnieuw
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">
                        Nog {milestone.threshold - milestone.current} te gaan
                      </div>
                      {milestone.current >= milestone.threshold && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setMilestones(prev => prev.map(m => 
                              m.id === milestone.id 
                                ? { ...m, completed: true, completedAt: new Date() }
                                : m
                            ));
                            triggerCelebration(milestone);
                          }}
                          className="mt-2 bg-green-600 hover:bg-green-700"
                        >
                          <Trophy className="h-4 w-4 mr-1" />
                          Claim beloning
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Algemene Voortgang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Voltooide mijlpalen</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Punten verdiend</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {milestones.filter(m => m.rarity === 'legendary' && m.completed).length}
              </div>
              <div className="text-sm text-gray-600">Legendarische prestaties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round((completedCount / milestones.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Totale voortgang</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}