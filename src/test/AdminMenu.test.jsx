import React from 'react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminMenu from '../AdminMenu';
import Swal from 'sweetalert2';

// Mock dependencies
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true })
  }
}));

vi.mock("axios");

// Mock GET request for fetching menu items
axios.get.mockResolvedValue({
  data: [
    { id: 1, label: "Dashboard", path: "/dashboard" },
    { id: 2, label: "Menu", path: "/menu" },
    { id: 3, label: "Analytics", path: "/analytics" },
  ],
});

// Mock POST request for adding/editing products
axios.post.mockResolvedValue({
  data: { message: "Product added successfully!" },
});

beforeAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: vi.fn() },
    });
  });
  

describe('Admin Menu Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );
  };

  // Test Case 1: Component Renders Correctly
  it('renders Admin Menu with necessary elements', () => {
    renderComponent();

    expect(screen.getByText('Menu Management')).toBeInTheDocument();
    expect(screen.getByTestId('add-product-btn')).toBeInTheDocument();
  });

  // Test Case 2: Open Add Product Modal
  it('opens add product modal when add button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const addButtons = screen.getAllByTestId("add-product-btn");
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]); // Click the first button

    expect(screen.getAllByText('Add Product')[0]).toBeInTheDocument();
    expect(screen.getByTestId('product-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('product-price-input')).toBeInTheDocument();
  });

  // Test Case 3: Add Product Successfully
  it('handles successful product addition', async () => {
    const user = userEvent.setup();
    renderComponent();
  
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Product added successfully!" },
    });
  
    const addButtons = screen.getAllByTestId("add-product-btn");
    expect(addButtons.length).toBeGreaterThan(0);
    await user.click(addButtons[0]);
  
    await user.type(screen.getByTestId('product-name-input'), 'New Coffee');
    await user.type(screen.getByTestId('product-price-input'), '150');
    await user.type(screen.getByTestId('description-input'), 'Delicious coffee');
    await user.type(screen.getByTestId('allergen-input'), 'None');
    await user.selectOptions(
        screen.getByTestId('category-select'),
        'Classic Coffee'
    );
    await user.type(screen.getByTestId('food-img-input'), 'image-url.jpg');
  
    await user.click(screen.getByTestId('submit-product-btn'));
  
    await vi.waitUntil(() => Swal.fire.mock.calls.length > 0);
  
    expect(Swal.fire.mock.calls[0]).toEqual([
      "Success",
      "Product added successfully!",
      "success",
      { timer: 2000 }
    ]);
  });

  // Test Case 4: Edit Product Succesfully
  it('handles successful product edit', async () => {
    const user = userEvent.setup();
    
    // Mock products so an edit button exists
    axios.get.mockResolvedValueOnce({
      data: {
        success: true, // ✅ Must be `true` to set menu items
        data: [
          {
            food_id: 1,
            food_name: "Coffee",
            category: "Beverage",
            price_small: 100,
            price_medium: 150,
            price_large: 200,
            availability_small: "Available",
            availability_medium: "Available",
            availability_large: "Not Available",
            description: "Hot brewed coffee",
          },
        ],
      },
    });
  
    axios.post.mockResolvedValueOnce({
      data: { success: true, message: "Product updated successfully!" },
    });
  
    render(
      <MemoryRouter>
        <AdminMenu />
      </MemoryRouter>
    );
  
    // ✅ Wait for API data to load
    await waitFor(() => {
      const coffeeItems = screen.getAllByText("Coffee");
      expect(coffeeItems.length).toBeGreaterThan(0); // Ensure both appear
    });

    // ✅ Click action button to open dropdown
    const actionButton = screen.getAllByTestId("action-btn")[0];
    await user.click(actionButton);

    // ✅ Click "Edit" button
    const editButton = screen.getAllByTestId("edit-product-btn")[0];
    await user.click(editButton);
    
    const nameInput = screen.getByTestId('product-name-input');
    const priceInput = screen.getByTestId('product-price-input');
    const saveButton = screen.getByTestId('submit-product-btn');

    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Coffee');
    await user.clear(priceInput);
    await user.type(priceInput, '180');
    await user.click(saveButton);

    await vi.waitUntil(() => Swal.fire.mock.calls.length > 0);
    expect(Swal.fire.mock.calls[0]).toEqual([
        "Success",
        "Product added successfully!",
        "success",
        { timer: 2000 }
    ]);
  });  
});
