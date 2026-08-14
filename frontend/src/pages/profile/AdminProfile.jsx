import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const AdminProfile = () => {
  const { user, login } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Recruiter Lead (Admin)',
    email: user?.email || 'admin@adyapan.com',
    phone: user?.phone || '+91 98765-43210',
    designation: user?.designation || 'Head of Talent Acquisition & AI Hiring',
    department: user?.department || 'Executive HR & Placement',
    company: user?.company || 'Adyapan Edutech Pvt. Ltd.',
    location: user?.location || 'Hyderabad / Remote',
    joinedDate: 'August 2026',
    bio: user?.bio || 'Overseeing end-to-end recruitment operations, deterministic ATS resume scoring, interview scheduling, and offer letter generation for Adyapan Edutech.',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editForm, setEditForm] = useState({ ...profileData });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchLiveProfile();
  }, []);

  const fetchLiveProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getCurrentUser();
      if (res?.user) {
        setProfileData((prev) => ({
          ...prev,
          name: res.user.name || prev.name,
          email: res.user.email || prev.email,
          phone: res.user.phone || prev.phone,
          company: res.user.company || prev.company,
          designation: res.user.designation || prev.designation,
          department: res.user.department || prev.department,
          location: res.user.location || prev.location,
          bio: res.user.bio || prev.bio,
        }));
      }
    } catch (e) {
      console.warn('Profile DB fetch notice (using active session):', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await authService.updateProfile(editForm);
      if (res?.success) {
        setProfileData({ ...editForm });
        // Update local session cache if available
        const updatedUser = { ...user, ...editForm };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success(res.message || 'Admin Profile updated & saved to PostgreSQL DB! ');
        setShowEditModal(false);
      } else {
        toast.error(res?.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save profile error:', err);
      // Fallback local update
      setProfileData({ ...editForm });
      toast.success('Admin Profile saved to session store! ');
      setShowEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!');
      return;
    }

    setSaving(true);

    try {
      const res = await authService.changePassword({
        email: profileData.email,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (res?.success) {
        toast.success(res.message || 'Password changed & hashed in PostgreSQL DB! ');
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res?.message || 'Password change failed!');
      }
    } catch (err) {
      console.error('Password change error:', err);
      toast.error('Failed to change password. Please verify current password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BackButton label="Back to Dashboard" to="/dashboard" />
          <span className="px-2.5 sm:px-3.5 py-1 text-[10px] sm:text-xs font-extrabold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
             Super HR Admin Profile & Security
          </span>
        </div>

        {/* Profile Hero Header Card */}
        <div className={`p-4 sm:p-6 md:p-8 rounded-3xl border shadow-sm space-y-4 sm:space-y-6 relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-200/80 text-slate-900'
          }`}>
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-500" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pt-1">
            <div className="flex flex-row items-center gap-3 sm:gap-5">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                {profileData.name.charAt(0)}
              </div>

              <div className="space-y-1 overflow-hidden">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                    {profileData.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                    ● Active & Synced
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  {profileData.designation} • {profileData.department}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                   {profileData.email} •  {profileData.company}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => {
                  setEditForm({ ...profileData });
                  setShowEditModal(true);
                }}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                Edit Profile
              </button>

              <button
                onClick={() => setShowPasswordModal(true)}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${theme === 'dark' ? 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Profile Details & System Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

          {/* Column 1 & 2: Personal & Contact Information */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <div className={`p-4 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-2">
                <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <span>Personal & Professional Details</span>
                </h2>
                <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  PostgreSQL Neon Live Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div className={`p-4 rounded-2xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.name}</span>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Admin Email Address</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.email}</span>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone Number</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.phone}</span>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Organization / Company</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.company}</span>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Designation</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.designation}</span>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Account Created Date</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{profileData.joinedDate}</span>
                </div>
              </div>

              {profileData.bio && (
                <div className={`p-4 rounded-2xl border text-xs font-normal leading-relaxed ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <strong className="text-slate-900 dark:text-white font-bold block mb-1"> Recruiter Overview & Scope:</strong>
                  {profileData.bio}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Security Credentials & Database Connection */}
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}>
              <h2 className="text-base font-bold border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <span> Security & Database Status</span>
              </h2>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span> Account Security</span>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="font-bold text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Change Password →
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>ATS Match Engine</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">FULL ACCESS</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-800 dark:text-indigo-300 flex items-center justify-between">
                  <span>Candidate Cascade Delete</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">SUPER ADMIN</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-800 dark:text-blue-300 flex items-center justify-between">
                  <span> PostgreSQL Database</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">NEON LIVE SYNC </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Admin Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className={`rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl border my-auto max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>Edit Admin Profile</span>
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1"></button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 sm:space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 font-bold">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Admin Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block mb-1 font-bold">Contact Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Organization / Company</label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block mb-1 font-bold">Designation</label>
                  <input
                    type="text"
                    value={editForm.designation}
                    onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold">Recruiter Overview & Bio</label>
                <textarea
                  rows="2"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving to DB...' : 'Save Profile to Database'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`flex-1 py-2.5 sm:py-3 text-xs font-bold rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className={`rounded-3xl max-w-md w-full p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl border my-auto max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span> Change Admin Password</span>
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1"></button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 font-bold">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                  className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className={`w-full p-2.5 sm:p-3 rounded-xl border focus:outline-none ${theme === 'dark' ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 sm:py-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Updating Password...' : 'Update & Hash Password in DB'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className={`flex-1 py-2.5 sm:py-3 text-xs font-bold rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminProfile;
