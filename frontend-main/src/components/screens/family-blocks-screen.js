"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserPlus, CheckCircle, XCircle, Clock, MapPin, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import api from "@/server/api"

export default function FamilyBlocksScreen() {
  const [familyBlocks, setFamilyBlocks] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState(null)

  useEffect(() => {
    loadFamilyBlocks()
  }, [])

  const loadFamilyBlocks = async () => {
    try {
      setLoading(true)
      const response = await api.getFamilyBlocks()
      setFamilyBlocks(response.blocks || [])
      setPendingApprovals(response.pendingApprovals || [])
    } catch (error) {
      console.error('Failed to load family blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSubBlock = async (subBlockId, approved) => {
    try {
      await api.approveSubBlock(subBlockId, approved)
      await loadFamilyBlocks() // Refresh data
    } catch (error) {
      console.error('Failed to approve sub-block:', error)
    }
  }

  const handleAddFamilyMember = async (blockId, memberId) => {
    try {
      await api.addFamilyMember(blockId, memberId)
      await loadFamilyBlocks() // Refresh data
    } catch (error) {
      console.error('Failed to add family member:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-background overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Family Blocks</h1>
            <p className="text-xs text-muted-foreground">Manage family and couple travel plans</p>
          </div>
          <div className="flex items-center gap-2">
            <Users size={20} className="text-primary" />
            <span className="text-sm text-muted-foreground">
              {familyBlocks.length} blocks
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock size={20} className="text-amber-500" />
              Pending Approvals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingApprovals.map((subBlock) => (
                <motion.div
                  key={subBlock._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-4 space-y-3 border border-amber-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {subBlock.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {subBlock.destination}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Suggested by: {subBlock.suggestedBy?.name || 'Unknown'}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      Pending
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveSubBlock(subBlock._id, true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApproveSubBlock(subBlock._id, false)}
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <XCircle size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Family Blocks */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users size={20} className="text-primary" />
            Family Blocks
          </h2>
          
          {familyBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyBlocks.map((block) => (
                <motion.div
                  key={block._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className="glass-effect rounded-xl p-4 space-y-3 hover:bg-white/10 smooth-transition cursor-pointer group"
                  onClick={() => setSelectedBlock(block)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary smooth-transition">
                        {block.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {block.destination}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        {new Date(block.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge 
                      variant={block.type === 'main_block' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {block.type === 'main_block' ? 'Main' : 'Sub'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Created by: {block.createdBy?.name || 'Unknown'}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {block.membersInvolved?.length || 0} members
                      </span>
                    </div>
                    
                    {block.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {block.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Add family member functionality
                        }}
                        className="text-xs"
                      >
                        <UserPlus size={12} className="mr-1" />
                        Add Member
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {block.approved ? 'Approved' : 'Pending'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Family Blocks Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first family block to start planning together
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                Create Family Block
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Block Detail Modal */}
      <AnimatePresence>
        {selectedBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedBlock(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {selectedBlock.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBlock(null)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Destination:</span>
                    <p className="font-medium">{selectedBlock.destination}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium capitalize">{selectedBlock.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">
                      {new Date(selectedBlock.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{selectedBlock.time}</p>
                  </div>
                </div>
                
                {selectedBlock.description && (
                  <div>
                    <span className="text-muted-foreground text-sm">Description:</span>
                    <p className="text-sm mt-1">{selectedBlock.description}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-muted-foreground text-sm">Members:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBlock.membersInvolved?.map((member, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {member.name || `Member ${index + 1}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
