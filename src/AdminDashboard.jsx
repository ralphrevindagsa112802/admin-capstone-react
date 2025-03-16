import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { FaEllipsisV } from "react-icons/fa";
import Swal from 'sweetalert2';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderStatuses, setOrderStatuses] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    // New state to track completed orders
    const [completedOrders, setCompletedOrders] = useState([]);

    // Date filter states
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isFiltered, setIsFiltered] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => {
           setIsOpen(!isOpen);
       };
   
    // ✅ Fetch order status when component mounts
    useEffect(() => {
        const fetchStatuses = async () => {
            const updatedStatuses = {};
            for (const order of filteredOrders) {
                try {
                    const response = await fetch(`https://yappari-coffee-bar.shop/api/updateOrderStatus.php?order_id=${order.orders_id}`, {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                    });

                    const data = await response.json();
                    if (data.success) {
                        updatedStatuses[order.orders_id] = data.order_status;
                    } else {
                        updatedStatuses[order.orders_id] = "Error"; // If fetch fails
                    }
                } catch (error) {
                    console.error("Error fetching status:", error);
                    updatedStatuses[order.orders_id] = "Error";
                }
            }
            setOrderStatuses(updatedStatuses);
        };

        fetchStatuses();
    }, [filteredOrders]);

    // ✅ Toggle dropdown
    const handleDropdownToggle = (orderId) => {
        setOpenDropdown(openDropdown === orderId ? null : orderId);
    };

    // ✅ Update order status
    const handleStatusUpdate = async (orderId, status) => {
        try {
            const response = await fetch("https://yappari-coffee-bar.shop/api/updateOrderStatus.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ order_id: orderId, status }),
            });

            const data = await response.json();

            if (data.success) {
                Swal.fire('Success', 'Order status updated successfully!', 'success', {timer: 2000});
                setOrderStatuses((prevStatuses) => ({
                    ...prevStatuses,
                    [orderId]: status,
                }));
                setOpenDropdown(null);

                // ✅ Move to order history if status is 'Completed' or 'Cancelled'
                if (status === "Completed" || status === "Cancelled") {
                    await saveOrderToHistory(orderId, status);
                    // Mark this order as completed
                    setCompletedOrders(prev => [...prev, orderId]);
                }
            } else {
                Swal.fire('Oops...', `Error: ${data.message}`, 'error', {timer: 2000});
            }
        } catch (error) {
            console.error("Error updating status:", error);
            Swal.fire('Oops...', 'Something went wrong!', 'error', {timer: 2000});
        }
    };

    // Direct method to save to history with specified status
    const saveOrderToHistory = async (orderId, status) => {
        try {
            // First, get the current order details to save in history
            const orderToSave = filteredOrders.find(order => order.orders_id === orderId);

            if (!orderToSave) {
                console.error(`Order with ID ${orderId} not found in current orders list`);
                return { success: false, message: "Order not found in current list" };
            }

            // Send data matching what the backend expects
            const response = await fetch("https://yappari-coffee-bar.shop/api/saveOrderHistory.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    order_ids: [orderId], // Send as an array of order IDs
                    status: status // Include the status to be saved in history
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Remove the order from the active orders list
                setOrders((prevOrders) => prevOrders.filter(order => order.orders_id !== orderId));
                setFilteredOrders((prevOrders) => prevOrders.filter(order => order.orders_id !== orderId));
                // Add to completed orders list
                setCompletedOrders(prev => [...prev, orderId]);
                return { success: true };
            } else {
                console.error("Failed to save order to history:", data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error("Error saving order to history:", error);
            return { success: false, message: error.message };
        }
    };

    // ✅ Handle Complete button click
    const handleCompleteOrders = async () => {
        if (selectedOrders.length === 0) {
            Swal.fire({
                title: 'Oops...',
                text: 'Please select at least one order to complete!',
                icon: 'warning',
                timer: 2000
            });
            return;
        }
    
        // Check if any of the selected orders were already completed
        const alreadyCompletedOrders = selectedOrders.filter(id => completedOrders.includes(id));
        if (alreadyCompletedOrders.length > 0) {
            Swal.fire({
                title: 'Oops...',
                text: `Order(s) #${alreadyCompletedOrders.join(', ')} have already been completed and cannot be processed again.`,
                icon: 'warning',
                timer: 2000
            });
            // Remove already completed orders from selection
            setSelectedOrders(prev => prev.filter(id => !alreadyCompletedOrders.includes(id)));
            return;
        }
    
        // Confirm before proceeding
        const result = await Swal.fire({
            title: "Are you sure?",
            text: `You are about to mark ${selectedOrders.length} order(s) as complete and move them to history.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, mark as complete!",
            cancelButtonText: "Cancel"
        });
    
        if (!result.isConfirmed) return; // Exit if user cancels
    
        setIsProcessing(true);
    
        try {
            // Process each order
            const results = await Promise.all(
                selectedOrders.map(async (orderId) => {
                    try {
                        if (completedOrders.includes(orderId)) {
                            return { orderId, success: false, message: "Order already completed" };
                        }
    
                        const currentStatus = orderStatuses[orderId] || "Unknown";
                        const finalStatus = currentStatus === "Cancelled" ? "Cancelled" : "Completed";
    
                        const statusResult = await fetch("https://yappari-coffee-bar.shop/api/updateOrderStatus.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ order_id: orderId, status: finalStatus }),
                        }).then(r => r.json());
    
                        if (!statusResult.success) {
                            console.warn(`Could not update status for order ${orderId}: ${statusResult.message}`);
                        }
    
                        const historyResult = await saveOrderToHistory(orderId, finalStatus);
    
                        if (historyResult.success) {
                            setCompletedOrders(prev => [...prev, orderId]);
                        }
    
                        return {
                            orderId,
                            success: historyResult.success,
                            message: historyResult.message,
                            status: finalStatus
                        };
                    } catch (error) {
                        console.error(`Error processing order ${orderId}:`, error);
                        return { orderId, success: false, message: error.message };
                    }
                })
            );
    
            // Count successes and failures
            const successful = results.filter(result => result.success).length;
            const failed = results.length - successful;
    
            if (failed === 0) {
                Swal.fire({
                    title: `${successful} order(s) processed and moved to history successfully!`,
                    icon: 'success',
                    timer: 2000
                });
    
                setSelectedOrders([]);
                fetchOrders();
            } else {
                Swal.fire({
                    title: `${successful} order(s) processed successfully. ${failed} order(s) failed.`,
                    icon: 'error',
                    timer: 2000
                });
                console.error("Failed orders:", results.filter(result => !result.success));
    
                const successfulOrderIds = results
                    .filter(result => result.success)
                    .map(result => result.orderId);
    
                setSelectedOrders(prevSelected =>
                    prevSelected.filter(id => !successfulOrderIds.includes(id))
                );
    
                fetchOrders();
            }
        } catch (error) {
            console.error("Error completing orders:", error);
            Swal.fire({
                title: 'Oops...',
                text: 'An error occurred while processing your request.',
                icon: 'error',
                timer: 2000
            });
        } finally {
            setIsProcessing(false);
        }
    };
    

    // Format date to YYYY-MM-DD for comparison
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Handle date selection from calendar
    const handleDateSelection = (date) => {
        setSelectedDate(date);
    };

    // Apply the date filter
    const applyDateFilter = () => {
        if (!selectedDate) {
            setFilteredOrders(orders);
            setIsFiltered(false);
            setShowCalendar(false);
            return;
        }

        const selected = formatDate(selectedDate);
        const filtered = orders.filter(order => {
            const orderDate = formatDate(order.created_at);
            return orderDate === selected;
        });

        setFilteredOrders(filtered);
        setIsFiltered(true);
        setShowCalendar(false);
        setSelectedOrders([]); // Clear selections when filtering
    };

    // Clear the date filter
    const clearDateFilter = () => {
        setSelectedDate(null);
        setFilteredOrders(orders);
        setIsFiltered(false);
        setShowCalendar(false);
    };

    // Toggle calendar visibility
    const toggleCalendar = () => {
        setShowCalendar(!showCalendar);
    };

    // fetch order
    const fetchOrders = async () => {
        try {
            const response = await fetch("https://yappari-coffee-bar.shop/api/fetchOrderAdmin.php", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched Orders:", data);

            if (data.success) {
                setOrders(data.orders);
                setFilteredOrders(data.orders); // Initialize filtered orders with all orders
            } else {
                console.error("Failed to fetch orders:", data.message);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        
        // Load completed orders from localStorage when component mounts
        const savedCompletedOrders = localStorage.getItem('completedOrders');
        if (savedCompletedOrders) {
            setCompletedOrders(JSON.parse(savedCompletedOrders));
        }
    }, []);

    // Save completed orders to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
    }, [completedOrders]);

    const handleLogout = async () => {
        try {
            await fetch("https://yappari-coffee-bar.shop/api/admin_logout", {
                method: "POST",
                credentials: "include",
            });
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // Function to handle individual checkbox selection
    const handleCheckboxChange = (orderId) => {
        // Don't allow selection if already completed
        if (completedOrders.includes(orderId)) {
            Swal.fire(`Order #${orderId} has already been completed and cannot be selected.`, '', 'warning', {timer: 2000});
            return;
        }

        setSelectedOrders((prevSelected) =>
            prevSelected.includes(orderId)
                ? prevSelected.filter((id) => id !== orderId)
                : [...prevSelected, orderId]
        );
    };

    // Function to handle "Select All" checkbox
    const handleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]); // Deselect all
        } else {
            // Select all that haven't been completed
            const selectableOrders = filteredOrders
                .filter(order => !completedOrders.includes(order.orders_id))
                .map(order => order.orders_id);
            
            setSelectedOrders(selectableOrders);
        }
    };

    // view details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };

    // Calendar component
    const Calendar = ({ onDateSelect, onApply, onClose }) => {
        const [currentMonth, setCurrentMonth] = useState(new Date());
        const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);

        // Get days in month
        const getDaysInMonth = (month, year) => {
            return new Date(year, month + 1, 0).getDate();
        };

        // Get first day of month (0 = Sunday, 1 = Monday, etc)
        const getFirstDayOfMonth = (month, year) => {
            return new Date(year, month, 1).getDay();
        };

        // Navigate to previous month
        const prevMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
        };

        // Navigate to next month
        const nextMonth = () => {
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
        };

        // Select a date
        const selectDate = (day) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            setLocalSelectedDate(date);
            onDateSelect(date);
        };

        // Format date for display
        const formatDateDisplay = (date) => {
            if (!date) return '';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        };

        // Apply the selected date
        const handleApply = () => {
            onApply();
        };

        // Render calendar days
        const renderDays = () => {
            const daysInMonth = getDaysInMonth(currentMonth.getMonth(), currentMonth.getFullYear());
            const firstDayOfMonth = getFirstDayOfMonth(currentMonth.getMonth(), currentMonth.getFullYear());

            const days = [];
            // Empty cells for days before start of month
            for (let i = 0; i < firstDayOfMonth; i++) {
                days.push(<div key={`empty-${i}`} className="p-2"></div>);
            }

            // Days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const isSelected = localSelectedDate &&
                    date.getDate() === localSelectedDate.getDate() &&
                    date.getMonth() === localSelectedDate.getMonth() &&
                    date.getFullYear() === localSelectedDate.getFullYear();

                days.push(
                    <div
                        key={day}
                        onClick={() => selectDate(day)}
                        className={`p-2 text-center cursor-pointer hover:bg-gray-200 ${isSelected ? 'bg-blue-600 text-white rounded-full' : ''
                            }`}
                    >
                        {day}
                    </div>
                );
            }

            return days;
        };

        // Month name
        const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

        return (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-4 z-50 w-80">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={prevMonth} className="p-1">&lt;</button>
                    <h3 className="font-semibold">{monthName}</h3>
                    <button onClick={nextMonth} className="p-1">&gt;</button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="text-center text-gray-500 text-xs p-1">{day}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {renderDays()}
                </div>

                <div className="mt-4 flex justify-between">
                    <div>
                        {localSelectedDate && (
                            <div className="text-sm">
                                Selected: {formatDateDisplay(localSelectedDate)}
                            </div>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-1 text-sm border border-gray-300 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen">
         
     {/* Navbar */}
      <div className="w-full flex items-center justify-between py-2 px-4 md:px-8 lg:px-12 shadow-md bg-white z-30 relative">
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
                fixed lg:static inset-y-0 left-0 z-40
                w-64 md:w-72 lg:w-64 flex-none bg-white shadow-lg 
                h-screen lg:h-[calc(100vh-80px)] flex flex-col justify-between p-5
                transition-transform duration-300 ease-in-out
                top-0 lg:top-20
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
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-[#1C359A] bg-blue-50 hover:bg-blue-100 text-[#1C359A] flex items-center space-x-3 px-4 py-3"
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
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-[#1C359A] hover:bg-blue-50 text-gray-700 hover:text-[#1C359A] flex items-center space-x-3 px-4 py-3"
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L14 11.586V7z" clipRule="evenodd" />
                </svg>
                <span>SIGN OUT</span>
              </button>
            </Link>
          </div>
        </div>

                <main className="p-6 w-full overflow-auto bg-[#DCDEEA]">
                    {/* Header Section */}
                    <div className="w-full flex justify-between items-center">
                        <div className="text-[#1C359A] text-lg font-bold">
                            Order Management
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCompleteOrders}
                                disabled={isProcessing || selectedOrders.length === 0}
                                className={`px-4 py-2 border-2 border-[#1C359A] font-bold rounded-md 
                                ${(isProcessing || selectedOrders.length === 0)
                                        ? 'bg-gray-300 border-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'text-black hover:bg-white'}`}
                            >
                                {isProcessing ? "Processing..." : `Complete (${selectedOrders.length})`}
                            </button>

                            <div className="relative">
                                <button
                                    onClick={toggleCalendar}
                                    className="px-4 py-2 border-2 border-[#1C359A] text-black font-bold rounded-md flex items-center space-x-2 hover:bg-white"
                                >
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

                                {showCalendar && (
                                    <Calendar
                                        onDateSelect={handleDateSelection}
                                        onApply={applyDateFilter}
                                        onClose={() => setShowCalendar(false)}
                                    />
                                )}
                            </div>

                            {isFiltered && (
                                <button
                                    onClick={clearDateFilter}
                                    className="px-4 py-2 border-2 border-red-500 text-red-500 font-bold rounded-md hover:bg-red-50"
                                >
                                    Clear Filter
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter indicator */}
                    {isFiltered && (
                        <div className="mt-2 p-2 bg-blue-50 text-blue-700 rounded-md flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span>
                                Filtering orders from: {selectedDate?.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                {filteredOrders.length === 0 ? ' (No orders found)' : ` (${filteredOrders.length} orders)`}
                            </span>
                        </div>
                    )}

                    <div className="p-2 w-full mt-6 rounded-2xl">
                        <table className="w-full bg-white opacity-90 rounded-2xl">
                            <thead>
                                <tr className="border-t border-4 border-[#DCDEEA]">
                                    <th className="p-3 text-left text-[#808080]">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === filteredOrders.filter(order => !completedOrders.includes(order.orders_id)).length && filteredOrders.length > 0}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Order #</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Date</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Customer</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Location</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Phone</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Service Option</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Details</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Total</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Status</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Update</th>
                                </tr>
                            </thead>
                            
                            <tbody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order.orders_id} className="border-t border-4 border-[#DCDEEA] hover:bg-gray-100">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.orders_id)}
                                                    onChange={() => handleCheckboxChange(order.orders_id)}
                                                />
                                            </td>
                                            <td className="p-3 text-sm">{order.orders_id}</td>
                                            <td className="p-3 text-sm">{order.created_at}</td>
                                            <td className="p-3 text-sm">{order.user.full_name}</td>
                                            <td className="p-3 text-sm">{order.user.address}</td>
                                            <td className="p-3 text-sm">{order.user.phone}</td>
                                            <td className="p-3 text-sm">{order.shipping_method}</td>
                                            <td className="p-3 text-sm">
                                                <button onClick={() => handleViewDetails(order)} className="text-blue-500 hover:text-blue-700">
                                                    <FaEye />
                                                </button>
                                            </td>
                                            <td className="p-3 text-sm">₱{order.total_amount}</td>
                                            <td className="p-3 font-semibold">
                                                {orderStatuses[order.orders_id] || "Loading..."}
                                            </td>
                                            <td className="p-3 relative">
                                                <button onClick={() => handleDropdownToggle(order.orders_id)} className="text-gray-600 hover:text-black">
                                                    <FaEllipsisV />
                                                </button>

                                                {openDropdown === order.orders_id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-md rounded-lg z-50">
                                                        <p className="text-blue-600 text-center font-semibold py-2">Update Status</p>
                                                        <div className="flex flex-col">
                                                            {["Pending", "Processing", "Out For Delivery", "Ready to pickup"].map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => handleStatusUpdate(order.orders_id, status)}
                                                                    className="px-4 py-2 text-left hover:bg-gray-100 text-sm text-gray-700"
                                                                >
                                                                    {status}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className='border-t border-4 border-[#DCDEEA] hover:bg-gray-100'>
                                        <td colSpan="11" className="text-center p-3">
                                            {isFiltered
                                                ? "No orders found for the selected date"
                                                : "No orders found"}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/** Popup Details */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[600px]">
                        {/* Order Summary */}
                        <div className="border-b pb-2 mb-4">
                            <p className="text-sm">
                                <span className="font-bold text-blue-700">Order number:</span> {selectedOrder.orders_id}
                            </p>
                            <p className="text-sm">
                                <span className="font-bold text-blue-700">Date:</span> {selectedOrder.created_at}
                            </p>
                            <p className="text-sm">
                                <span className="font-bold text-blue-700">Total cost:</span> ₱{selectedOrder.total_amount}
                            </p>
                            <p className="text-sm">
                                <span className="font-bold text-blue-700">Service option:</span> {selectedOrder.shipping_method}
                            </p>
                            <p className="text-sm">
                                <span className="font-bold text-blue-700">Payment option:</span> {selectedOrder.payment_method}
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

                            {selectedOrder.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-4 text-sm py-2 border-b">
                                    <p>{item.food_name}</p>
                                    <p>{item.size}</p>
                                    <p>{item.quantity}</p>
                                    <p>₱{item.price}</p>
                                </div>
                            ))}
                        </div>

                        {/* Close Button */}

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

export default AdminDashboard;



