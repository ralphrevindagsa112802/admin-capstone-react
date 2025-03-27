import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaEllipsisV } from "react-icons/fa";
import Swal from "sweetalert2";

const sizeLabels = {
  "Rice Meal": { small: "Regular", medium: "Large", large: "Extra Large" },
  "Classic Coffee": { small: "Small", medium: "Medium", large: "Large" },
  "Frappes": { small: "Small", medium: "Medium", large: "Large" },
  "Smoothies": { small: "Small", medium: "Medium", large: "Large" },
  "Refreshers": { small: "Small", medium: "Medium", large: "Large" },
  "Milk Drinks": { small: "Small", medium: "Medium", large: "Large" },
  "Dessert": { small: "Regular" }, // Only one size
  "Snacks and Pasta": { small: "Regular", medium: "Large", large: "Extra Large" }
};


const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredItems, setFilteredItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => {
         setIsOpen(!isOpen);
     };
 
  const [formData, setFormData] = useState({
    food_name: "",
    description: "",
    allergen: "",
    food_size: "",
    food_price: "",
    category: "",
    food_img: "",
  });

  const categories = [
    "All",
    "Rice Meal",
    "Classic Coffee",
    "Frappes",
    "Smoothies",
    "Refreshers",
    "Milk Drinks",
    "Dessert",
    "Snacks and Pasta"
  ];

  const toggleDropdown = (id, size) => {
    setDropdownOpen(prevId => (prevId === `${id}-${size}` ? null : `${id}-${size}`));
  };    
    
  const toggleFilterDropdown = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setIsFilterDropdownOpen(false);
    
    if (category === "All") {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category === category));
    }
  };

  // Availability
  const handleAvailabilityChange = async (id, size, status) => {

    console.log("Sending Availability Update:", { id, size, status }); // ✅ Debug request

    try {
        const response = await axios.post(
            "https://yappari-coffee-bar.shop/api/updateAvailability",
            {
                food_id: id,
                size: size,
                availability: status // ✅ Ensure correct format
            },
            {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            }
        );

        console.log("Update Response:", response.data); // ✅ Debug API response

        if (response.data.success) {
            Swal.fire('Success', 'Availability updated successfully!', 'success', {timer: 2000});
            setMenuItems((prevItems) =>
                prevItems.map((item) =>
                    item.food_id === id
                        ? { ...item, [`availability_${size.toLowerCase()}`]: status } // ✅ Update state with correct format
                        : item
                )
            );
            
            // Update filtered items as well
            setFilteredItems((prevItems) =>
                prevItems.map((item) =>
                    item.food_id === id
                        ? { ...item, [`availability_${size.toLowerCase()}`]: status }
                        : item
                )
            );
        } else {
          Swal.fire('Oops...', `Failed to update availability: ${response.data.message}`, 'error', {timer: 2000});
        }
    } catch (error) {
        console.error("Error updating availability:", error);
        Swal.fire('Oops...', 'Could not update availability.', 'error', {timer: 2000});
    }
  };



  //get menu
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get("https://yappari-coffee-bar.shop/api/getMenuItems", {
          params: { timestamp: new Date().getTime() }, // ✅ Prevents caching
          withCredentials: true,
        });
  
        console.log("Fetched Data:", response.data); // ✅ Debugging
        if (response.data.success) {
          setMenuItems(response.data.data);
          setFilteredItems(response.data.data); // Initialize filtered items with all items
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };
  
    fetchMenuItems();
  }, []);  

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-menu") && !event.target.closest(".action-button")) {
        setDropdownOpen(null);
      }
      
      if (!event.target.closest(".filter-dropdown") && !event.target.closest(".filter-button")) {
        setIsFilterDropdownOpen(false);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewImage(null);

    if (!editingFoodId) {  // ✅ Only reset form if NOT editing
        setFormData({
            food_name: "",
            description: "",
            allergen: "",
            category: "",
            price_small: "",
            price_medium: "",
            price_large: "",
            food_img: null,
        });
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Update form data with the new image file
      setFormData({ ...formData, food_img: file });
  
      // Create a temporary URL for the uploaded file for preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting Form...");
    console.log("Editing Food ID:", editingFoodId);
    console.log("Form Data:", formData);

    if (!formData.food_name || !formData.category) {
        Swal.fire('Oops...', 'Required fields missing!', 'error', {timer: 2000});
        return;
    }

    // Create FormData object
    const data = new FormData();
    data.append("food_name", formData.food_name);
    data.append("description", formData.description);
    data.append("allergen", formData.allergen || "");
    data.append("category", formData.category);
    data.append("price_small", formData.price_small || "");
    data.append("price_medium", formData.price_medium || "");
    data.append("price_large", formData.price_large || "");

    // Append the image file if it exists
    if (formData.food_img) {
        data.append("food_img", formData.food_img);
    } else if (formData.image_path) {
        data.append("existing_image", formData.image_path);
    }

    // ✅ Debugging - Log FormData content
    console.log("FormData Entries:");
    for (let pair of data.entries()) {
        console.log(pair[0] + ": " + pair[1]);
    }

    try {
        let response;
        if (editingFoodId) {
            data.append("food_id", editingFoodId);
            response = await axios.post(
                "https://yappari-coffee-bar.shop/api/updateProduct",
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );
        } else {
            response = await axios.post(
                "https://yappari-coffee-bar.shop/api/add_product",
                data,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );
        } 

        console.log("Server Response:", response.data); // ✅ Debug response

        if (response.data.success) {
            Swal.fire('Success', `${response.data.message}`, 'success', {timer: 2000});
            handleCloseModal();
            window.location.reload();
        } else {
            Swal.fire('Error', `${response.data.message}`, 'error', {timer: 2000});
        }
    } catch (error) {
        console.error("Error submitting product:", error);
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: editingFoodId ? "Failed to update product." : "Failed to add product.",
            timer: 2000,
        });
    }
  };


  

  //deleting from admin and database
  const [confirmDelete, setConfirmDelete] = useState(null); // Store item ID to delete
  const [foodList, setFoodList] = useState([]); // Assuming you store the menu items here

  const handleDeleteClick = (food_id) => {
    setConfirmDelete(food_id); // Set item to be deleted
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
  
    try {
      const response = await fetch(
        "https://yappari-coffee-bar.shop/api/delete_food", // Ensure correct URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ food_id: confirmDelete }),
        }
      );
  
      const result = await response.json();
      console.log("Delete API Response:", result); // ✅ Debug API response
  
      if (result.success) {
        Swal.fire('Success', 'Item deleted successfully!', 'success', {timer: 2000});
        const updatedMenuItems = menuItems.filter((item) => item.food_id !== confirmDelete);
        setMenuItems(updatedMenuItems);
        setFilteredItems(updatedMenuItems);
      } else {
        Swal.fire('Oops...', `Failed to delete item: ${result.message}`, 'error', {timer: 2000});
        console.error("Delete API Error:", result);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire('Oops...', 'Could not delete item. Check console for details.', 'error', {timer: 2000});
    }
  
    setConfirmDelete(null);
  };
  



  // Open Edit Modal and populate form
  const handleEditItem = (food_id) => {
    console.log("Clicked Edit - Food ID:", food_id); // ✅ Debug

    const itemToEdit = menuItems.find((item) => item.food_id === food_id);
    if (!itemToEdit) {
        console.error("Error: Item not found!", { food_id, menuItems });
        return;
    }

    setFormData({
        food_name: itemToEdit.food_name,
        description: itemToEdit.description,
        allergen: itemToEdit.allergen,
        category: itemToEdit.category,
        price_small: itemToEdit.price_small || "",
        price_medium: itemToEdit.price_medium || "",
        price_large: itemToEdit.price_large || "",
    });

    setPreviewImage(`https://yappari-coffee-bar.shop${itemToEdit.image_path}`);
    setEditingFoodId(food_id); // ✅ Ensure Food ID is set
    console.log("Set Editing Food ID:", food_id); // ✅ Debugging
    setIsModalOpen(true);
  };


  



  return (
    <div className="flex flex-col h-screen">
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
              className="font-medium rounded-lg transition-all duration-200 border-l-4 border-[#1C359A] bg-blue-50 hover:bg-blue-100 text-[#1C359A] flex items-center space-x-3 px-4 py-3"
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
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>SIGN OUT</span>
                            </button>
            </Link>
          </div>
        </div>

        {/* Main Content (Menu Management) */}
        {/* Main Content (Menu Management) */}
        <div className="flex-1 w-full p-2 sm:p-4 md:p-6 overflow-auto bg-[#DCDEEA] mt-22 lg:ml-64">  {/* Header Section */}
  {/* Header Section */}
  <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
    <div className="text-[#1C359A] text-lg font-bold">
      Menu Management {selectedCategory !== "All" && `- ${selectedCategory}`}
    </div>
    <div className="flex flex-wrap gap-2">
      <button
        onClick={handleOpenModal}
        data-testid="add-product-btn"
        className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border-2 border-[#1C359A] text-black font-bold rounded-md hover:bg-white"
      >
        Add Product
      </button>
      <div className="relative">
        <button 
          onClick={toggleFilterDropdown}
          className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border-2 border-[#1C359A] text-black font-bold rounded-md flex items-center space-x-2 hover:bg-white filter-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4 md:w-5 md:h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h3m-4.5 6h6m-7.5 6h9"
            />
          </svg>
          <span>Filter</span>
        </button>
        
        {/* Filter Dropdown */}
        {isFilterDropdownOpen && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 filter-dropdown">
            <div className="py-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedCategory === category 
                      ? 'bg-blue-100 text-[#1C359A] font-bold' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  
  {/* Menu Table - Desktop/Tablet View */}
  <div className="hidden md:block w-full mt-4 sm:mt-6 rounded-2xl overflow-hidden">
    <table className="w-full bg-white opacity-90 rounded-2xl">
      <thead>
        <tr className="border-t border-4 border-[#DCDEEA]">
         
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Name
          </th>
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Category
          </th>
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Price
          </th>
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Size
          </th>
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Availability
          </th>
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Description
          </th>
          <th className="px-4 py-2 text-left text-sm text-[#808080]">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {filteredItems && filteredItems.length > 0 ? (
          filteredItems.flatMap((item) => {                      
            // Get category-specific labels or fallback to default
            const labels = sizeLabels[item.category] || { small: "Small", medium: "Medium", large: "Large" };
            
            const sizes = [
              { size: labels.small, dbKey: "small", price: item.price_small },
              { size: labels.medium, dbKey: "medium", price: item.price_medium },
              { size: labels.large, dbKey: "large", price: item.price_large }
            ].filter(s => s.price !== null); // Remove sizes with no price
            
            return sizes.map((sizeItem, index) => (
              <tr
                key={`${item.food_id}-${sizeItem.size}`} // Unique key using food_id and size
                className="border-t border-4 border-[#DCDEEA] hover:bg-gray-100"
              >
                
                <td className="px-4 py-2">{item.food_name}</td>
                <td className="px-4 py-2">{item.category}</td>
                <td className="px-4 py-2">₱{sizeItem.price}</td>
                <td className="px-4 py-2">{sizeItem.size}</td>
                <td className="px-4 py-2 font-black text-[#1C359A]">
                  <span
                    className={`font-bold ${
                      item[`availability_${sizeItem.dbKey}`] === "Available"
                      ? "text-green-600"
                      : item[`availability_${sizeItem.dbKey}`] === "Not Available"
                      ? "text-red-600"
                      : "text-green-600" // Default styling for undefined cases
                    }`}
                  >
                  
                  {item[`availability_${sizeItem.dbKey}`] || "Not Available"}
                  </span>
                </td>
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2 relative">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleDropdown(item.food_id, sizeItem.size); }}
                    data-testid="action-btn" 
                    className="p-2 action-button">
                    <FaEllipsisV />
                  </button>
                  {dropdownOpen === `${item.food_id}-${sizeItem.size}` && (
                    <div className="absolute right-0 bg-white rounded drop-shadow-lg w-36 z-50 dropdown-menu">
                      <button 
                        onClick={() => handleEditItem(item.food_id)}
                        data-testid="edit-product-btn" 
                        className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200">
                        Edit
                      </button>
                      <button onClick={() => handleAvailabilityChange(item.food_id, sizeItem.size, "Available")} className="block w-full text-left px-4 py-2 text-green-600 hover:bg-gray-200">
                        Available
                      </button>
                      <button onClick={() => handleAvailabilityChange(item.food_id, sizeItem.size, "Not Available")} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200">
                        Not Available
                      </button>
                      <button onClick={() => handleDeleteClick(item.food_id)} className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ));
          })
        ) : (
          <tr>
            <td colSpan="8" className="border px-4 py-2 text-center text-gray-500">
              {selectedCategory !== "All" 
                ? `No menu items found in the ${selectedCategory} category` 
                : "No menu items available"}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Menu Cards - Mobile View */}
  <div className="md:hidden w-full mt-4">
    {filteredItems && filteredItems.length > 0 ? (
      filteredItems.flatMap((item) => {
        const labels = sizeLabels[item.category] || { small: "Small", medium: "Medium", large: "Large" };
        
        const sizes = [
          { size: labels.small, dbKey: "small", price: item.price_small },
          { size: labels.medium, dbKey: "medium", price: item.price_medium },
          { size: labels.large, dbKey: "large", price: item.price_large }
        ].filter(s => s.price !== null);
        
        return sizes.map((sizeItem, index) => (
          <div 
            key={`mobile-${item.food_id}-${sizeItem.size}`}
            className="bg-white rounded-lg shadow-sm mb-4 p-4 border-l-4 border-[#1C359A]"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                <span className="text-gray-500 mr-1 text-sm">Food: </span> 
                <h3 className="font-semibold">{item.food_name}</h3>
                </div>
                <div className="flex flex-wrap gap-x-4 mt-2">
                  <div className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                    <span className="text-gray-500 mr-1">Category:</span> 
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                    <span className="text-gray-500 mr-1">Size:</span> 
                    <span>{sizeItem.size}</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleDropdown(item.food_id, sizeItem.size); }} 
                  data-testid="action-btn"
                  className="p-2 action-button">
                  <FaEllipsisV />
                </button>
                {dropdownOpen === `${item.food_id}-${sizeItem.size}` && (
                  <div className="absolute right-0 bg-white rounded drop-shadow-lg w-36 z-50 dropdown-menu">
                    <button 
                      onClick={() => handleEditItem(item.food_id)}
                      data-testid="edit-product-btn" 
                      className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200 text-sm">
                      Edit
                    </button>
                    <button 
                      onClick={() => handleAvailabilityChange(item.food_id, sizeItem.size, "Available")} 
                      className="block w-full text-left px-4 py-2 text-green-600 hover:bg-gray-200 text-sm">
                      Available
                    </button>
                    <button 
                      onClick={() => handleAvailabilityChange(item.food_id, sizeItem.size, "Not Available")} 
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200 text-sm">
                      Not Available
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(item.food_id)} 
                      className="block w-full text-left px-4 py-2 text-black hover:bg-gray-200 text-sm">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-3">
              <div className="text-sm font-semibold">₱{sizeItem.price}</div>
              <div className={`text-sm font-bold ${
                item[`availability_${sizeItem.dbKey}`] === "Available"
                ? "text-green-600"
                : item[`availability_${sizeItem.dbKey}`] === "Not Available"
                ? "text-red-600"
                : "text-green-600"
              }`}>
                {item[`availability_${sizeItem.dbKey}`] || "Not Available"}
              </div>
            </div>
            
            {item.description && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">Description:</p>
                <p className="text-xs mt-1">{item.description}</p>
              </div>
            )}
          </div>
        ));
      })
    ) : (
      <div className="bg-white rounded-lg p-6 text-center text-gray-500">
        {selectedCategory !== "All" 
          ? `No menu items found in the ${selectedCategory} category` 
          : "No menu items available"}
      </div>
    )}
  </div>
</div>
      </div>

     {/**popup ADD product and EDIT  */}
{isModalOpen && (
  <div className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-lg w-full h-full md:h-auto md:w-[500px] md:max-w-md overflow-y-auto">
      <div className="p-3 relative">
        {/* Close Button */}
        <button 
          onClick={handleCloseModal} 
          className="absolute top-2 right-2 text-gray-600 text-xl"
          aria-label="Close modal"
        >
          &times;
        </button>

        {/* Dynamic Modal Title */}
        <h2 className="text-center text-lg font-bold text-blue-800 mb-2 mt-1">
          {editingFoodId ? "Editing Product" : "New Product"}
        </h2>

        {/* Image Upload Section */}
        <div
          onClick={() => document.getElementById("fileInput").click()}
          className="border-2 border-dashed border-gray-300 p-2 flex flex-col items-center cursor-pointer rounded-md mb-3 mx-auto"
        >
          <input
            id="fileInput"
            data-testid="food-img-input"
            type="file"
            className="hidden"
            onChange={handleImageChange}
            accept="image/*"
          />
          {previewImage ? (
            <img
              src={previewImage}
              className="w-16 h-16 object-cover rounded-md"
              alt="Preview"
            />
          ) : (
            <div className="text-center text-gray-500 text-xs py-1">
              <p>or</p>
              <p className="text-blue-600 underline">Browse image</p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="text-sm">
          {/* Product Name */}
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Product name:
            </label>
            <input
              type="text"
              name="food_name"
              data-testid="product-name-input"
              value={formData.food_name}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Description:
            </label>
            <textarea
              name="description"
              data-testid="description-input"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
              rows="2"
            ></textarea>
          </div>

          {/* Allergen */}
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Allergen:
            </label>
            <textarea
              name="allergen"
              data-testid="allergen-input"
              value={formData.allergen}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
              rows="2"
            ></textarea>
          </div>

          {/* Category */}
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Category:
            </label>
            <select
              name="category"
              data-testid="category-select"
              value={formData.category}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
            >
              <option value="">Select a Category</option>
              <option value="Rice Meal">Rice Meal</option>
              <option value="Classic Coffee">Classic Coffee</option>
              <option value="Frappes">Frappes</option>
              <option value="Smoothies">Smoothies</option>
              <option value="Refreshers">Refreshers</option>
              <option value="Milk Drinks">Milk Drinks</option>
              <option value="Dessert">Dessert</option>
              <option value="Snacks and Pasta">Snacks and Pasta</option>
            </select>
          </div>

          {/* Price Fields */}
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Small Price (₱):
            </label>
            <input
              type="number"
              name="price_small"
              data-testid="product-price-input"
              value={formData.price_small}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
            />
          </div>
          
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Medium Price (₱):
            </label>
            <input
              type="number"
              name="price_medium"
              value={formData.price_medium}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
            />
          </div>
          
          <div className="mb-2">
            <label className="block text-gray-700 font-medium text-xs mb-1">
              Large Price (₱):
            </label>
            <input
              type="number"
              name="price_large"
              data-testid="food-size-input"
              value={formData.price_large}
              onChange={handleChange}
              className="w-full p-1.5 border rounded-md text-sm"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            data-testid="submit-product-btn"
            className="mt-2 bg-blue-600 text-white p-1.5 rounded-md w-full text-sm"
          >
            {editingFoodId ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  </div>
)}

{/* Delete Confirmation Modal */}
{confirmDelete && (
  <div className="fixed inset-0 flex items-center justify-center  bg-opacity-50 z-50">
    <div className="bg-white p-3 rounded-lg shadow-lg w-64 md">
      <p className="text-center mb-3 text-sm">Are you sure you want to delete this item?</p>
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setConfirmDelete(null)}
          className="px-3 py-1.5 bg-gray-400 text-white rounded text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelete}
          className="px-3 py-1.5 bg-red-600 text-white rounded text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default AdminMenu;