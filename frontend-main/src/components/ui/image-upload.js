"use client"

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from './button'

const ImageUpload = ({ 
  onImagesChange, 
  maxImages = 1, 
  maxSize = 5, 
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = "",
  placeholder = "Click to upload images",
  uploading = false
}) => {
  const [images, setImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported image type`)
        return false
      }
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newImages = [...images, ...validFiles].slice(0, maxImages)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${images.length >= maxImages || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={images.length >= maxImages || uploading ? undefined : openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxImages > 1}
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
          disabled={images.length >= maxImages || uploading}
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
            <Upload size={24} className="text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {placeholder}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {maxImages > 1 ? `Up to ${maxImages} images` : 'Single image'} • Max {maxSize}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Preview Images */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-medium text-foreground">Preview</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X size={12} />
                  </Button>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                    {Math.round(image.size / 1024)}KB
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-upload status */}
      {images.length > 0 && uploading && (
        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-600 font-medium flex items-center">
            <Loader2 size={16} className="mr-2 animate-spin" />
            Auto-uploading {images.length} image{images.length > 1 ? 's' : ''}...
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload
