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
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      {images.length === 0 ? (
        <div
          className={`
            relative border border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors
            ${dragActive 
              ? 'border-primary/60 bg-primary/5' 
              : 'border-border hover:border-primary/40 hover:bg-muted/30'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={uploading ? undefined : openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxImages > 1}
            accept={acceptedTypes.join(',')}
            onChange={handleChange}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Upload size={18} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">
                {placeholder}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {maxImages > 1 ? `Up to ${maxImages} photos` : 'Single photo'} • {maxSize}MB max
              </p>
            </div>
          </div>
        </div>
      ) : images.length < maxImages && !uploading && (
        <button
          onClick={openFileDialog}
          className="w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/50 hover:border-primary/40 rounded-lg transition-colors"
        >
          + Add more photos
        </button>
      )}

      {/* Preview Images */}
      {images.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {images.length} {images.length === 1 ? 'photo' : 'photos'}
            </span>
            {uploading && (
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={11} />
                </motion.div>
                <span>Uploading</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="relative group"
              >
                <div className="aspect-square rounded-md overflow-hidden bg-muted/30 border border-border/30 group-hover:border-border/60 transition-colors">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    type="button"
                  >
                    <X size={11} className="text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default ImageUpload
