'use client';

import { ProfileDisplay } from "@/components/profile/profile-display";
import { ProfileForm } from "@/components/profile/profile-form";

export default function Page() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="grid gap-4 px-4 lg:grid-cols-2 lg:gap-8 lg:px-6">
          <ProfileDisplay />
          <ProfileForm />
        </div>
      </div>
    </div>
  );
}
