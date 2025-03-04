import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminRequireAuth = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      fetch("https://yappari-coffee-bar.shop/api/check_admin_session", {
        credentials: "include", // ✅ Sends session cookie
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) {
            navigate("/"); // ✅ Move navigation inside useEffect
          } else {
            setIsAdmin(true);
          }
        })
        .catch(() => navigate("/"));
    }, [navigate]); // ✅ Add navigate as a dependency
  
    if (isAdmin === null) return <p>Loading...</p>; // ✅ Prevent flickering
  
    return isAuthenticated ? children : null; // ✅ Don't navigate in render
  };
  
  export default AdminRequireAuth;