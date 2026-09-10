import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { useAuth } from "../../context/AuthContext";

import {
  deleteProfilePicture,
  getCurrentUser,
  uploadProfilePicture,
} from "../../services/authService";

import type { User } from "../../types/user";

const API_BASE_URL = "http://127.0.0.1:8000";

function Profile() {
  const { token } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setProfile(data);
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !token) {
      return;
    }

    setError("");
    setSuccess("");

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be smaller than 5 MB.");

      event.target.value = "";
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WEBP images are allowed.");

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const data = await uploadProfilePicture(
        token,
        file
      );

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          profile_picture: data.profile_picture,
        };
      });

      setSuccess("Profile picture updated successfully.");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to upload profile picture.");
      }
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  async function handleRemovePhoto() {
    if (!token || !profile?.profile_picture) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove your profile picture?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setRemoving(true);

      await deleteProfilePicture(token);

      setProfile((currentProfile) => {
        if (!currentProfile) {
          return currentProfile;
        }

        return {
          ...currentProfile,
          profile_picture: null,
        };
      });

      setSuccess("Profile picture removed successfully.");
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to remove profile picture.");
      }
    } finally {
      setRemoving(false);
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <p className="loading-state">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-page">
        <p className="list-error">
          {error}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p className="loading-state">
          Profile not found.
        </p>
      </div>
    );
  }

  const initials = profile.username
    .slice(0, 2)
    .toUpperCase();

  const profilePictureUrl = profile.profile_picture
    ? profile.profile_picture.startsWith("/uploads/")
      ? `${API_BASE_URL}${profile.profile_picture}`
      : `${API_BASE_URL}/uploads/profile_pictures/${profile.profile_picture}`
    : null;

  return (
    <div className="profile-page">
      <div className="profile-page-header">
        <div>
          <h1>My Profile</h1>

          <p>
            View your account information and profile details.
          </p>
        </div>
      </div>

      {error && (
        <p className="list-error">
          {error}
        </p>
      )}

      {success && (
        <p className="success-message">
          {success}
        </p>
      )}

      <section className="profile-card">
        <div className="profile-header">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="profile-picture-image"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handlePhotoChange}
            />

            <button
              type="button"
              className="profile-picture-button"
              onClick={openFilePicker}
              disabled={uploading || removing}
            >
              {uploading
                ? "Uploading..."
                : profile.profile_picture
                  ? "Change Photo"
                  : "Add Photo"}
            </button>

            {profile.profile_picture && !uploading && (
              <button
                type="button"
                className="profile-remove-button"
                onClick={handleRemovePhoto}
                disabled={removing}
              >
                {removing
                  ? "Removing..."
                  : "Remove Photo"}
              </button>
            )}

            <p className="profile-picture-help">
              JPG, PNG or WEBP · Max 5 MB
            </p>
          </div>

          <div className="profile-header-info">
            <h2>{profile.username}</h2>

            <div className="profile-meta">
              <span
                className={`table-role role-${profile.role}`}
              >
                {profile.role}
              </span>

              <span
                className={
                  profile.is_active
                    ? "profile-status active"
                    : "profile-status inactive"
                }
              >
                <span className="status-dot" />

                {profile.is_active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <p>
              Member since{" "}
              {new Date(
                profile.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      <section className="profile-card">
        <div className="profile-card-header">
          <div>
            <h2>Account Information</h2>

            <p>
              Your basic hospital system account details.
            </p>
          </div>
        </div>

        <div className="profile-information-grid">
          <div className="profile-information-item">
            <span>Username</span>
            <strong>
              {profile.username}
            </strong>
          </div>

          <div className="profile-information-item">
            <span>Email Address</span>
            <strong>
              {profile.email}
            </strong>
          </div>

          <div className="profile-information-item">
            <span>Role</span>
            <strong className="profile-role-text">
              {profile.role}
            </strong>
          </div>

          <div className="profile-information-item">
            <span>Account Status</span>
            <strong>
              {profile.is_active
                ? "Active"
                : "Inactive"}
            </strong>
          </div>

          <div className="profile-information-item">
            <span>User ID</span>
            <strong>
              #{profile.id}
            </strong>
          </div>

          <div className="profile-information-item">
            <span>Account Created</span>
            <strong>
              {new Date(
                profile.created_at
              ).toLocaleDateString()}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Profile;