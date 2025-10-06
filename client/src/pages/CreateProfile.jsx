import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { updateUser } from '../features/user/userSlice.js';
import Theme from '../components/Theme'
import { assets } from '../assets/assets.js';


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
];

const CreateProfile = () => {
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const { user } = useUser();
    const [form, setForm] = useState({
        full_name: '',
        username: '',
        bio: '',
        location: '',
        profile_picture: null,
        cover_photo: null,
        languages: {
            native: [],
            fluent: [],
            learning: [],
        },
    });
    const handleLangChange = (field, selected) => {
        setForm({
            ...form,
            languages: {
                ...form.languages,
                [field]: selected.map((s) => s.value),
            },
        });
    };
    const handleCreateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const userData = new FormData();
            const { full_name, username, bio, location, profile_picture, cover_photo, languages } = form;
            const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;
            console.log('Clerk user object:', user);
            console.log('Extracted email:', email);
            if (!email) {
                throw new Error('Email not found. Please try again.');
            }
            if (!username.trim()) {
                throw new Error('Username is required');
            }
            if (!full_name.trim()) {
                throw new Error('Full name is required');
            }
            userData.set('email', email);
            userData.append('full_name', full_name);
            userData.append('username', username);
            userData.append('bio', bio);
            userData.append('location', location);
            userData.append('native', JSON.stringify(languages.native));
            userData.append('fluent', JSON.stringify(languages.fluent));
            userData.append('learning', JSON.stringify(languages.learning));
            if (profile_picture) userData.append('profile', profile_picture);
            if (cover_photo) userData.append('cover', cover_photo);          
            const result = await dispatch(updateUser({ userData, token })).unwrap();
            if (result) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            toast.error(error.message || 'Failed to create profile');
        }
    };
    const customSelectStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: 'var(--background)',
            borderColor: 'var(--primary)',
            color: 'var(--foreground)',
        }),
        option: (base, state) => ({
            ...base,
            color: state.isSelected ? '#fff' : '#111', // darker text for options
            backgroundColor: state.isSelected ? '#4f46e5' : 'transparent',
            '&:hover': {
                backgroundColor: '#e0e0e0',
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: '#111', // darker text for selected item
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#111', // darker tag text
        }),
    };
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-transition1 via-transition2 
        to-background p-5">
            <div className="absolute top-4 left-4 bg-background/80 rounded-3xl">
                <Theme />
            </div>
            <div className="max-w-2xl w-full bg-background rounded-xl shadow p-6">
                <h1 className="text-3xl font-bold text-primary mb-6 text-center">Welcome to the Journey</h1>
                <form className="space-y-5" onSubmit={(e) => toast.promise(handleCreateProfile(e), { loading: 'Creating...' })}>
                    {/* Profile Picture */}
                    <div>
                        <label className="block font-medium text-foreground mb-1">Profile Picture</label>
                        <label htmlFor="profileUpload" className="cursor-pointer inline-block">
                            <img
                                src={!form.profile_picture ? assets.upload_area : URL.createObjectURL(form.profile_picture)}
                                alt="Profile Preview"
                                className="w-24 h-24 rounded-full object-cover mt-3"
                            />
                        </label>
                        <input
                            id="profileUpload"
                            type="file"
                            accept="image/*"
                            className="w-full border rounded-lg p-2 cursor-pointer"
                            onChange={(e) => setForm({ ...form, profile_picture: e.target.files[0] })}
                            hidden
                        />
                    </div>
                    {/* Cover Photo */}
                    <div>
                        <label className="block font-medium text-foreground mb-1">Cover Photo</label>
                        <label htmlFor="coverUpload" className="cursor-pointer block">
                            <img
                                src={!form.cover_photo ? assets.upload_area : URL.createObjectURL(form.cover_photo)}
                                alt="Cover Preview"
                                className="w-100 h-50 rounded-lg mt-3"
                            />
                        </label>
                        <input
                            id="coverUpload"
                            type="file"
                            accept="image/*"
                            className="w-full border rounded-lg p-2 cursor-pointer"
                            onChange={(e) => setForm({ ...form, cover_photo: e.target.files[0] })}
                            hidden
                        />
                    </div>
                    {/* Basic Info */}
                    <div>
                        <label className="block font-medium text-foreground mb-1">Full Name</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-3 placeholder:text-primary/60"
                            placeholder="Enter your full name"
                            value={form.full_name}
                            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-foreground mb-1">Username</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-3 placeholder:text-primary/60"
                            placeholder="Choose a username"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-foreground mb-1">Bio</label>
                        <textarea
                            className="w-full border rounded-lg p-3 placeholder:text-primary/60"
                            placeholder="Write something about yourself..."
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-foreground mb-1">Location</label>
                        <input
                            type="text"
                            className="w-full border rounded-lg p-3 placeholder:text-primary/60"
                            placeholder="Enter your location"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                        />
                    </div>
                    {/* Languages */}
                    <div>
                        <label className="block font-medium text-foreground mb-1">Native Languages</label>
                        <Select
                            isMulti
                            options={languageOptions}
                            onChange={(selected) => handleLangChange('native', selected)}
                            styles={customSelectStyles}
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-foreground mb-1">Fluent Languages</label>
                        <Select
                            isMulti
                            options={languageOptions}
                            onChange={(selected) => handleLangChange('fluent', selected)}
                            styles={customSelectStyles}
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-foreground mb-1">Learning Languages</label>
                        <Select
                            isMulti
                            options={languageOptions}
                            onChange={(selected) => handleLangChange('learning', selected)}
                            styles={customSelectStyles}
                        />
                    </div>
                    {/* Submit Button */}
                    <div className="pt-6 text-center">
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-lg futton text-primary transition-colors cursor-pointer"
                        >
                            Create Profile
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateProfile
