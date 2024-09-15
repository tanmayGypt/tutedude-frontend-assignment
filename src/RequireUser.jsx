import { useEffect } from "react";
import Cookies from "js-cookie";
import { Outlet, useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

function RequireUser() {
  const user = Cookies.get("profile");
  const navigate = useNavigate();
  console.log(user);
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  return user ? <Outlet /> : navigate("/login");
}

export default RequireUser;
