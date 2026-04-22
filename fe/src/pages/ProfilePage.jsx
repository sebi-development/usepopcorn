import { Form, useLoaderData, useActionData } from "react-router"
import { HiOutlineUser } from "react-icons/hi2"
import { useEffect } from "react"
import toast from 'react-hot-toast'

import store from '../store'
import { login } from '../store/authSlice'
import ErrorBadge from "../components/ErrorBadge"

export async function profileLoader() {
  const token = localStorage.getItem('token')
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await res.json()
  return data.user
}

export async function profileAction({ request }) {
  const token = localStorage.getItem('token')
  const formData = await request.formData()

  const name = formData.get('name')
  const currentPassword = formData.get('currentPassword')
  const newPassword = formData.get('newPassword')

  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name, currentPassword, newPassword })
  })

  const data = await res.json()

  if (!res.ok) return { error: data.error }

  // Update local username
  store.dispatch(login({
    user: data.user,
    token: localStorage.getItem('token')
  }))

  return { success: true }
}

function ProfilePage() {
  const user = useLoaderData()
  const actionData = useActionData()

  useEffect(function () {
    if (actionData?.success) toast.success('Profile updated!')
  }, [actionData])

  return (
    <main className="main">
      <div className="box profile-box">
        <div className="profile-header">
          <HiOutlineUser className="profile-icon" />
          <h2>Edit Profile</h2>
        </div>

        {actionData?.error && <ErrorBadge message={actionData.error} />}

        <Form method="post">
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              type="text"
              defaultValue={user?.name ?? ''}
              className="search"
            />
          </div>

          <div className="form-group">
            <label>Current Password</label>
            <input
              name="currentPassword"
              type="password"
            />
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              name="newPassword"
              type="password"
            />
          </div>

          <button type="submit" className="btn-auth">
            Save Changes
          </button>

        </Form>
      </div>
    </main>
  )
}

export default ProfilePage