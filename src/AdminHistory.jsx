import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminHistory = () => {
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order history when component mounts
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://yappari-coffee-bar.shop/api/fetchOrderHistory.php",
          { withCredentials: true }
        );
        
        if (response.data.success) {
          setOrderHistory(response.data.orders);
        } else {
          setError(response.data.message || "Failed to fetch order history");
        }
      } catch (error) {
        console.error("Error fetching order history:", error);
        setError("An error occurred while fetching order history");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://admin.yappari-coffee-bar.shop/api/admin_logout.php",
        {},
        { withCredentials: true }
      );
      navigate("/admin/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#DCDEEA]">
      {/* Navbar */}
      <div className="w-full flex items-center justify-between py-4 px-12 shadow-md bg-white">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
          <img className="h-20 w-auto object-contain block" src="/img/YCB LOGO (BLUE).png" alt="Logo" />
        </div>
        <div className="text-xl text-[#1C359A] font-bold">Admin</div>
      </div>

      {/* Sidebar & Main Content */}
      <div className="flex flex-row h-full">
        {/* Sidebar */}
        <div className="w-52 flex-none bg-white shadow-md h-full flex flex-col p-4">
          <nav className="flex flex-col space-y-4">
            <Link to="/dashboard" className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800">
              <span>Orders</span>
            </Link>
            <Link to="/menu" className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800">
              <span>Menu</span>
            </Link>
            <Link to="/feedback" className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800">
              <span>Feedback</span>
            </Link>
            <Link to="/history" className="font-bold border-l-2 border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800 bg-gray-200">
              <span>Order History</span>
            </Link>
          </nav>

          {/* Logout Button */}
          <Link to={"/"} onClick={handleLogout} className='flex justify-center'>
            <button
              className="mt-20 font-bold flex items-center justify-center bg-[#1C359A] text-white px-12 text-sm py-2 rounded-lg hover:bg-blue-800"
            >
              SIGN OUT
            </button>
          </Link>
        </div>

        {/* Main Content (Order History) */}
        <div className="flex-1 w-full p-6 overflow-auto bg-[#DCDEEA]">
          {/* Header Section */}
          <div className="w-full flex justify-between mb-4">
            <div className="text-[#1C359A] text-lg font-bold">Order History</div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border-2 border-[#1C359A] text-black font-bold rounded-md flex items-center space-x-2 hover:bg-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 6h3m-4.5 6h6m-7.5 6h9"
                  />
                </svg>
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="w-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1C359A]"></div>
              <p className="mt-2 text-[#1C359A]">Loading order history...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="w-full text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {/* Table content */}
          {!loading && !error && (
            <div className="p-2 w-full mt-6 rounded-2xl">
              <table className="w-full bg-white opacity-90 rounded-2xl">
                <thead>
                  <tr className="border-t border-4 border-[#DCDEEA]">
                    <th className="p-3 text-left text-[#808080]">#</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Order #</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Date</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Name</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Order details</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Total</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Location</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.length > 0 ? (
                    orderHistory.map((order, index) => (
                      <tr key={order.id || index} className="border-t border-4 border-[#DCDEEA] hover:bg-gray-100">
                        <td className="p-3">{index + 1}</td>
                        <td className="px-4 py-2 text-sm">{order.order_id}</td>
                        <td className="px-4 py-2 text-sm">{order.date}</td>
                        <td className="px-4 py-2 text-sm">{order.customer_name}</td>
                        <td className="px-4 py-2 text-sm">{order.order_details}</td>
                        <td className="px-4 py-2 text-sm">₱{parseFloat(order.total).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{order.location}</td>
                        <td className="px-4 py-2 text-sm font-semibold text-green-600">{order.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-2 text-center">No completed orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHistory;