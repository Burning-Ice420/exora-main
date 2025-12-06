"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, Plus, Search, Edit, Trash2, Upload, Download, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import ActivityForm from "./ActivityForm"
import CSVUpload from "./CSVUpload"

export default function AdminDashboard({ onLogout }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [showCSVUpload, setShowCSVUpload] = useState(false)
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, cancelled: 0 })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const adminToken = localStorage.getItem('adminToken')

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`${API_BASE_URL}/api/admin/activities?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
        setTotalPages(data.pagination?.pages || 1)
      } else {
        setError('Failed to fetch activities')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/activities/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || { total: 0, published: 0, draft: 0, cancelled: 0 })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  useEffect(() => {
    fetchActivities()
    fetchStats()
  }, [page, searchTerm])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this activity?')) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setSuccess('Activity deleted successfully')
        fetchActivities()
        fetchStats()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError('Failed to delete activity')
      }
    } catch (err) {
      setError('Failed to delete activity')
    }
  }

  const handleEdit = (activity) => {
    setEditingActivity(activity)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingActivity(null)
    fetchActivities()
    fetchStats()
  }

  const handleCSVUploadSuccess = () => {
    setShowCSVUpload(false)
    fetchActivities()
    fetchStats()
    setSuccess('Activities uploaded successfully')
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage activities and content</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.published}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cancelled}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowCSVUpload(true)} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </Button>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activities</CardTitle>
            <CardDescription>Manage all activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No activities found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Title</th>
                      <th className="text-left p-4 font-medium">Destination</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Cost</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">{activity.title}</td>
                        <td className="p-4">{activity.destination}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            activity.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            activity.status === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {activity.status || 'draft'}
                          </span>
                        </td>
                        <td className="p-4">
                          {activity.cost?.estimated ? `$${activity.cost.estimated}` : 'Free'}
                        </td>
                        <td className="p-4">
                          {activity.date ? new Date(activity.date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(activity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(activity._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Form Modal */}
      {showForm && (
        <ActivityForm
          activity={editingActivity}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {/* CSV Upload Modal */}
      {showCSVUpload && (
        <CSVUpload
          onClose={() => setShowCSVUpload(false)}
          onSuccess={handleCSVUploadSuccess}
        />
      )}
    </div>
  )
}

