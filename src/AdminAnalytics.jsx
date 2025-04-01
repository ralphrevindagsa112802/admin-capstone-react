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
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


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

  useEffect(() => {
    const fetchTotalSales = async () => {
      setTotalSales(0); // Ensure it resets before fetching to prevent incorrect values
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
          setTotalSales(0);
        }
      } catch (error) {
        console.error("Failed to fetch total sales:", error);
        setTotalSales(0);
      }
    };
  
    fetchTotalSales();
  }, [timeRange]); // Fetch again when timeRange changes
  
  

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
            // Filter out duplicates based on order_id
            const uniqueOrders = Array.from(
              new Map(orders.map(order => [(order.order_id || order.id), order])).values()
            );
            setCompleteOrders(uniqueOrders);
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

          let orders = [];
          if (response.data && response.data.success && Array.isArray(response.data.orders)) {
            orders = response.data.orders;
          } else if (Array.isArray(response.data)) {
            // Handle alternative response format
            orders = response.data;
          } else {
            console.error("Unexpected API response:", response.data);
            setOrdersError("Invalid response format from server");
            setCompleteOrders([]);
            setLoadingOrders(false);
            return;
          }

          // Filter out duplicates based on order_id
          const uniqueOrders = Array.from(
            new Map(orders.map(order => [(order.order_id || order.id), order])).values()
          );
          setCompleteOrders(uniqueOrders);
          setOrdersError(null);
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

  //chart analytics
  const renderChart = () => {
    if (loading) return <div className="text-center py-10 md:py-20">Loading data...</div>;
    if (error) return <div className="text-center py-10 md:py-20 text-red-600">{error}</div>;

    // Extract the chart data from the response structure
    const chartData = analyticsData?.salesData ||
      (Array.isArray(analyticsData) ? analyticsData : []);

    // If chartData is empty or not available
    if (!chartData || chartData.length === 0) {
      return <div className="text-center py-10 md:py-20">No data available for this time period</div>;
    }

    // Calculate chart dimensions dynamically
    const getChartDimensions = () => {
      // Base dimensions for mobile
      const base = {
        width: "100%", // Full width of container
        height: 250,   // Smaller height on mobile
        padding: 25,   // Smaller padding on mobile
        labelFontSize: 8, // Smaller font on mobile
        pointRadius: 3, // Smaller points on mobile
        strokeWidth: 1.5 // Thinner lines on mobile
      };

      // Dimensions for tablet and up (sm: 640px+)
      const sm = {
        height: 280,
        padding: 30,
        labelFontSize: 9,
        pointRadius: 3.5,
        strokeWidth: 1.8
      };

      // Dimensions for medium screens (md: 768px+)
      const md = {
        height: 300,
        padding: 40,
        labelFontSize: 10,
        pointRadius: 4,
        strokeWidth: 2
      };

      // Return dimensions based on current viewport width
      // Using window.innerWidth would be ideal here, but for SSR compatibility we'll use media queries in component
      return {
        ...base,
        tablet: sm,
        desktop: md
      };
    };

    const dimensions = getChartDimensions();

    // For responsive SVG, we'll use viewBox instead of fixed width/height
    // This will let the SVG scale with its container
    const baseWidth = 700; // Reference width for viewBox
    const baseHeight = dimensions.height;
    const basePadding = dimensions.padding;

    // Find max value for scaling (with safe fallback)
    const maxValue = Math.max(...chartData.map(item => parseFloat(item.amount) || 0), 1);

    // Generate SVG path for line chart based on viewBox coordinates
    const generatePath = () => {
      const availableWidth = baseWidth - (basePadding * 2);
      const availableHeight = baseHeight - (basePadding * 2);

      return chartData.map((item, index) => {
        const x = basePadding + (index * (availableWidth / (chartData.length - 1 || 1)));
        const y = baseHeight - basePadding - (((parseFloat(item.amount) || 0) / maxValue) * availableHeight);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    };

    return (
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md overflow-x-auto">
        {/* Responsive container for the chart */}
        <div className="min-w-full">
          {/* SVG with viewBox for responsive scaling */}
          <svg className="w-full" viewBox={`0 0 ${baseWidth} ${baseHeight}`} preserveAspectRatio="xMidYMid meet">
            {/* Y-axis */}
            <line
              x1={basePadding}
              y1={basePadding}
              x2={basePadding}
              y2={baseHeight - basePadding}
              stroke="#888"
              strokeWidth="1"
            />

            {/* X-axis */}
            <line
              x1={basePadding}
              y1={baseHeight - basePadding}
              x2={baseWidth - basePadding}
              y2={baseHeight - basePadding}
              stroke="#888"
              strokeWidth="1"
            />

            {/* Data line */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#1C359A"
              strokeWidth={dimensions.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points and labels */}
            {chartData.map((item, index) => {
              const availableWidth = baseWidth - (basePadding * 2);
              const availableHeight = baseHeight - (basePadding * 2);
              const x = basePadding + (index * (availableWidth / (chartData.length - 1 || 1)));
              const y = baseHeight - basePadding - (((parseFloat(item.amount) || 0) / maxValue) * availableHeight);

              return (
                <g key={index}>
                  {/* Data point */}
                  <circle
                    cx={x}
                    cy={y}
                    r={dimensions.pointRadius}
                    fill="#1C359A"
                  />

                  {/* X-axis label (conditionally shown based on data density) */}
                  <text
                    x={x}
                    y={baseHeight - basePadding + 15}
                    textAnchor="middle"
                    fontSize={dimensions.labelFontSize}
                    className={chartData.length > 10 ? "hidden sm:inline" : ""}
                  >
                    {item.label || `Item ${index + 1}`}
                  </text>

                  {/* Value label (only shown on hover or for important points) */}
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize={dimensions.labelFontSize}
                    className={chartData.length > 6 ? "hidden sm:inline" : ""}
                  >
                    ₱{(parseFloat(item.amount) || 0).toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Y-axis labels */}
            <text
              x={basePadding - 5}
              y={baseHeight - basePadding}
              textAnchor="end"
              fontSize={dimensions.labelFontSize}
            >
              0
            </text>
            <text
              x={basePadding - 5}
              y={basePadding}
              textAnchor="end"
              fontSize={dimensions.labelFontSize}
            >
              ₱{maxValue.toLocaleString()}
            </text>

            {/* Add middle y-axis label */}
            <text
              x={basePadding - 5}
              y={(baseHeight - basePadding + basePadding) / 2}
              textAnchor="end"
              fontSize={dimensions.labelFontSize}
            >
              ₱{(maxValue / 2).toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Mobile-friendly legend when there are many data points */}
        {chartData.length > 10 && (
          <div className="sm:hidden mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-600 mr-1"></div>
                <span>{item.label}: ₱{(parseFloat(item.amount) || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render tabs content
  // Render tabs content
  const renderTabContent = () => {
    switch (activeTab) {
      case "complete":
        return (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Complete Orders</h3>
            <div className="text-gray-500">
              {loadingOrders ? (
                <p>Loading complete orders...</p>
              ) : ordersError ? (
                <p className="text-red-500">{ordersError}</p>
              ) : !completeOrders || completeOrders.length === 0 ? (
                <p>No complete orders found.</p>
              ) : (
                <>
                  {/* Desktop and tablet view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {completeOrders.map((order) => (
                          <tr key={order.id || order.order_id}>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">ORD-{(order.order_id || "").toString().padStart(3, '0')}</td>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">{order.customer_name || "Unknown"}</td>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</td>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">₱{(parseFloat(order.total) || 0).toLocaleString()}</td>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {order.status || "Completed"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile view */}
                  <div className="sm:hidden space-y-3">
                    {completeOrders.map((order) => (
                      <div key={order.id || order.order_id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">ORD-{(order.order_id || "").toString().padStart(3, '0')}</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {order.status || "Completed"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className="text-gray-500">Customer:</div>
                          <div>{order.customer_name || "Unknown"}</div>
                          <div className="text-gray-500">Date:</div>
                          <div>{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</div>
                          <div className="text-gray-500">Amount:</div>
                          <div>₱{(parseFloat(order.total) || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      case "cancelled":
        return (
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Cancelled Orders</h3>
            {loadingOrders ? (
              <p>Loading cancelled orders...</p>
            ) : ordersError ? (
              <p className="text-red-500">{ordersError}</p>
            ) : !completeOrders || completeOrders.length === 0 ? (
              <p>No cancelled orders found.</p>
            ) : (
              <>
                {/* Desktop and tablet view */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {completeOrders.map((order) => (
                        <tr key={order.id || order.order_id}>
                          <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">ORD-{(order.order_id || "").toString().padStart(3, '0')}</td>
                          <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">{order.customer_name || "Unknown"}</td>
                          <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</td>
                          <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">₱{(parseFloat(order.total) || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile view */}
                <div className="sm:hidden space-y-3">
                  {completeOrders.map((order) => (
                    <div key={order.id || order.order_id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-sm mb-2">ORD-{(order.order_id || "").toString().padStart(3, '0')}</div>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className="text-gray-500">Customer:</div>
                        <div>{order.customer_name || "Unknown"}</div>
                        <div className="text-gray-500">Date:</div>
                        <div>{order.date ? new Date(order.date).toLocaleDateString() : "N/A"}</div>
                        <div className="text-gray-500">Amount:</div>
                        <div>₱{(parseFloat(order.total) || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

        case "dishes":
          return (
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
              <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Dishes</h3>
              {loadingDishes ? (
                <p>Loading dishes data...</p>
              ) : dishesError ? (
                <p className="text-red-500">{dishesError}</p>
              ) : !dishes || dishes.length === 0 ? (
                <p>No dishes found.</p>
              ) : (
                <>
                  {/* Desktop and tablet view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Dish Name</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Small</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Medium</th>
                          <th className="px-2 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase">Large</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dishes.map((dish) => (
                          <tr key={dish.food_id}>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">{dish.dish_name || "Unknown"}</td>
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">{dish.category || "Uncategorized"}</td>
                            
                            {/* Small size */}
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                              {dish.price_small ? (
                                <div>
                                  <div>₱{dish.price_small}</div>
                                  <span className={`px-2 py-1 rounded-md text-xs ${dish.availability_small === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {dish.availability_small || "N/A"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            
                            {/* Medium size */}
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                              {dish.price_medium ? (
                                <div>
                                  <div>₱{dish.price_medium}</div>
                                  <span className={`px-2 py-1 rounded-md text-xs ${dish.availability_medium === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {dish.availability_medium || "N/A"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                            
                            {/* Large size */}
                            <td className="px-2 py-2 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm">
                              {dish.price_large ? (
                                <div>
                                  <div>₱{dish.price_large}</div>
                                  <span className={`px-2 py-1 rounded-md text-xs ${dish.availability_large === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {dish.availability_large || "N/A"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
        
                  {/* Mobile view */}
                  <div className="sm:hidden space-y-3">
                    {dishes.map((dish) => (
                      <div key={dish.food_id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">{dish.dish_name || "Unknown"}</span>
                          <span className="text-xs font-medium">{dish.category || "Uncategorized"}</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {/* Small size mobile */}
                          <div className="bg-white p-2 rounded border">
                            <div className="text-xs font-medium mb-1">Small</div>
                            {dish.price_small ? (
                              <>
                                <div className="text-xs">₱{dish.price_small}</div>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-md text-xs ${dish.availability_small === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {dish.availability_small || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </div>
                          
                          {/* Medium size mobile */}
                          <div className="bg-white p-2 rounded border">
                            <div className="text-xs font-medium mb-1">Medium</div>
                            {dish.price_medium ? (
                              <>
                                <div className="text-xs">₱{dish.price_medium}</div>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-md text-xs ${dish.availability_medium === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {dish.availability_medium || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </div>
                          
                          {/* Large size mobile */}
                          <div className="bg-white p-2 rounded border">
                            <div className="text-xs font-medium mb-1">Large</div>
                            {dish.price_large ? (
                              <>
                                <div className="text-xs">₱{dish.price_large}</div>
                                <span className={`inline-block mt-1 px-2 py-1 rounded-md text-xs ${dish.availability_large === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                  {dish.availability_large || "N/A"}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between py-2 px-4 md:px-8 lg:px-12 shadow-md bg-white z-40">
        {/* Mobile Toggle Button - Only visible on small screens */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden flex items-center justify-center text-[#1C359A] p-2 rounded-full hover:bg-gray-100"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="flex items-center justify-center md:justify-start flex-1 md:flex-none">
          <img
            className="h-16 w-auto object-contain block"
            src="/img/YCB LOGO (BLUE).png"
            alt="Logo"
          />
        </div>

        <div className="hidden md:block text-xl text-[#1C359A] font-bold px-4">
          Admin Dashboard
        </div>

        <div className="flex items-center">
          <div className="hidden md:flex items-center mr-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1C359A]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-row h-full bg-[#DCDEEA]">
        {/* Mobile Toggle Button - Only visible on small screens */}
        {/* Overlay for mobile - appears when sidebar is open */}
        {isOpen && (
          <div
            onClick={toggleSidebar}
            className="lg:hidden fixed inset-0 bg-opacity-50 z-20"
            aria-hidden="true"
          ></div>
        )}

        {/* Sidebar */}
        <div className={`
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:translate-x-0
                fixed inset-y-0 left-0 z-40
                w-64 md:w-72 lg:w-64 flex-none bg-white shadow-lg 
                h-screen flex flex-col justify-between p-5
                transition-transform duration-300 ease-in-out
                top-0 lg:top-20 lg:h-[calc(100vh-80px)]
            `}>
          {/* Close button - Only visible on small screens when open */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 p-1"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo Area for mobile only */}
          <div className="mb-8 mt-2 lg:hidden">
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold text-[#1C359A]">Admin Portal</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow flex flex-col space-y-1">
            <Link
              to="/dashboard"
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-[#1C359A] hover:bg-blue-50 text-gray-700 hover:text-[#1C359A] flex items-center space-x-3 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              <span>Orders</span>
            </Link>
            <Link
              to="/menu"
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-[#1C359A] hover:bg-blue-50 text-gray-700 hover:text-[#1C359A] flex items-center space-x-3 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>Menu</span>
            </Link>
            <Link
              to="/feedback"
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-[#1C359A] hover:bg-blue-50 text-gray-700 hover:text-[#1C359A] flex items-center space-x-3 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>Feedback</span>
            </Link>
            <Link
              to="/history"
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-[#1C359A] hover:bg-blue-50 text-gray-700 hover:text-[#1C359A] flex items-center space-x-3 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Order History</span>
            </Link>
            <Link
              to="/analytics"
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-[#1C359A] bg-blue-50 hover:bg-blue-100 text-[#1C359A] flex items-center space-x-3 px-4 py-3"
              onClick={() => setIsOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>Analytics</span>
            </Link>
          </nav>

          {/* User Section & Logout */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link
              to={"/"}
              onClick={(e) => {
                setIsOpen(false);
                handleLogout(e);
              }}
            >
             <button
  className="w-full font-medium flex items-center justify-center space-x-2 bg-[#1C359A] hover:bg-blue-800 text-white px-4 py-3 rounded-lg transition-colors duration-200"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
  <span>SIGN OUT</span>
</button>
            </Link>
          </div>
        </div>


        {/* Main Content */}
        <div className="flex-1 w-full p-2 sm:p-4 md:p-6 overflow-auto bg-[#DCDEEA] mt-22 lg:ml-64">  {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1C359A] mb-2">Sales Analytics</h1>
            <p className="text-gray-600">View and analyze your coffee shop's performance</p>
          </div>

          {/* Time Range Selector */}
          <div className="mb-6">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setTimeRange("daily")}
                className={`px-6 py-2 rounded-l-lg ${timeRange === "daily"
                    ? "bg-[#1C359A] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange("monthly")}
                className={`px-6 py-2 ${timeRange === "monthly"
                    ? "bg-[#1C359A] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setTimeRange("yearly")}
                className={`px-6 py-2 rounded-r-lg ${timeRange === "yearly"
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

              {/* Desktop/Tablet View */}
              <div className="hidden sm:block bg-white rounded-lg shadow-md overflow-hidden">
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

              {/* Mobile View */}
              <div className="sm:hidden space-y-4">
                {analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="font-medium mb-2">{product.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity Sold:</span>
                        <p className="font-medium">{product.quantity}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <p className="font-medium">₱{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;