import { getProfile } from "@/services/profile.service"
import { ProfileForm } from "@/components/settings/profile-form"

export default async function SettingsPage() {
  const profile = await getProfile()

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your profile is used to score job fit and personalise AI proposals.
      </p>
      <ProfileForm initial={profile} />
    </div>
  )
}
