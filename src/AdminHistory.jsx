import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye } from "react-icons/fa"; // Make sure to import this icon

const AdminHistory = () => {
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // For popup details

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

  // Function to handle showing order details
  const handleViewDetails = (order) => {
    // Parse order_details if it's a JSON string
    let parsedDetails = [];
    try {
      if (typeof order.order_details === 'string') {
        parsedDetails = JSON.parse(order.order_details);
      } else if (Array.isArray(order.order_details)) {
        parsedDetails = order.order_details;
      } else {
        console.error("Order details is neither a string nor an array:", order.order_details);
        parsedDetails = [];
      }
      
      // Check if parsedDetails is valid and has items
      if (!Array.isArray(parsedDetails) || parsedDetails.length === 0) {
        console.warn("No items found in order details or invalid format");
        parsedDetails = [{ food_name: "No items found", size: "-", quantity: 0, price: 0 }];
      }
      
      console.log("Parsed order details:", parsedDetails); // Debug log
    } catch (error) {
      console.error("Error parsing order details:", error, order.order_details);
      parsedDetails = [{ food_name: "Error parsing order details", size: "-", quantity: 0, price: 0 }];
    }
    
    // Set selected order with parsed details
    setSelectedOrder({
      ...order,
      items: parsedDetails
    });
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
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Details</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Total</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Location</th>
                    <th className="px-4 py-2 text-left text-sm text-[#808080]">Phone</th>
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
                        <td className="px-4 py-2 text-sm">
                          <button onClick={() => handleViewDetails(order)} className="text-blue-500 hover:text-blue-700">
                            <FaEye />
                          </button>
                        </td>
                        <td className="px-4 py-2 text-sm">₱{parseFloat(order.total).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{order.location}</td>
                        <td className="px-4 py-2 text-sm">{order.phone}</td>
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

      {/* Order Details Popup */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
            {/* Order Summary */}
            <div className="border-b pb-2 mb-4">
              <p className="text-sm">
                <span className="font-bold text-blue-700">Order number:</span> {selectedOrder.order_id}
              </p>
              <p className="text-sm">
                <span className="font-bold text-blue-700">Date:</span> {selectedOrder.date}
              </p>
              <p className="text-sm">
                <span className="font-bold text-blue-700">Total cost:</span> ₱{parseFloat(selectedOrder.total).toFixed(2)}
              </p>
              <p className="text-sm">
                <span className="font-bold text-blue-700">Service option:</span> {selectedOrder.shipping_method || "N/A"}
              </p>
            </div>

            {/* Order Items Table */}
            <div>
              <div className="grid grid-cols-4 font-semibold text-gray-700 border-b pb-2">
                <p>Food</p>
                <p>Size</p>
                <p>Quantity</p>
                <p>Price</p>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 text-sm py-2 border-b">
                    <p>{item.food_name || item.item_name || "Unknown item"}</p>
                    <p>{item.size || "-"}</p>
                    <p>{item.quantity || 0}</p>
                    <p>₱{typeof item.price === 'number' ? item.price.toFixed(2) : 
                      (parseFloat(item.price) ? parseFloat(item.price).toFixed(2) : "0.00")}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No item details available</div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;


