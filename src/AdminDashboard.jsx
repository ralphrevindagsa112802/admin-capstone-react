import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';
import { FaEllipsisV } from "react-icons/fa";



const AdminDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderStatuses, setOrderStatuses] = useState({});

    // ✅ Fetch order status when component mounts
    useEffect(() => {
        const fetchStatuses = async () => {
            const updatedStatuses = {};
            for (const order of orders) {
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
    }, [orders]);

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
                alert("Order status updated successfully!");
                setOrderStatuses((prevStatuses) => ({
                    ...prevStatuses,
                    [orderId]: status,
                }));
                setOpenDropdown(null);

                // ✅ Move to order history if status is 'Completed'
                if (status === "Completed") {
                    await saveOrderToHistory(orderId);
                }
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Something went wrong!");
        }
    };

    const saveOrderToHistory = async (orderId) => {
        try {
            const response = await fetch("https://yappari-coffee-bar.shop/api/saveOrderHistory.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ order_id: orderId }),
            });

            const data = await response.json();

            if (data.success) {
                alert("Order successfully moved to history!");
                // Remove the order from the active orders list
                setOrders((prevOrders) => prevOrders.filter(order => order.orders_id !== orderId));
            } else {
                alert("Failed to save order to history: " + data.message);
            }
        } catch (error) {
            console.error("Error saving order to history:", error);
        }
    };





    useEffect(() => {
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
                } else {
                    console.error("Failed to fetch orders:", data.message);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
    }, []);

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
        setSelectedOrders((prevSelected) =>
            prevSelected.includes(orderId)
                ? prevSelected.filter((id) => id !== orderId)
                : [...prevSelected, orderId]
        );
    };

    // Function to handle "Select All" checkbox
    const handleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]); // Deselect all
        } else {
            setSelectedOrders(orders.map((order) => order.orders_id)); // Select all
        }
    };

    //view details
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
    };


    return (
        <div className="flex flex-col h-screen bg-[#DCDEEA]">
            {/* Navbar */}
            <div className="w-full flex items-center justify-between py-4 px-12 shadow-md bg-white">
                <div className="flex items-center justify-center md:justify-start w-full md:w-auto">
                    <img
                        className="h-20 w-auto object-contain block"
                        src="/img/YCB LOGO (BLUE).png"
                        alt="Logo"
                    />
                </div>
                <div className="text-xl text-[#1C359A] font-bold">Admin</div>
            </div>

            <div className="flex flex-row h-full">
                {/* Sidebar */}
                <div className="w-52 flex-none bg-white shadow-md h-full flex flex-col p-4">
                    <nav className="flex flex-col space-y-4">
                        <Link
                            to="/dashboard"
                            className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800"
                        >
                            <span>Orders</span>
                        </Link>
                        <Link
                            to="/menu"
                            className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800"
                        >
                            <span>Menu</span>
                        </Link>
                        <Link
                            to="/feedback"
                            className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800"
                        >
                            <span>Feedback</span>
                        </Link>
                        <Link
                            to="/history"
                            className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800"
                        >
                            <span>Order History</span>
                        </Link>
                    </nav>

                    {/* Logout Button */}
                    <Link to={"/"} onClick={handleLogout} className='flex justify-center'>
                        <button
                            className="mt-20 font-bold text-sm flex items-center justify-center bg-[#1C359A] text-white px-12 py-2 rounded-lg hover:bg-blue-800"
                        >
                            SIGN OUT
                        </button>
                    </Link>
                </div>

                <main className="p-6 w-full overflow-auto">
                    {/* Header Section */}
                    <div className="w-full flex justify-between">
                        <div className="text-[#1C359A] text-lg font-bold">
                            Order Management
                        </div>
                        <div className="flex gap-2">
                            {/** <button className="px-4 py-2 border-2 border-[#1C359A] text-black font-bold rounded-md hover:bg-white">
                Post
              </button>
            */}
                            <button
                                className="px-4 py-2 border-2 border-[#1C359A] text-black font-bold rounded-md hover:bg-white"
                            >
                                Complete
                            </button>

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

                    <div className="p-2 w-full mt-6 rounded-2xl">
                        <table className="w-full bg-white opacity-90 rounded-2xl">
                            <thead>
                                <tr className="border-t border-4 border-[#DCDEEA]">
                                    <th className="p-3 text-left text-[#808080]">
                                        <input type="checkbox" checked={selectedOrders.length === orders.length && orders.length > 0} onChange={handleSelectAll} />
                                    </th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Order #</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Date</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Customer</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Location</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Service Option</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Details</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Total</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Status</th>
                                    <th className="p-3 text-left text-sm text-[#808080]">Update</th>

                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order.orders_id} className="border-t border-4 border-[#DCDEEA] hover:bg-gray-100">
                                            <td className="p-3">
                                                <input type="checkbox" checked={selectedOrders.includes(order.orders_id)} onChange={() => setSelectedOrders(prev => prev.includes(order.orders_id) ? prev.filter(id => id !== order.orders_id) : [...prev, order.orders_id])} />
                                            </td>
                                            <td className="p-3 text-sm">{order.orders_id}</td>
                                            <td className="p-3 text-sm">{order.created_at}</td>
                                            <td className="p-3 text-sm">{order.user.full_name}</td>
                                            <td className="p-3 text-sm">{order.user.address}</td> {/* Customer Address */}
                                            <td className="p-3 text-sm">{order.shipping_method}</td>
                                            <td className="p-3 text-sm">
                                                <button onClick={() => handleViewDetails(order)} className="text-blue-500 hover:text-blue-700">
                                                    <FaEye />
                                                </button>
                                            </td>
                                            <td className="p-3 text-sm">₱{order.total_amount}</td>
                                            <td className="p-3 font-semibold">
                                                {orderStatuses[order.orders_id] || "Loading..."}
                                            </td>                        <td className="p-3 relative">
                                                <button onClick={() => handleDropdownToggle(order.orders_id)} className="text-gray-600 hover:text-black">
                                                    <FaEllipsisV />
                                                </button>

                                                {openDropdown === order.orders_id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 shadow-md rounded-lg z-50">
                                                        <p className="text-blue-600 text-center font-semibold py-2">Update Status</p>
                                                        <div className="flex flex-col">
                                                            {["Pending", "Processing", "Out For Delivery", "Payment accepted", "Preparing", "Ready to pickup", "Out of delivery", "Completed", "Order accepted"].map((status) => (
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
                                    <tr>
                                        <td colSpan="6" className="text-center p-3">No orders found</td>
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
                                <span className="font-bold text-blue-700">Service option:</span> Pick-up
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
