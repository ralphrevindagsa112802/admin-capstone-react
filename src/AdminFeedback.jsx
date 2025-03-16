import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const AdminFeedback = () => {
  const [feedbackData, setFeedbackData] = useState([]);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
         setIsOpen(!isOpen);
     };
 
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
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-[#1C359A] bg-blue-50 hover:bg-blue-100 text-[#1C359A] flex items-center space-x-3 px-4 py-3"
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
