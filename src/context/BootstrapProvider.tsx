'use client'
import { useEffect } from 'react'
export const BootstrapProvider = () => {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])
  return null
}