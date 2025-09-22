import { useEffect, useState } from 'react'
import { Search } from 'lucide-react';
import UserCard from '../components/UserCard';
import Select from "react-select";
import api from '../api/axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchUser } from '../features/user/userSlice';

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

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("native");
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers();
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
  }, []);
  const fetchUsers = async (searchInput = "", filter = {}) => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/discover",
        { input: searchInput, filter },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      data.success ? setUsers(data.users) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      fetchUsers(input, {
        type: filterType,
        languages: selectedLanguages.map((l) => l.value),
      });
      setInput("");
    }
  };
  const applyFilter = () => {
    fetchUsers(input, {
      type: filterType,
      languages: selectedLanguages.map((l) => l.value),
    });
  };
  return (
    <div className='min-h-screen bg-gradient-to-b from-transition1 via-transition2 to-background'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-primary mb-2'>Discover People</h1>
          <p className='text-foreground'>Connect with amazing people and grow your network.</p>
        </div>
        {/* Filter Section */}
        <div className="mb-8 bg-background/90 p-4 rounded-md shadow-md w-full sm:max-w-[912px]">
          <div className="flex gap-4 mb-4">            
            <button
              className={`px-3 py-1 rounded-md ${filterType === "native"
                  ? "futton"
                  : "bg-gray-200 text-gray-800"
                }`}
              onClick={() => setFilterType("native")}
            >
              Native
            </button>
            <button
              className={`px-3 py-1 rounded-md ${filterType === "fluent"
                  ? "futton"
                  : "bg-gray-200 text-gray-800"
                }`}
              onClick={() => setFilterType("fluent")}
            >
              Fluent
            </button>
          </div>
          {/* Language Multi-Select */}
          <Select
            isMulti
            options={languageOptions}
            value={selectedLanguages}
            onChange={(langs) => setSelectedLanguages(langs)}
            placeholder="Select languages..."
            className="w-full"
          />
          <div className="mt-4">
            <button
              onClick={applyFilter}
              className="futton px-4 py-2 rounded-md"
            >
              Apply Filter
            </button>
          </div>
        </div>

        {/* Search */}
        <div className='mb-8 shadow-md rounded-md bg-background w-full sm:max-w-[912px]'>
          <div className='p-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground w-5 h-5' />
              <input type="text" placeholder='Search people by name, username, bio or location...' className='pl-10 sm:pl-12 py-2 w-full
              border border-border/70 rounded-md max-sm:text-sm placeholder:text-foreground/75' onChange={(e) => setInput(e.target.value)}
                value={input} onKeyUp={handleSearch} />
            </div>
          </div>
        </div>
        <div className='flex flex-wrap gap-6 max-sm:justify-center'>
          {users.map((user) => (<UserCard user={user} key={user._id} />))}
        </div>
        {loading &&
          <div className='flex items-start justify-center h-screen bg-transparent mt-20' >
            <div className='w-10 h-10 rounded-full border-3 border-rose-800 border-t-transparent animate-spin'>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export default Discover
