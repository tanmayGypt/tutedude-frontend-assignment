import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
// import { fireEvent } from "@testing-library/react";

const ProfileUser = Cookies.get("user");
// const hashmap = new Map();
async function fetchUser(userId) {
  const res = await axios.get(`${process.env.BASE_URL}/api/friends/`, {
    userId: ProfileUser,
  });
  return res.data;
}

const Home = () => {
  const [users, setUsers] = useState([]);
  const [Filteredusers, setFilteredUsers] = useState([]);
  const [Friends, setMySet] = useState(new Set());
  const [mainUser, setMainUser] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendList, setFriendList] = useState([]);
  const [searchItem, setSearchTerm] = useState(null);
  const [FriendOfFriends, setFriendOfFriends] = useState(null);
  const [activeTab, setActiveTab] = useState("friends"); // Track active tab
  const navigate = useNavigate();
  function GetMutualFriends() {
    let ans = [];
    console.log(mainUser);
    let n = friendList.length;
    for (let i = 0; i < n; i++) {
      let peer = friendList[i];

      const temp = new Set(peer.friends.map((friend) => friend));
      const filteredFriends = users.filter(
        (user) =>
          temp.has(user._id) &&
          user._id !== ProfileUser &&
          !Friends.has(user._id)
      );
      ans = [...filteredFriends];
      setFriendOfFriends(ans);
      console.log(ans);
    }
  }
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
      let arr = usersData.filter((user) => user.username !== ProfileUser);
      setUsers(arr);

      // Find the main user in the users list
      const mainUser = usersData.find((user) => user.username === ProfileUser);
      setMainUser(mainUser);

      if (mainUser) {
        // Friend requests
        const friendRequestIds = new Set(
          mainUser.friendRequests.map((request) => request._id)
        );
        const filteredRequests = usersData.filter((user) =>
          friendRequestIds.has(user._id)
        );
        setFriendRequests(filteredRequests);

        // Friends list
        const friendIds = new Set(mainUser.friends.map((friend) => friend));
        setMySet(friendIds);

        const filteredFriends = usersData.filter((user) =>
          friendIds.has(user._id)
        );
        setFriendList(filteredFriends);
      }
    };

    fetchData();
    GetMutualFriends();
  });

  // Add Friend Functionality
  async function handleAddFriend(friendId) {
    try {
      const res = await axios.post(
        `${process.env.BASE_URL}/api/friends/add-friend`,
        { friendId, userId: ProfileUser },
        { withCredentials: true }
      );
      console.log(res);

      toast.success("Friend Request sent successfully");
      // console.log(res);
    } catch (err) {
      toast.error("Error Sending friend request");
      // console.error(err);
    }
  }
  function handleLogout() {
    Cookies.remove("user");
    Cookies.remove("profile");
    toast.success("You have successfully logged out");
  }
  // Accept Friend Request
  async function handleFriendRequest(friendId) {
    try {
      const res = await axios.post(
        `${process.env.BASE_URL}/api/friends/accept-friend`,
        { friendId, userId: ProfileUser },
        { withCredentials: true }
      );
      console.log(res);
      toast.success("Friend Request Accepted ");
      // console.log(res);
    } catch (err) {
      toast.error("Error Accepting friend request");

      // console.error(err);
    }
  }

  // Unfriend Functionality
  async function handleUnfriend(friendId) {
    try {
      const res = await axios.post(
        `${process.env.BASE_URL}/api/friends/unfriend`,
        { friendId, userId: ProfileUser },
        { withCredentials: true }
      );
      console.log(res);
      toast.success("Succesfully Unfriended");
      // console.log(res.data);
    } catch (err) {
      toast.error("Error while unfriend");

      // console.error(err);
    }
  }

  // Redirect to login if no user is found in cookies
  const user = Cookies.get("profile");
  if (!user) return navigate("/login");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Friend Management{" "}
          <div className="text-blue-500">
            <spam className="text-blue-500 text-2xl">
              Your Username: <spam className="text-red-500">{ProfileUser}</spam>
            </spam>
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

        {/* Tabs Content */}
        <div>
          {activeTab === "friends" && (
            <>
              <div className="mb-10">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                  Friends List
                </h3>
                {friendList?.length > 0 ? (
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
              </div>{" "}
              {true && (
                <div className="mb-10">
                  <h3 className="text-xl font-semibold text-gray-600 mb-4">
                    People You May Know
                  </h3>
                  {FriendOfFriends?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {FriendOfFriends?.map((friend) => (
                        <div
                          key={friend._id}
                          className="bg-blue-100 p-4 rounded-lg shadow-md text-center"
                        >
                          <p className="text-lg font-medium text-blue-800">
                            {friend.username}
                          </p>
                          <button
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-400 transition"
                            onClick={() => handleUnfriend(friend._id)}
                          >
                            Add Friend
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Sorry, we have no suggestions yet
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === "search" && (
            <div className="p-4">
              <h3 className="text-2xl font-bold text-gray-700 mb-6">
                Search Users
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchItem}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ml-4 border border-gray-300 text-sm rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </h3>

              {Filteredusers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) =>
                    user.username !== ProfileUser ? (
                      <div
                        key={user._id}
                        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center"
                      >
                        <p className="text-lg font-semibold text-gray-800 mb-2">
                          {user.username}
                        </p>
                        <button
                          className={`mt-4 ${
                            Friends.has(user._id)
                              ? "bg-red-500 hover:bg-red-400"
                              : "bg-green-500 hover:bg-green-400"
                          } text-white px-4 py-2 rounded-lg transition duration-300 ease-in-out`}
                          onClick={() => handleAddFriend(user._id)}
                        >
                          {Friends.has(user._id) ? "Unfriend" : "Add Friend"}
                        </button>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-4">No users found</p>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="my-4">
              <h3 className="text-xl font-semibold text-gray-600 mb-4">
                Friend Requests
              </h3>
              {friendRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {friendRequests.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white border p-4 rounded-lg shadow-md flex flex-col items-center justify-between"
                    >
                      <p className="text-lg font-medium text-gray-700">
                        {user.username}
                      </p>
                      <button
                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                        onClick={() => handleFriendRequest(user._id)}
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No friend requests found</p>
              )}
            </div>
          )}
        </div>
        <button
          className={`py-2 px-6 font-semibold text-lg w-full ${"text-white bg-red-500"} rounded-l-lg border-r-0 border border-blue-500`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
