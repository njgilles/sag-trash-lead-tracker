'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection,
  onSnapshot,
  query,
  where,
  QueryConstraint,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { EmailTemplateDocument } from '@/types/lead'
import {
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  getEmailTemplates,
} from '@/lib/firestore-service'

interface UseEmailTemplatesReturn {
  templates: EmailTemplateDocument[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTemplate: (
    template: Omit<EmailTemplateDocument, 'id' | 'createdDate' | 'lastUpdated'>
  ) => Promise<string>
  updateTemplate: (id: string, updates: Partial<EmailTemplateDocument>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
}

export function useEmailTemplates(): UseEmailTemplatesReturn {
  const [templates, setTemplates] = useState<EmailTemplateDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Set up real-time listener for templates
  useEffect(() => {
    setLoading(true)
    setError(null)

    try {
      const templatesRef = collection(db, 'email_templates')
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        orderBy('createdDate', 'desc'),
      ]
      const q = query(templatesRef, ...constraints)

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedTemplates = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          } as EmailTemplateDocument))
          setTemplates(fetchedTemplates)
          setLoading(false)
          setError(null)
        },
        (err) => {
          console.error('Error fetching templates:', err)
          setError(err.message)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error setting up templates listener:', err)
      setError(message)
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedTemplates = await getEmailTemplates()
      setTemplates(fetchedTemplates)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error refetching templates:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTemplate = useCallback(
    async (template: Omit<EmailTemplateDocument, 'id' | 'createdDate' | 'lastUpdated'>) => {
      try {
        setError(null)
        const templateId = await createEmailTemplate(template)
        return templateId
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Error creating template:', err)
        setError(message)
        throw err
      }
    },
    []
  )

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplateDocument>) => {
    try {
      setError(null)
      await updateEmailTemplate(id, updates)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating template:', err)
      setError(message)
      throw err
    }
  }, [])

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setError(null)
      await deleteEmailTemplate(id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error deleting template:', err)
      setError(message)
      throw err
    }
  }, [])

  return {
    templates,
    loading,
    error,
    refetch,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
}
