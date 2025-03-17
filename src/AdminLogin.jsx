import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AdminLogin = () => {
  const [admin_username, setAdminUsername] = useState('');
  const [admin_password, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("https://yappari-coffee-bar.shop/api/admin_login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_username, admin_password }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        Swal.fire('Success', 'Login successful!', 'success', {timer: 2000});
        
        // ✅ Wait before navigating to let the session persist
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Failed to connect to the server");
      console.error("Error:", error);
    }
  };
   

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md md:w-1/3 w-full">
        <h2 className="text-2xl font-bold text-center text-blue-800">Yappari Admin Login</h2>
        <p className="text-gray-600 text-center mt-2">Enter your admin details</p>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        <form onSubmit={handleLogin} className="mt-6">
          <div className="mb-4">
            <label className="block text-gray-700">Username
            <input
              type="text"
              id='admin_username'
              className="w-full p-3 mt-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your admin username"
              value={admin_username}
              onChange={(e) => setAdminUsername(e.target.value)}
              required
            />
            </label>
          </div>

         
          <div className="mb-4">
  <label className="block text-gray-700">Password
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      id='admin_password'
      className="w-full p-3 mt-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter your admin password"
      value={admin_password}
      onChange={(e) => setAdminPassword(e.target.value)}
      required
    />
    <button 
      type="button"
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
      style={{ marginTop: "8px" }}
      onClick={togglePasswordVisibility}
      tabIndex="-1"
    >
      {showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
  </label>
</div>

          <button type="submit" className="w-full bg-blue-800 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
