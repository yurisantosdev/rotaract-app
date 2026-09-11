import React from 'react'
import { toast } from 'react-toastify'

export function AlertSuccess(text: any) {
  return toast.success(text, {
    position: 'top-right',
    autoClose: 1600,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light'
  })
}

export function AlertError(text: any) {
  return toast.error(text, {
    position: 'top-right',
    autoClose: 1600,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light'
  })
}

export function AlertWarn(text: any) {
  return toast.warn(text, {
    position: 'top-right',
    autoClose: 1600,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light'
  })
}

export function AlertInfo(text: any) {
  return toast.info(text, {
    position: 'top-right',
    autoClose: 1600,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light'
  })
}