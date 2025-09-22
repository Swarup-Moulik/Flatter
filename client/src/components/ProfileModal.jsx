import { useState } from 'react'
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/user/userSlice';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Select from 'react-select';

const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
    { value: 'Russian', label: 'Russian' },
    { value: 'German', label: 'German' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Korean', label: 'Korean' },
    { value: 'Chinese', label: 'Chinese' },
    // ✅ add more as you like
];

const ProfileModal = ({ setShowEdit }) => {
    const user = useSelector((state) => state.user.value);
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const [editForm, setEditForm] = useState({
        username: user.username,
        bio: user.bio,
        location: user.location,
        profile_picture: null,
        cover_photo: null,
        full_name: user.full_name,
        languages: {
            native: user.languages?.native || [],
            fluent: user.languages?.fluent || [],
            learning: user.languages?.learning || [],
        }
    });
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            const userData = new FormData();
            const { full_name, username, bio, location, profile_picture, cover_photo, languages } = editForm;
            userData.append('username', username);
            userData.append('bio', bio);
            userData.append('location', location);
            userData.append('full_name', full_name);
            userData.append('native', JSON.stringify(languages.native));
            userData.append('fluent', JSON.stringify(languages.fluent));
            userData.append('learning', JSON.stringify(languages.learning));
            profile_picture && userData.append('profile', profile_picture);
            cover_photo && userData.append('cover', cover_photo);
            const token = await getToken();
            dispatch(updateUser({ userData, token }));
            setShowEdit(false);
        } catch (error) {
            toast.error(error.message);
        }
    }
    const handleLangChange = (field, selected) => {
        setEditForm({
            ...editForm,
            languages: {
                ...editForm.languages,
                [field]: selected.map(s => s.value)
            }
        });
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
            <div className='max-w-2xl sm:py-6 mx-auto'>
                <div className='bg-background rounded-lg shadow p-6'>
                    <h1 className='text-2xl font-bold text-primary mb-6'>Edit Profile</h1>
                    <form className='space-y-4' onSubmit={(e) => toast.promise(handleSaveProfile(e), { loading: 'Saving...' })}>
                        {/* Profile Picture */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor="profile_picture" className='block text-sm font-medium text-foreground mb-1'>
                                Profile Picture
                                <input type="file" accept='image/*' id='profile_picture' className='w-full p-3 border border-gray-200 
                                rounded-lg' onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.files[0] })} hidden />
                                <div className='group/profile relative'>
                                    <img src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user.profile_picture}
                                        className='w-24 h-24 rounded-full object-cover mt-2' alt="User Profile Picture" />
                                    <div className='absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20
                                    rounded-full items-center justify-center'>
                                        <Pencil className='w-5 h-5 text-white' />
                                    </div>
                                </div>
                            </label>
                        </div>
                        {/* Cover Photo */}
                        <div className='flex flex-col items-start gap-3'>
                            <label htmlFor="cover_photo" className='block text-sm font-medium text-foreground mb-1'>
                                Profile Picture
                                <input type="file" accept='image/*' id='cover_photo' className='w-full p-3 border border-gray-200 
                                rounded-lg' onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })} hidden />
                                <div className='group/profile relative'>
                                    <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user.cover_photo}
                                        className='w-80 h-40 rounded-lg object-cover mt-2 bg-gradient-to-r from-amber-300 via-orange-300
                                         to-yellow-200' alt="User Profile Picture" />
                                    <div className='absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20
                                    rounded-lg items-center justify-center'>
                                        <Pencil className='w-5 h-5 text-white' />
                                    </div>
                                </div>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Name
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your full name'
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} value={editForm.full_name} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Username
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a username'
                                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} value={editForm.username} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Bio
                            </label>
                            <textarea className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a short bio'
                                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} value={editForm.bio} rows={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Location
                            </label>
                            <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your location'
                                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} value={editForm.location} />
                        </div>
                        {/* Languages Selection */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Native Languages</label>
                            <Select
                                isMulti
                                options={languageOptions}
                                value={editForm.languages.native.map(l => ({ value: l, label: l }))}
                                onChange={(selected) => handleLangChange('native', selected)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Fluent Languages</label>
                            <Select
                                isMulti
                                options={languageOptions}
                                value={editForm.languages.fluent.map(l => ({ value: l, label: l }))}
                                onChange={(selected) => handleLangChange('fluent', selected)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Learning Languages</label>
                            <Select
                                isMulti
                                options={languageOptions}
                                value={editForm.languages.learning.map(l => ({ value: l, label: l }))}
                                onChange={(selected) => handleLangChange('learning', selected)}
                            />
                        </div>
                        <div className='flex justify-end space-x-3 pt-6'>
                            <button className='px-4 py-2 border rounded-lg text-foreground hover:bg-border/55
                            transition-colors cursor-pointer' type='button' onClick={() => setShowEdit(false)}>Cancel</button>
                            <button className='px-4 py-2 futton rounded-lg transition-colors cursor-pointer' type='submit'>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProfileModal
