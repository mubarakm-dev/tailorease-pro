import { isAuth } from "@/app/libs/session"
import { prisma } from "@/app/libs/prisma"
import { EditProfileForm } from "./EditProfileForm"
import { ChangePasswordForm } from "./ChangePasswordForm"
import { LogoutButton } from "./LogoutButton"

export default async function ProfilePage() {
  const session = await isAuth()
  const staff = await prisma.staff.findUnique({
    where: { id: session.staffId },
    include: { company: { select: { companyName: true } } }
  })

  if (!staff) {
    return <div>Staff not found</div>
  }

  const joinDate = new Date(staff.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  const statusColors: Record<string, string> = {
    APPROVED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    UNVERIFIED: "bg-gray-100 text-gray-700",
    REJECTED: "bg-red-100 text-red-700",
    SUSPENDED: "bg-red-100 text-red-700"
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-gray-700 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Account Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Overview</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-700 mb-1">Full Name</p>
            <p className="text-lg font-semibold text-gray-900">{staff.fullName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-1">Email Address</p>
            <p className="text-lg font-semibold text-gray-900">{staff.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-1">Role</p>
            <p className="text-lg font-semibold text-gray-900">{staff.role === "SUPER_ADMIN" ? "Owner / Super Admin" : "Staff"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-1">Company</p>
            <p className="text-lg font-semibold text-gray-900">{staff.company.companyName}</p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-1">Phone Number</p>
            <p className="text-lg font-semibold text-gray-900">{staff.phone || "Not set"}</p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-1">Joined</p>
            <p className="text-lg font-semibold text-gray-900">{joinDate}</p>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-1">Account Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[staff.status as keyof typeof statusColors]}`}>
              {staff.status}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <EditProfileForm initialName={staff.fullName} initialPhone={staff.phone || ""} />

      {/* Change Password Form */}
      <ChangePasswordForm email={staff.email} />

      {/* Logout Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sign out</h2>
        <p className="text-gray-600 text-sm mb-6">Sign out from this device and return to the login page.</p>
        <LogoutButton />
      </div>
    </div>
  )
}
