import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";

const ProfileUser = Cookies.get("user");

async function fetchUser(userId) {
  const res = await axios.get(
    `https://tutedude-assignment-backend.onrender.com/api/friends/`,
    {
      userId: ProfileUser,
    },
    { withCredentials: true }
  );
  return res.data;
}

const Home = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [mainUser, setMainUser] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [searchItem, setSearchTerm] = useState("");
  const [friendOfFriends, setFriendOfFriends] = useState([]);
  const [activeTab, setActiveTab] = useState("friends");
  const navigate = useNavigate();
  console.log(mainUser);

  // Filter users based on search input
  useEffect(() => {
    const searchUsers = () => {
      if (!searchItem) {
        setFilteredUsers(users);
      } else {
        const lowercasedSearchTerm = searchItem.toLowerCase();
        const filtered = users.filter((user) =>
          user.username.toLowerCase().includes(lowercasedSearchTerm)
        );
        setFilteredUsers(filtered);
      }
    };
    searchUsers();
  }, [searchItem, users]);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await fetchUser(ProfileUser);
      const filteredUsers = usersData.filter(
        (user) => user.username !== ProfileUser
      );
      setUsers(filteredUsers);

      const mainUser = usersData.find((user) => user.username === ProfileUser);
      setMainUser(mainUser);

      if (mainUser) {
        const friendRequestIds = new Set(
          mainUser.friendRequests.map((request) => request._id)
        );
        const filteredRequests = usersData.filter((user) =>
          friendRequestIds.has(user._id)
        );
        setFriendRequests(filteredRequests);

        const friendIds = new Set(mainUser.friends);
        const filteredFriends = usersData.filter((user) =>
          friendIds.has(user._id)
        );
        setFriendList(filteredFriends);
        setFriends(Array.from(friendIds));
      }
    };
    const getMutualFriends = () => {
      const mutualFriends = [];

      friendList.forEach((peer) => {
        const peerFriendsSet = new Set(peer.friends);
        const filteredFriends = users.filter(
          (user) =>
            peerFriendsSet.has(user._id) &&
            user._id !== ProfileUser &&
            !friends.includes(user._id)
        );
        mutualFriends.push(...filteredFriends);
      });

      setFriendOfFriends(mutualFriends);
    };

    getMutualFriends();
    fetchData();
  }, [friendList, users, friends]);

  async function handleAddFriend(friendId) {
    try {
      await axios.post(
        `https://tutedude-assignment-backend.onrender.com/api/friends/add-friend`,
        { friendId, userId: ProfileUser },
        { withCredentials: true }
      );
      toast.success("Friend Request sent successfully");
    } catch {
      toast.error("Error Sending friend request");
    }
  }

  function handleLogout() {
    Cookies.remove("user");
    Cookies.remove("profile");
    toast.success("You have successfully logged out");
    navigate("/login");
  }

  async function handleFriendRequest(friendId) {
    try {
      await axios.post(
        `https://tutedude-assignment-backend.onrender.com/api/friends/accept-friend`,
        { friendId, userId: ProfileUser },
        { withCredentials: true }
      );
      toast.success("Friend Request Accepted");
    } catch {
      toast.error("Error Accepting friend request");
    }
  }

  async function handleUnfriend(friendId) {
    try {
      await axios.post(
        `https://tutedude-assignment-backend.onrender.com/api/friends/unfriend`,
        { friendId, userId: ProfileUser },
        { withCredentials: true }
      );
      toast.success("Successfully Unfriended");
    } catch {
      toast.error("Error while unfriend");
    }
  }

  if (!Cookies.get("profile")) return navigate("/login");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Friend Management
          <div className="text-blue-500">
            <span className="text-blue-500 text-2xl">
              Your Username:{" "}
              <span className="text-red-500">{mainUser?.username}</span>
            </span>
          </div>
        </h2>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <button
            className={`py-2 px-6 font-semibold text-lg ${
              activeTab === "friends"
                ? "text-white bg-blue-500"
                : "text-blue-500 bg-white"
            } rounded-l-lg border-r-0 border border-blue-500`}
            onClick={() => setActiveTab("friends")}
          >
            Friends List
          </button>
          <button
            className={`py-2 px-6 font-semibold text-lg ${
              activeTab === "search"
                ? "text-white bg-blue-500"
                : "text-blue-500 bg-white"
            } border border-blue-500`}
            onClick={() => setActiveTab("search")}
          >
            Search Users
          </button>
          <button
            className={`py-2 px-6 font-semibold text-lg ${
              activeTab === "requests"
                ? "text-white bg-blue-500"
                : "text-blue-500 bg-white"
            } rounded-r-lg border-l-0 border border-blue-500`}
            onClick={() => setActiveTab("requests")}
          >
            Friend Requests
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "friends" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              Friends List
            </h3>
            {friendList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendList.map((friend) => (
                  <div
                    key={friend._id}
                    className="bg-blue-100 p-4 rounded-lg shadow-md text-center"
                  >
                    <p className="text-lg font-medium text-blue-800">
                      {friend.username}
                    </p>
                    <button
                      className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400 transition"
                      onClick={() => handleUnfriend(friend._id)}
                    >
                      Unfriend
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No friends yet</p>
            )}
            <h3 className="text-xl font-semibold text-gray-600 mb-4 mt-10">
              People You May Know
            </h3>
            {friendOfFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendOfFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="bg-blue-100 p-4 rounded-lg shadow-md text-center"
                  >
                    <p className="text-lg font-medium text-blue-800">
                      {friend.username}
                    </p>
                    <button
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 transition"
                      onClick={() => handleAddFriend(friend._id)}
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No mutual friends found</p>
            )}
          </div>
        )}

        {activeTab === "search" && (
          <div>
            <input
              type="text"
              placeholder="Search friends..."
              value={searchItem}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-blue-500 rounded px-4 py-2 w-full mb-4"
            />
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gray-100 p-4 rounded-lg shadow-md text-center"
                  >
                    <p className="text-lg font-medium text-gray-800">
                      {user.username}
                    </p>
                    <button
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 transition"
                      onClick={() => handleAddFriend(user._id)}
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No users found</p>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              Friend Requests
            </h3>
            {friendRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendRequests.map((request) => (
                  <div
                    key={request._id}
                    className="bg-yellow-100 p-4 rounded-lg shadow-md text-center"
                  >
                    <p className="text-lg font-medium text-yellow-800">
                      {request.username}
                    </p>
                    <button
                      className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition"
                      onClick={() => handleFriendRequest(request._id)}
                    >
                      Accept Request
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No friend requests</p>
            )}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            className="bg-red-500 text-white px-6 py-3 w-full rounded hover:bg-red-400 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
