"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { X, Upload, AlertCircle, CheckCircle, Download } from "lucide-react"

export default function CSVUpload({ onClose, onSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const adminToken = localStorage.getItem('adminToken')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile)
        setError("")
      } else {
        setError("Please select a CSV file")
        setFile(null)
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a CSV file")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('csv', file)

      const response = await fetch(`${API_BASE_URL}/api/admin/activities/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        if (data.errors && data.errors.length > 0) {
          setError(`Some activities failed to upload. Check the results below.`)
        } else {
          onSuccess()
        }
      } else {
        setError(data.message || 'Failed to upload CSV')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `title,destination,description,date,time,status,cost,currency,activityType,difficulty,duration,tags
Sunset Beach Bonfire,Goa,Join us for an unforgettable sunset bonfire on the beach,2024-12-25,18:00,published,0,USD,Beach Activity,Easy,2 hours,beach;sunset;bonfire
Goa Food Tour,Goa,Explore the best street food spots in Goa,2024-12-26,10:00,published,500,USD,Food Tour,Easy,3 hours,food;tour;culture
Water Sports Adventure,Goa,Jet skiing and parasailing adventure,2024-12-27,09:00,published,1500,USD,Water Sports,Moderate,4 hours,water sports;adventure;outdoor`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'activities_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bulk Upload Activities</CardTitle>
            <CardDescription>Upload a CSV file to bulk create activities</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && !result && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className={result.errors?.length > 0 ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "border-green-500 bg-green-50 dark:bg-green-900/20"}>
              {result.errors?.length > 0 ? (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <AlertDescription className={result.errors?.length > 0 ? "text-yellow-700 dark:text-yellow-400" : "text-green-700 dark:text-green-400"}>
                {result.message}
                {result.summary && (
                  <div className="mt-2 text-sm">
                    <p>Total: {result.summary.total}</p>
                    <p>Successful: {result.summary.successful}</p>
                    <p>Failed: {result.summary.failed}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Button variant="outline" onClick={downloadTemplate} className="w-full mb-4">
                <Download className="mr-2 h-4 w-4" />
                Download CSV Template
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="csv-file" className="cursor-pointer">
                <span className="text-primary hover:underline">Click to upload</span> or drag and drop
              </Label>
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
              {file && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>CSV Format:</strong></p>
              <p>Required columns: title, destination</p>
              <p>Optional columns: description, date, time, status, cost, currency, activityType, difficulty, duration, tags</p>
              <p>Tags should be semicolon-separated (e.g., "beach;sunset;bonfire")</p>
            </div>
          </div>

          {result?.errors && result.errors.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Errors:</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {result.errors.map((err, idx) => (
                  <Alert key={idx} variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">
                      Row {err.row}: {err.error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button onClick={handleUpload} disabled={loading || !file}>
                {loading ? 'Uploading...' : 'Upload CSV'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

