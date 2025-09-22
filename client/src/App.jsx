import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth, useUser } from '@clerk/clerk-react';
import toast, { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { fetchUser } from './features/user/userSlice';
import { fetchConnections } from './features/connections/connectionsSlice';
import { addMessage, removeMessage, updateMessage } from './features/messages/messagesSlice';
import Notifications from './components/Notifications';
import Loading from './components/Loading';

// Lazy loaded pages
const Login = lazy(() => import("./pages/Login"));
const Feed = lazy(() => import("./pages/Feed"));
const Messages = lazy(() => import("./pages/Messages"));
const ChatBox = lazy(() => import("./pages/ChatBox"));
const Connections = lazy(() => import("./pages/Connections"));
const Discover = lazy(() => import("./pages/Discover"));
const Profile = lazy(() => import("./pages/Profile"));
const CreatePost = lazy(() => import("./pages/CreatePost"));
const Layout = lazy(() => import("./pages/Layout"));

const App = () => {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  // Fetch user and connections once
  useEffect(() => {
    if (!isLoaded || !user) return;
    const fetchData = async () => {
      const token = await getToken();
      dispatch(fetchUser(token));
      dispatch(fetchConnections(token));
    }
    fetchData();
  }, [isLoaded, user, getToken, dispatch]);

  // Keep track of current pathname
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // EventSource for real-time messages
  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`
      );
      // eventSource.onmessage = (event) => {
      //   const message = JSON.parse(event.data);
      //   if (pathnameRef.current === `/messages/${message.from_user_id._id}`) {
      //     dispatch(addMessage(message));
      //   } else {
      //     toast.custom((t) => <Notifications t={t} message={message} />, { position: 'bottom-right' });
      //   }
      // };
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { type, message, messageId } = data; // Destructure the new data format

        // Case 1: Message unsent (by the sender)
        if (type === "unsent") {
          // Remove the message from the state for both users
          dispatch(removeMessage(messageId));
        }
        // Case 2: Message deleted (by the receiver, only for them)
        else if (type === "deleted_for_me") {
          // Remove the message from the state for the current user
          dispatch(removeMessage(messageId));
        }
        // Case 3: A message was corrected
        else if (type === "correction") {
          // Update the message in the state for both users
          dispatch(updateMessage(message));
        }
        // Case 4: A new message was sent
        else {
          if (pathnameRef.current === `/messages/${data.from_user_id._id}`) {
            dispatch(addMessage(data));
          } else {
            toast.custom((t) => <Notifications t={t} message={data} />, { position: 'bottom-right' });
          }
        }
      };
      return () => eventSource.close();
    }
  }, [user, dispatch]);


  if (!isLoaded) return <Loading />;

  return (
    <>
      <Toaster />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={!user ? <Login /> : <Layout />}>
            <Route index element={<Feed />} />
            <Route path='messages' element={<Messages />} />
            <Route path='messages/:userId' element={<ChatBox />} />
            <Route path='connections' element={<Connections />} />
            <Route path='discover' element={<Discover />} />
            <Route path='profile' element={<Profile />} />
            <Route path='profile/:profileId' element={<Profile />} />
            <Route path='create-post' element={<CreatePost />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}

export default App;
