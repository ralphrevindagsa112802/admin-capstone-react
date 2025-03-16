import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("daily");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [activeTab, setActiveTab] = useState("complete");
  const [completeOrders, setCompleteOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [dishesError, setDishesError] = useState(null);


  // Add this debugging code near the beginning of your component
useEffect(() => {
  console.log("Current state values:");
  console.log("totalOrders:", totalOrders);
  console.log("analyticsData:", analyticsData);
}, [totalOrders, analyticsData]);


  // Fetch analytics data based on selected time range
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://yappari-coffee-bar.shop/api/analytics.php",
          {
            params: { timeRange },
            withCredentials: true,
          }
        );
  
        console.log("Analytics API Response:", response.data);
        
        // Accept the full response object, which contains salesData, totalSales, etc.
        if (response.data) {
          setAnalyticsData(response.data);
          setError(null);
        } else {
          setError("Received invalid data format from server");
          setAnalyticsData(null);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
        setError("Failed to load analytics data. Please try again.");
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAnalyticsData();
  }, [timeRange]);
  
  // Fetch total sales from API
  useEffect(() => {
    const fetchTotalSales = async () => {
      try {
        const response = await axios.get(
          "https://yappari-coffee-bar.shop/api/total_sales",
          { withCredentials: true }
        );
        console.log("Total Sales API Response:", response.data);
        
        if (response.data && response.data.total_sales !== undefined) {
          setTotalSales(response.data.total_sales);
        } else {
          console.error("Invalid total_sales data:", response.data);
          setTotalSales(0); // Default to 0 if data is invalid
        }
      } catch (error) {
        console.error("Failed to fetch total sales:", error);
        setTotalSales(0); // Default to 0 on error
      }
    };

    fetchTotalSales();
  }, []);

  // Fetch user count from database
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get(
          "https://yappari-coffee-bar.shop/api/count",
          { withCredentials: true }
        );
        
        if (response.data && response.data.count !== undefined) {
          setUserCount(response.data.count);
        } else {
          console.error("Invalid user count data:", response.data);
          setUserCount(0); // Default to 0 if data is invalid
        }
      } catch (error) {
        console.error("Failed to fetch user count:", error);
        setUserCount(0); // Default to 0 on error
      }
    };

    fetchUserCount();
  }, []);

  // Fetch total orders from database
  // Fetch total orders from database - completely separate from analytics data
useEffect(() => {
  const fetchTotalOrders = async () => {
    try {
      // Make sure this API endpoint returns ALL orders regardless of status
      const response = await axios.get(
        "https://yappari-coffee-bar.shop/api/orders_count",
        { withCredentials: true }
      );
      console.log("Total Orders API Response:", response.data);
      
      // Handle different possible response formats
      if (response.data && typeof response.data.count === 'number') {
        setTotalOrders(response.data.count);
      } else if (response.data && response.data.success && typeof response.data.count === 'number') {
        setTotalOrders(response.data.count);
      } else if (typeof response.data === 'number') {
        setTotalOrders(response.data);
      } else {
        console.error("Invalid orders count data format:", response.data);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error("Failed to fetch total orders:", error);
      setTotalOrders(0);
    }
  };

  fetchTotalOrders();
}, []);

  // Fetch complete orders from database
  useEffect(() => {
    const fetchCompleteOrders = async () => {
      if (activeTab === "complete") {
        try {
          setLoadingOrders(true);
          const response = await axios.get(
            "https://yappari-coffee-bar.shop/api/complete_orders",
            { withCredentials: true }
          );
          
          console.log("Complete Orders API Response:", response.data);
          
          // Handle both response formats
          let orders = [];
          if (response.data && response.data.orders) {
            orders = response.data.orders;
          } else if (Array.isArray(response.data)) {
            orders = response.data;
          } else {
            console.error("Unexpected response format:", response.data);
            setOrdersError("Received invalid data format from server");
            setCompleteOrders([]);
            setLoadingOrders(false);
            return;
          }
          
          // Ensure orders is an array
          if (Array.isArray(orders)) {
            setCompleteOrders(orders);
            setOrdersError(null);
          } else {
            console.error("Orders is not an array:", orders);
            setOrdersError("Invalid data format received");
            setCompleteOrders([]);
          }
        } catch (error) {
          console.error("Failed to fetch complete orders:", error);
          const errorMessage = error.response?.status === 500 
            ? "Server error occurred. The development team has been notified."
            : "Failed to load complete orders. Please try again.";
          setOrdersError(errorMessage);
          setCompleteOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchCompleteOrders();
  }, [activeTab]);

  // Fetch cancelled orders
  useEffect(() => {
    const fetchCancelledOrders = async () => {
      if (activeTab === "cancelled") {
        try {
          setLoadingOrders(true);
          const response = await axios.get(
            "https://yappari-coffee-bar.shop/api/cancelled_ordersAdmin",
            { withCredentials: true }
          );

          console.log("Cancelled Orders API Response:", response.data);

          if (response.data && response.data.success && Array.isArray(response.data.orders)) {
            setCompleteOrders(response.data.orders);
            setOrdersError(null);
          } else if (Array.isArray(response.data)) {
            // Handle alternative response format
            setCompleteOrders(response.data);
            setOrdersError(null);
          } else {
            console.error("Unexpected API response:", response.data);
            setOrdersError("Invalid response format from server");
            setCompleteOrders([]);
          }
        } catch (error) {
          console.error("Fetch Cancelled Orders Error:", error.response?.data || error.message);

          const errorMessage =
            error.response?.status === 500
              ? "Server error occurred. Please check logs."
              : "Failed to load cancelled orders.";

          setOrdersError(errorMessage);
          setCompleteOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      }
    };

    fetchCancelledOrders();
  }, [activeTab]);

  // Fetch dishes
  useEffect(() => {
    const fetchDishes = async () => {
      if (activeTab === "dishes") {
        try {
          setLoadingDishes(true);
          const response = await axios.get("https://yappari-coffee-bar.shop/api/dishesAdmin.php", {
            withCredentials: true,
          });

          console.log("Dishes API Response:", response.data);

          if (response.data && response.data.success && Array.isArray(response.data.dishes)) {
            setDishes(response.data.dishes);
            setDishesError(null);
          } else if (Array.isArray(response.data)) {
            // Handle alternative response format
            setDishes(response.data);
            setDishesError(null);
          } else {
            console.error("Unexpected API response:", response.data);
            setDishes([]);
            setDishesError("Invalid response format from server");
          }
        } catch (error) {
          console.error("Fetch Dishes Error:", error.response?.data || error.message);
          setDishesError("Failed to load dishes.");
          setDishes([]);
        } finally {
          setLoadingDishes(false);
        }
      }
    };

    fetchDishes();
  }, [activeTab]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "https://yappari-coffee-bar.shop/api/admin_logout",
        {},
        { withCredentials: true }
      );
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  // Dashboard card
  const renderDashboardCards = () => {
    let displayTotalSales = totalSales || 0; // Default to state value
    let displayTotalOrders = totalOrders || 0; // Default to state value from API
    let displayTotalUsers = userCount || 0;
  
    // Only update sales and users from analyticsData if available
    if (!loading && !error && analyticsData) {
      if (Array.isArray(analyticsData)) {
        displayTotalSales = analyticsData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        // DO NOT update displayTotalOrders here
      } else if (typeof analyticsData === 'object') {
        if (analyticsData.totalSales !== undefined) {
          displayTotalSales = analyticsData.totalSales;
        }
        if (analyticsData.totalUsers !== undefined) {
          displayTotalUsers = analyticsData.totalUsers;
        }
        // DO NOT update displayTotalOrders from analyticsData
      }
    }
  
    const getTimeRangeText = () => {
      if (timeRange === "daily") return "Last 7 days";
      if (timeRange === "monthly") return "Last 12 months";
      return "Last year";
    };
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-[#E8E9F1] p-4 rounded-lg">
        {/* Total Sales Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-[#2F3A8F] text-xl font-bold mb-4">Total Sales</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-gray-800">₱{displayTotalSales.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-10">Total revenue</p>
          </div>
        </div>
        
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-[#2F3A8F] text-xl font-bold mb-4">Registered Users</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-gray-800">{displayTotalUsers}</p>
            <p className="text-sm text-gray-500 mt-10">Total registered accounts</p>
          </div>
        </div>
        
        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-[#2F3A8F] text-xl font-bold mb-4">Total Orders</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-gray-800">{displayTotalOrders}</p>
            <p className="text-sm text-gray-500 mt-10">All orders</p>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (loading) return <div className="text-center py-20">Loading data...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    
    // Extract the chart data from the response structure
    const chartData = analyticsData?.salesData || 
                     (Array.isArray(analyticsData) ? analyticsData : []);
    
    // If chartData is empty or not available
    if (!chartData || chartData.length === 0) {
      return <div className="text-center py-20">No data available for this time period</div>;
    }
    
    // Calculate chart dimensions
    const chartWidth = 700;
    const chartHeight = 300;
    const padding = 40;
    const availableWidth = chartWidth - (padding * 2);
    const availableHeight = chartHeight - (padding * 2);
    
    // Find max value for scaling (with safe fallback)
    const maxValue = Math.max(...chartData.map(item => parseFloat(item.amount) || 0), 1);
    
    // Generate SVG path for line chart
    const generatePath = () => {
      return chartData.map((item, index) => {
        const x = padding + (index * (availableWidth / (chartData.length - 1 || 1)));
        const y = chartHeight - padding - (((parseFloat(item.amount) || 0) / maxValue) * availableHeight);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <svg width={chartWidth} height={chartHeight}>
          {/* Y-axis */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={chartHeight - padding} 
            stroke="#888" 
            strokeWidth="1"
          />
          
          {/* X-axis */}
          <line 
            x1={padding} 
            y1={chartHeight - padding} 
            x2={chartWidth - padding} 
            y2={chartHeight - padding} 
            stroke="#888" 
            strokeWidth="1"
          />
          
          {/* Data line */}
          <path 
            d={generatePath()}
            fill="none"
            stroke="#1C359A"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {chartData.map((item, index) => {
            const x = padding + (index * (availableWidth / (chartData.length - 1 || 1)));
            const y = chartHeight - padding - (((parseFloat(item.amount) || 0) / maxValue) * availableHeight);
            return (
              <g key={index}>
                <circle 
                  cx={x} 
                  cy={y} 
                  r="4" 
                  fill="#1C359A"
                />
                <text 
                  x={x} 
                  y={chartHeight - padding + 20} 
                  textAnchor="middle" 
                  fontSize="10"
                >
                  {item.label || `Item ${index + 1}`}
                </text>
                <text 
                  x={x} 
                  y={y - 10} 
                  textAnchor="middle" 
                  fontSize="10"
                >
                  ₱{(parseFloat(item.amount) || 0).toLocaleString()}
                </text>
              </g>
            );
          })}
          
          {/* Y-axis labels */}
          <text 
            x={padding - 5} 
            y={chartHeight - padding} 
            textAnchor="end" 
            fontSize="10"
          >
            0
          </text>
          <text 
            x={padding - 5} 
            y={padding} 
            textAnchor="end" 
            fontSize="10"
          >
            ₱{maxValue.toLocaleString()}
          </text>
        </svg>
      </div>
    );
  };

  // Render tabs content
  const renderTabContent = () => {
    switch (activeTab) {
      case "complete":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Complete Orders</h3>
            <div className="text-gray-500">
              {loadingOrders ? (
                <p>Loading complete orders...</p>
              ) : ordersError ? (
                <p className="text-red-500">{ordersError}</p>
              ) : !completeOrders || completeOrders.length === 0 ? (
                <p>No complete orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completeOrders.map((order) => (
                        <tr key={order.id || order.order_id}>
                          <td className="px-6 py-4 whitespace-nowrap">ORD-{(order.order_id || "").toString().padStart(3, '0')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.customer_name || "Unknown"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">₱{(parseFloat(order.total) || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              {order.status || "Completed"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Cancelled Orders</h3>
            {loadingOrders ? (
              <p>Loading cancelled orders...</p>
            ) : ordersError ? (
              <p className="text-red-500">{ordersError}</p>
            ) : !completeOrders || completeOrders.length === 0 ? (
              <p>No cancelled orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completeOrders.map((order) => (
                      <tr key={order.id || order.order_id}>
                        <td className="px-6 py-4 whitespace-nowrap">ORD-{(order.order_id || "").toString().padStart(3, '0')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.customer_name || "Unknown"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₱{(parseFloat(order.total) || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
        
      case "dishes":
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Dishes</h3>
            {loadingDishes ? (
              <p>Loading dishes data...</p>
            ) : dishesError ? (
              <p className="text-red-500">{dishesError}</p>
            ) : !dishes || dishes.length === 0 ? (
              <p>No dishes found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dish Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dishes.map((dish) => (
                      <tr key={dish.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{dish.dish_name || "Unknown"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dish.category || "Uncategorized"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₱{dish.price || "0"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-md ${dish.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {dish.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Render top products - Updated to handle the new data structure
  const renderTopProducts = () => {
    const topProducts = analyticsData?.topProducts || [];
    
    if (!topProducts || topProducts.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-8">
        <h2 className="font-semibold text-lg mb-4">Top Products</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topProducts.map((product, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{product.name || "Unknown Product"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{product.quantity || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₱{(parseFloat(product.revenue) || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen ">
      {/* Navbar */}
      <div className="w-full flex items-center justify-between py-4 px-12 shadow-md bg-white">
        <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
          <img className="h-20 w-auto object-contain block" src="/img/YCB LOGO (BLUE).png" alt="Logo" />
        </div>
        <div className="text-xl text-[#1C359A] font-bold">Admin</div>
      </div>

      {/* Sidebar & Main Content */}
      <div className="flex flex-row h-full bg-[#DCDEEA]">
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
            <Link to="/history" className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800">
              <span>Order History</span>
            </Link>
            <Link to="/analytics" className="font-bold border-l-2 border-[#1C359A] hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 bg-gray-200 text-[#1C359A]">
              <span>Admin Analytics</span>
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

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1C359A] mb-2">Sales Analytics</h1>
            <p className="text-gray-600">View and analyze your coffee shop's performance</p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setTimeRange("daily")}
                className={`px-6 py-2 rounded-l-lg ${
                  timeRange === "daily"
                    ? "bg-[#1C359A] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange("monthly")}
                className={`px-6 py-2 ${
                  timeRange === "monthly"
                    ? "bg-[#1C359A] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange("yearly")}
                className={`px-6 py-2 rounded-r-lg ${
                  timeRange === "yearly"
                    ? "bg-[#1C359A] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Dashboard Cards - Always render regardless of data state */}
          {renderDashboardCards()}

          {/* Chart Title */}
          <h2 className="font-semibold text-lg mb-4">
            {timeRange === "daily" && "Daily sales (last 7 days)"}
            {timeRange === "monthly" && "Monthly sales (last 12 months)"}
            {timeRange === "yearly" && "Yearly sales"}
          </h2>

          {/* Sales Chart */}
          {renderChart()}
          
          {/* Tabbed Interface */}
          <div className="mt-8">
            <h2 className="font-semibold text-lg mb-4">Order Analysis</h2>
            
            {/* Tabs */}
            <div className="flex mb-4 border-b">
              <button 
                onClick={() => setActiveTab("complete")}
                className={`py-2 px-4 mr-2 font-medium ${activeTab === "complete" 
                  ? "text-[#1C359A] border-b-2 border-[#1C359A]" 
                  : "text-gray-500 hover:text-gray-700"}`}
              >
                Complete Orders
              </button>
              <button 
                onClick={() => setActiveTab("cancelled")}
                className={`py-2 px-4 mr-2 font-medium ${activeTab === "cancelled" 
                  ? "text-[#1C359A] border-b-2 border-[#1C359A]" 
                  : "text-gray-500 hover:text-gray-700"}`}
              >
                Cancelled Orders
              </button>
              <button 
                onClick={() => setActiveTab("dishes")}
                className={`py-2 px-4 font-medium ${activeTab === "dishes" 
                  ? "text-[#1C359A] border-b-2 border-[#1C359A]" 
                  : "text-gray-500 hover:text-gray-700"}`}
              >
                Dishes
              </button>
            </div>
            
            {/* Tab Content */}
            {renderTabContent()}
          </div>
          
          {/* Top Products Table (if data is available) */}
          {analyticsData && analyticsData.topProducts && (
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-4">Top Products</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Sold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analyticsData.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{product.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₱{product.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;