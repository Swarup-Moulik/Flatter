import { Calendar, MapPin, PenBox, Verified } from 'lucide-react'
import moment from 'moment'

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
    const renderLanguages = (title, languages) => (
        <div>
            <h3 className="font-medium text-sm text-foreground">{title}</h3>
            {languages && languages.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-1">
                    {languages.map((lang, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
                        >
                            {lang}
                        </span>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-foreground/65 mt-1">Nothing selected</p>
            )}
        </div>
    )
    return (
        <div className='relative py-4 px-6 md:px-8 bg-background'>
            <div className='flex flex-col md:flex-row items-start gap-6'>
                <div className='w-32 h-32 border-4 border-background shadow-lg absolute -top-16 rounded-full'>
                    <img src={user.profile_picture} className='absolute rounded-full z-2' alt="User Profile Picture" />
                </div>
                <div className='w-full pt-16 md:pt-0 md:pl-36'>
                    <div className='flex flex-col md:flex-row items-start justify-between'>
                        <div>
                            <div className='flex items-center gap-3'>
                                <h1 className='text-2xl font-bold text-primary'>{user.full_name}</h1>
                                <Verified className='w-6 h-6 text-blue-600' />
                            </div>
                            <p className='text-gray-600'>{user.username ? `@${user.username}` : 'Add a username'}</p>
                        </div>
                        {/* Edit Button in one's own profile */}
                        {!profileId && <button className='flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 
                        rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer' onClick={() => setShowEdit(true)}>
                            <PenBox className='w-4 h-4' />Edit
                        </button>}
                    </div>
                    <p className='text-foreground text-sm max-w-md mt-4'>{user.bio}</p>
                    <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/85 mt-4'>
                        <span className='flex items-center gap-1.5'>
                            <MapPin className='w-4 h-4' />{user.location ? `${user.location}` : 'Add Location'}
                        </span>
                        <span className='flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4' />Joined<span className='font-medium'>{moment(user.createdAt).fromNow()}</span>
                        </span>
                    </div>
                    {/* 🔥 Languages Section */}
                    <div className="mt-6 space-y-4 border-t border-gray-200 pt-4">
                        {renderLanguages('Native Languages', user.languages?.native)}
                        {renderLanguages('Fluent Languages', user.languages?.fluent)}
                        {renderLanguages('Learning Languages', user.languages?.learning)}
                    </div>
                    <div className='flex items-center gap-6 mt-6 border-t border-gray-200 pt-4'>
                        <div>
                            <span className='sm:text-xl font-bold text-primary'>{posts.length}</span>
                            <span className='text-xs sm:text-sm text-foreground ml-1.5'>Posts</span>
                        </div>
                        <div>
                            <span className='sm:text-xl font-bold text-primary'>{user.followers.length}</span>
                            <span className='text-xs sm:text-sm text-foreground ml-1.5'>Followers</span>
                        </div>
                        <div>
                            <span className='sm:text-xl font-bold text-primary'>{user.following.length}</span>
                            <span className='text-xs sm:text-sm text-foreground ml-1.5'>Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileInfo
