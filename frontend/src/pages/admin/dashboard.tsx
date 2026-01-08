import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, TrendingUp, Users, Heart, MessageSquare, Star, Eye, DollarSign, Home, Calendar, MapPin, ArrowUp, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AgencyDashboard() {
  // ========== STATISTIQUES GLOBALES - À CHARGER VIA API ==========
  const [stats, setStats] = useState({
    total_properties: 1248,
    properties_change: 12.5,
    active_properties: 892,
    sold_this_month: 45,
    revenue_this_month: 2450000,
    revenue_change: 18.2,
    total_views: 45680,
    views_change: 8.5,
    total_posts: 156,
    posts_likes: 8942,
    posts_comments: 1523,
    agency_rating: 4.7,
    total_ratings: 342
  });

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     const response = await fetch('/api/dashboard/stats', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setStats(data);
  //   };
  //   fetchStats();
  // }, []);
  // ================================================================

  // ========== DONNÉES GRAPHIQUE REVENUS - À CHARGER VIA API ==========
  const [revenueData, setRevenueData] = useState([
    { month: 'Jan', ventes: 1800000, locations: 450000 },
    { month: 'Fév', ventes: 2100000, locations: 480000 },
    { month: 'Mar', ventes: 1950000, locations: 520000 },
    { month: 'Avr', ventes: 2400000, locations: 495000 },
    { month: 'Mai', ventes: 2200000, locations: 510000 },
    { month: 'Juin', ventes: 2450000, locations: 530000 }
  ]);

  // useEffect(() => {
  //   const fetchRevenue = async () => {
  //     const response = await fetch('/api/dashboard/revenue?period=6months', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setRevenueData(data);
  //   };
  //   fetchRevenue();
  // }, []);
  // ====================================================================

  // ========== RÉPARTITION DES BIENS PAR TYPE - À CHARGER VIA API ==========
  const [propertyTypes, setPropertyTypes] = useState([
    { name: 'Appartements', value: 485, color: '#3b82f6' },
    { name: 'Maisons', value: 320, color: '#10b981' },
    { name: 'Villas', value: 245, color: '#f59e0b' },
    { name: 'Studios', value: 142, color: '#8b5cf6' },
    { name: 'Terrains', value: 56, color: '#ec4899' }
  ]);

  // useEffect(() => {
  //   const fetchPropertyTypes = async () => {
  //     const response = await fetch('/api/dashboard/property-types', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setPropertyTypes(data);
  //   };
  //   fetchPropertyTypes();
  // }, []);
  // ========================================================================

  // ========== VUES PAR BIEN - À CHARGER VIA API ==========
  const [viewsData, setViewsData] = useState([
    { day: 'Lun', views: 580 },
    { day: 'Mar', views: 720 },
    { day: 'Mer', views: 650 },
    { day: 'Jeu', views: 890 },
    { day: 'Ven', views: 950 },
    { day: 'Sam', views: 1200 },
    { day: 'Dim', views: 980 }
  ]);

  // useEffect(() => {
  //   const fetchViews = async () => {
  //     const response = await fetch('/api/dashboard/views?period=week', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setViewsData(data);
  //   };
  //   fetchViews();
  // }, []);
  // ========================================================

  // ========== TOP BIENS LES PLUS VUS - À CHARGER VIA API ==========
  const [topProperties, setTopProperties] = useState([
    { id: 1, title: 'Villa moderne Almadies', views: 1245, likes: 89, city: 'Dakar' },
    { id: 2, title: 'Appartement Plateau', views: 1120, likes: 76, city: 'Dakar' },
    { id: 3, title: 'Maison Ouakam', views: 980, likes: 65, city: 'Dakar' },
    { id: 4, title: 'Studio Mermoz', views: 845, likes: 54, city: 'Dakar' },
    { id: 5, title: 'Villa Ngor vue mer', views: 790, likes: 48, city: 'Dakar' }
  ]);

  // useEffect(() => {
  //   const fetchTopProperties = async () => {
  //     const response = await fetch('/api/dashboard/top-properties?limit=5', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setTopProperties(data);
  //   };
  //   fetchTopProperties();
  // }, []);
  // ================================================================

  // ========== POSTS RÉCENTS AVEC ENGAGEMENT - À CHARGER VIA API ==========
  const [recentPosts, setRecentPosts] = useState([
    { id: 1, title: 'Nouveaux projets immobiliers 2026', likes: 234, comments: 45, date: '2026-01-02' },
    { id: 2, title: 'Conseils pour investir', likes: 189, comments: 38, date: '2026-01-01' },
    { id: 3, title: 'Tendances du marché', likes: 167, comments: 29, date: '2025-12-30' }
  ]);

  // useEffect(() => {
  //   const fetchRecentPosts = async () => {
  //     const response = await fetch('/api/dashboard/posts/recent?limit=3', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setRecentPosts(data);
  //   };
  //   fetchRecentPosts();
  // }, []);
  // =======================================================================

  // ========== DISTRIBUTION DES NOTES - À CHARGER VIA API ==========
  const [ratingsDistribution, setRatingsDistribution] = useState([
    { stars: 5, count: 198 },
    { stars: 4, count: 89 },
    { stars: 3, count: 35 },
    { stars: 2, count: 12 },
    { stars: 1, count: 8 }
  ]);

  // useEffect(() => {
  //   const fetchRatings = async () => {
  //     const response = await fetch('/api/dashboard/ratings/distribution', {
  //       headers: { 'Authorization': `Bearer ${token}` }
  //     });
  //     const data = await response.json();
  //     setRatingsDistribution(data);
  //   };
  //   fetchRatings();
  // }, []);
  // ================================================================

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            {change >= 0 ? (
              <ArrowUp className="w-3 h-3 text-green-500" />
            ) : (
              <ArrowDown className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Vue d'ensemble de votre agence immobilière</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Mis à jour: {new Date().toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Stats principales */}
        <div className="flex flex-wrap gap-4">
          <StatCard
            title="Biens totaux"
            value={stats.total_properties.toLocaleString()}
            change={stats.properties_change}
            icon={Building2}
            color="bg-blue-500"
          />
          <StatCard
            title="Revenus ce mois"
            value={`${(stats.revenue_this_month / 1000).toFixed(0)}K €`}
            change={stats.revenue_change}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Revenus totaux"
            value="14.2M €"
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <StatCard
            title="Vues totales"
            value={stats.total_views.toLocaleString()}
            change={stats.views_change}
            icon={Eye}
            color="bg-purple-500"
          />
          <StatCard
            title="Biens vendus"
            value={stats.sold_this_month}
            icon={Home}
            color="bg-orange-500"
          />
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenus */}
          <Card>
            <CardHeader>
              <CardTitle>Revenus - 6 derniers mois</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLocations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="ventes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVentes)" />
                  <Area type="monotone" dataKey="locations" stroke="#10b981" fillOpacity={1} fill="url(#colorLocations)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Répartition par type */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des biens par type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Vues et Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vues hebdomadaires */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vues quotidiennes - Cette semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stats posts et rating */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Engagement Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total posts</span>
                  <span className="text-2xl font-bold">{stats.total_posts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Likes</span>
                  </div>
                  <span className="text-xl font-semibold">{stats.posts_likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Commentaires</span>
                  </div>
                  <span className="text-xl font-semibold">{stats.posts_comments.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Note de l'agence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl font-bold">{stats.agency_rating}</div>
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${star <= Math.round(stats.agency_rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{stats.total_ratings} avis</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {ratingsDistribution.map((rating) => (
                    <div key={rating.stars} className="flex items-center gap-2">
                      <span className="text-sm w-4">{rating.stars}</span>
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500"
                          style={{ width: `${(rating.count / stats.total_ratings) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{rating.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top biens et Posts récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top biens */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 - Biens les plus vus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProperties.map((property, index) => (
                  <div key={property.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{property.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {property.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {property.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {property.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posts récents */}
          <Card>
            <CardHeader>
              <CardTitle>Posts récents avec meilleur engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg border hover:border-primary/50 transition">
                    <h4 className="font-semibold mb-2">{post.title}</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-red-500">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-500">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                      <span className="text-muted-foreground">
                        {new Date(post.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}