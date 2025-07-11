'use client';

import { useState } from 'react';
import { ProfileDisplay } from "@/components/profile/profile-display";
import { ProfileForm } from "@/components/profile/profile-form";

export default function Page() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="max-w-4xl mx-auto w-full px-4 lg:px-6">
          {isEditing ? (
            <ProfileForm onCancel={() => setIsEditing(false)} />
          ) : (
            <ProfileDisplay onEdit={() => setIsEditing(true)} />
          )}
        </div>
      </div>
    </div>
  );
}