import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminFeedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          "https://yappari-coffee-bar.shop/api/get_feedback.php",
          { withCredentials: true } // Ensures session cookies are sent
        );

        if (response.data.success) {
          setFeedbackData(response.data.feedback);
        } else {
          console.error("Failed to fetch feedback:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

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
            <Link to="/analytics" className="font-bold border-l-2 border-black hover:border-[#1C359A] sidebar-link flex items-center justify-center space-x-2 p-3 hover:bg-gray-200 text-gray-800">
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

        {/* Main Content (Feedback Management) */}
        <div className="flex-1 w-full p-6 overflow-auto bg-[#DCDEEA]">
          {/* Header Section */}
          <div className="w-full flex justify-between">
            <div className="text-[#1C359A] text-lg font-bold">Feedback</div>
          </div>

          {/* Feedback Table */}
          <div className="p-2 w-full mt-6 rounded-2xl">
            <table className="w-full bg-white opacity-90 rounded-2xl">
              <thead>
                <tr className="border-t border-4 border-[#DCDEEA]">
                  <th className="p-3 text-left text-[#808080]">#</th>
                  <th className="px-4 py-2 text-left text-sm text-[#808080]">Customer</th>
                  <th className="px-4 py-2 text-left text-sm text-[#808080]">Email</th>
                  <th className="px-4 py-2 text-left text-sm text-[#808080]">Feedback</th>
                  <th className="px-4 py-2 text-left text-sm text-[#808080]">Rating</th>
                </tr>
              </thead>
              <tbody>
                {feedbackData.length > 0 ? (
                  feedbackData.map((feedback, index) => (
                    <tr key={index} className="border-t border-4 border-[#DCDEEA] hover:bg-gray-100">
                      <td className="p-3">{index + 1}</td>
                      <td className="px-4 py-2">{feedback.f_name} {feedback.l_name}</td>
                      <td className="px-4 py-2">{feedback.email}</td>
                      <td className="px-4 py-2">{feedback.order_feedback}</td>
                      <td className="px-4 py-2">{feedback.feedback_score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-center">No feedback available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedback;
