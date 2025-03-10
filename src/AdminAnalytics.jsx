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

  

  // Fetch analytics data based on selected time range
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://yappari-coffee-bar.shop/api/analytics?timeRange=${timeRange}`,
          { withCredentials: true }
        );
        setAnalyticsData(response.data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
        setError("Failed to load analytics data. Please try again.");
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
          console.log("Total Sales API Response:", response.data); // Debugging
          setTotalSales(response.data.total_sales);
        } catch (error) {
          console.error("Failed to fetch total sales:", error);
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
        setUserCount(response.data.count);
      } catch (error) {
        console.error("Failed to fetch user count:", error);
      }
    };

    fetchUserCount();
  }, []);

   // Fetch total orders from database
   useEffect(() => {
    const fetchTotalOrders = async () => {
      try {
        const response = await axios.get(
          "https://yappari-coffee-bar.shop/api/orders_count",
          { withCredentials: true }
        );
        console.log("Total Orders API Response:", response.data); // Debugging
        setTotalOrders(response.data.count);
      } catch (error) {
        console.error("Failed to fetch total orders:", error);
      }
    };

    fetchTotalOrders();
  }, []);

  // handle logout
  const handleLogout = async () => {
    try {
      await axios.post(
        "https://yappari-coffee-bar.shop/api/admin_logout",
        {},
        { withCredentials: true }
      );
      navigate("/admin/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderDashboardCards = () => {
    // Hard-coded default values to ensure cards always display
    let totalUsers = userCount; // Use the fetched user count

    // Try to calculate from analyticsData if available
    if (!loading && !error && analyticsData) {
      // Check if analyticsData is an array
      if (Array.isArray(analyticsData)) {
        totalSales = analyticsData.reduce((sum, item) => sum + (item.amount || 0), 0);
        totalOrders = analyticsData.reduce((sum, item) => sum + (item.orders || 0), 0);
      } 
      // Check if totalSales/totalOrders/totalUsers are directly in the data
      else if (typeof analyticsData === 'object') {
        totalSales = analyticsData.totalSales || 0;
        totalOrders = analyticsData.totalOrders || 0;
        // Only override if analytics data has user count
        if (analyticsData.totalUsers) {
          totalUsers = analyticsData.totalUsers;
        }
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
            <p className="text-2xl font-bold text-gray-800">₱{totalSales.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-10">Total revenue</p>
          </div>
        </div>
        
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-[#2F3A8F] text-xl font-bold mb-4">Registered Users</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
            <p className="text-sm text-gray-500 mt-10">Total registered accounts</p>
          </div>
        </div>
        
        {/* Total Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-[#2F3A8F] text-xl font-bold mb-4">Total Orders</h3>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            <p className="text-sm text-gray-500 mt-10">{getTimeRangeText()}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    if (loading) return <div className="text-center py-20">Loading data...</div>;
    if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
    if (!analyticsData || analyticsData.length === 0) return <div className="text-center py-20">No data available for this time period</div>;

    // Calculate chart dimensions
    const chartWidth = 700;
    const chartHeight = 300;
    const padding = 40;
    const availableWidth = chartWidth - (padding * 2);
    const availableHeight = chartHeight - (padding * 2);
    
    // Find max value for scaling
    const maxValue = Math.max(...analyticsData.map(item => item.amount));
    
    // Generate SVG path for line chart
    const generatePath = () => {
      return analyticsData.map((item, index) => {
        const x = padding + (index * (availableWidth / (analyticsData.length - 1 || 1)));
        const y = chartHeight - padding - ((item.amount / maxValue) * availableHeight);
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
          {analyticsData.map((item, index) => {
            const x = padding + (index * (availableWidth / (analyticsData.length - 1 || 1)));
            const y = chartHeight - padding - ((item.amount / maxValue) * availableHeight);
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
                  {item.label}
                </text>
                <text 
                  x={x} 
                  y={y - 10} 
                  textAnchor="middle" 
                  fontSize="10"
                >
                  ₱{item.amount.toLocaleString()}
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