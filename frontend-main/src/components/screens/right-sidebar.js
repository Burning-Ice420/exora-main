"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { TrendingUp, Users, Calendar, MapPin, Star, Plus, Loader2, Sun } from "lucide-react"

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds}s`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
  return `${Math.floor(diffInSeconds / 86400)}d`
}

// Helper function to format reader count
const formatReaders = (count) => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

export default function RightSidebar({ onCreatePost }) {
  const router = useRouter()
  const [trendingNews, setTrendingNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  // Fetch travel news from newsdata.io - Goa specific only
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setNewsLoading(true)
        // Using newsdata.io API with strict Goa-specific queries
        const queries = [
          'Goa tourism',
          'Goa travel',
          'Goa beach',
          'Goa vacation',
          'Goa holiday',
          'Goa attractions',
          'Goa hotels',
          'Goa restaurants'
        ]
        const allNews = []
        
        for (const query of queries) {
          try {
            const response = await fetch(
              `https://newsdata.io/api/1/latest?apikey=pub_cd42b85b061547968c828c74bde593af&q=${encodeURIComponent(query)}&language=en&country=in`
            )
            const data = await response.json()
            
            if (data.status === 'success' && data.results) {
              allNews.push(...data.results)
            }
          } catch (error) {
            console.error(`Error fetching news for ${query}:`, error)
          }
        }
        
        // Filter to only include articles that mention "Goa" in title or description
        const goaKeywords = ['goa', 'goan']
        const goaSpecificNews = allNews.filter(news => {
          const title = (news.title || '').toLowerCase()
          const description = (news.description || '').toLowerCase()
          const content = (news.content || '').toLowerCase()
          
          return goaKeywords.some(keyword => 
            title.includes(keyword) || 
            description.includes(keyword) || 
            content.includes(keyword)
          )
        })
        
        // Remove duplicates and sort by date
        const uniqueNews = goaSpecificNews
          .filter((news, index, self) => 
            index === self.findIndex(n => n.article_id === news.article_id)
          )
          .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
          .slice(0, 4)
          .map(news => ({
            title: news.title || 'No title',
            time: formatTimeAgo(news.pubDate),
            readers: formatReaders(Math.floor(Math.random() * 3000) + 500), // Simulated reader count
            url: news.link,
            source: news.source_id
          }))
        
        setTrendingNews(uniqueNews)
      } catch (error) {
        console.error('Error fetching news:', error)
        // Fallback to default news
        setTrendingNews([
          { title: "Goa Tourism Sees 40% Growth", time: "2h", readers: "1.2k" },
          { title: "New Adventure Trails Open", time: "4h", readers: "856" },
          { title: "Travel Safety Guidelines Updated", time: "6h", readers: "2.1k" },
          { title: "Sustainable Tourism Initiative", time: "8h", readers: "1.5k" },
        ])
      } finally {
        setNewsLoading(false)
      }
    }
    
    fetchNews()
    // Refresh news every 30 minutes
    const interval = setInterval(fetchNews, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch weather for Goa
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeatherLoading(true)
        // Using wttr.in free weather API (no API key required)
        const response = await fetch(
          `https://wttr.in/Goa?format=j1`
        )
        
        if (response.ok) {
          const data = await response.json()
          const current = data.current_condition[0]
          const location = data.nearest_area[0]
          
          setWeather({
            location: `${location.areaName[0].value}, ${location.country[0].value}`,
            temperature: parseInt(current.temp_C),
            condition: current.weatherDesc[0].value,
            description: current.weatherDesc[0].value.toLowerCase(),
            humidity: parseInt(current.humidity),
            windSpeed: parseInt(current.windspeedKmph)
          })
        } else {
          throw new Error('Weather API failed')
        }
      } catch (error) {
        console.error('Error fetching weather:', error)
        // Fallback weather data
        setWeather({
          location: "Goa, India",
          temperature: 28,
          condition: "Sunny",
          description: "Perfect for beach activities",
          humidity: 65,
          windSpeed: 12
        })
      } finally {
        setWeatherLoading(false)
      }
    }
    
    fetchWeather()
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleQuickAction = (action) => {
    switch (action) {
      case "createPost":
        if (onCreatePost) {
          onCreatePost()
        }
        break
      case "planTrip":
        router.push("/labs?createTrip=true")
        break
      case "findEvents":
        router.push("/finder")
        break
      case "createGroup":
        router.push("/labs")
        break
      default:
        break
    }
  }

  const quickActions = [
    { icon: Plus, label: "Create Post", color: "text-primary", action: "createPost" },
    { icon: Calendar, label: "Plan Trip", color: "text-blue-500", action: "planTrip" },
    { icon: MapPin, label: "Find Events", color: "text-green-500", action: "findEvents" },
    { icon: Users, label: "Create Group", color: "text-purple-500", action: "createGroup" },
  ]

  return (
    <div className="w-80 bg-background border-l border-border h-full overflow-y-auto scrollbar-hide">
      {/* Trending News */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Travel News</h3>
        </div>
        {newsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : trendingNews.length > 0 ? (
          <div className="space-y-3">
            {trendingNews.map((news, idx) => (
              <motion.a
                key={`${news.title}-${idx}`}
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="block p-3 rounded-lg hover:bg-muted/50 smooth-transition cursor-pointer"
              >
                <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">{news.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{news.time}</span>
                  <span>•</span>
                  <span>{news.readers} readers</span>
                </div>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No news available
          </div>
        )}
      </div>

      {/* Upcoming Events */}
  

      {/* Quick Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, idx) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              onClick={() => handleQuickAction(action.action)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-primary/5 hover:shadow-sm smooth-transition border border-border/50"
            >
              <action.icon size={20} className={action.color} />
              <span className="text-xs font-medium text-foreground">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Weather Widget */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Sun size={16} className="text-yellow-500" />
          <h3 className="text-sm font-semibold text-foreground">Weather</h3>
        </div>
        {weatherLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : weather ? (
          <div className="glass-effect rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">{weather.location}</p>
                <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">{weather.temperature}°C</p>
                <p className="text-xs text-muted-foreground capitalize">{weather.condition}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Humidity: {weather.humidity}%</span>
              <span>Wind: {weather.windSpeed} km/h</span>
            </div>
          </div>
        ) : (
          <div className="glass-effect rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">Goa, India</p>
                <p className="text-xs text-muted-foreground">Perfect for beach activities</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">28°C</p>
                <p className="text-xs text-muted-foreground">Sunny</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Humidity: 65%</span>
              <span>Wind: 12 km/h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
