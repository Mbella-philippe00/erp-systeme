'use client'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function UploadLogo({ onUpload }: { onUpload?: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const filePath = `logos/${Date.now()}-${file.name}`

    const { error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      console.error('Upload échoué:', error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath)
    if (onUpload && data?.publicUrl) onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
    </div>
  )
}
