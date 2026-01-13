import tkinter as tk
from tkinter import messagebox
import re

def is_valid_filename(filename):
    """Check if the given string is a valid filename."""
    # This regular expression can be modified according to your filename validation requirements
    return re.match(r'^[\w,\s-]+\.[A-Za-z]{3}$', filename) is not None

def on_submit():
    try:
        # Retrieve values as strings and check if they are empty
        name_str = name_entry.get()
        power_str = power_entry.get()
        orientation_str = orientation_entry.get()
        slope_str = slope_entry.get()
        shading_str = shading_entry.get()

        if not name_str:
            raise ValueError("Surface Name cannot be empty")
        if not power_str:
            raise ValueError("Power value cannot be empty")
        if not orientation_str:
            raise ValueError("Orientation value cannot be empty")
        if not slope_str:
            raise ValueError("Slope value cannot be empty")
        if not shading_str:
            raise ValueError("Shading value cannot be empty")

        # Retrieve and convert the values
        surface_name = name_entry.get()
        power_val = float(power_entry.get())
        orientation_val = float(orientation_entry.get())
        slope_val = float(slope_entry.get())
        shading_val = float(shading_entry.get())

        # Validate shading value to be between 0 and 100
        if not power_val >= 0:
            raise ValueError("Power value must be greater than 0")
        
        if not surface_name or not is_valid_filename(surface_name):
            raise ValueError("Please enter a valid filename for the Surface Name.")
        
        if not -180 <= orientation_val <= 180:
            raise ValueError("Orientation value must be between -180 and 180")
        
        if not 0 <= slope_val <= 90:
            raise ValueError("Slope value must be between 0 and 90")

        if not 0 <= shading_val <= 100:
            raise ValueError("Shading value must be between 0 and 100")
        
        # Convert shading to percentage
        shading_val_percent = shading_val / 100

        # You can process the values here
        messagebox.showinfo("JSON Saved as", f"Power: {power_val}, Orientation: {orientation_val}, Slope: {slope_val}, Shading: {shading_val_percent * 100}%")

    except ValueError as exception:
        messagebox.showerror("Input Error", str(exception))

# Create the main window
surface_gui = tk.Tk()
surface_gui.title("Create surface JSON")

tk.Label(surface_gui, text="Surface name:").grid(row=0, column=0)
name_entry = tk.Entry(surface_gui)
name_entry.grid(row=0, column=1)


# Create and place the labels and entry widgets
tk.Label(surface_gui, text="Power (Watts):").grid(row=1, column=0)
power_entry = tk.Entry(surface_gui)
power_entry.grid(row=1, column=1)

tk.Label(surface_gui, text="Orientation (-180,180):").grid(row=2, column=0)
orientation_entry = tk.Entry(surface_gui)
orientation_entry.grid(row=2, column=1)

tk.Label(surface_gui, text="Slope:").grid(row=3, column=0)
slope_entry = tk.Entry(surface_gui)
slope_entry.grid(row=3, column=1)

tk.Label(surface_gui, text="Shading:").grid(row=4, column=0)
shading_entry = tk.Entry(surface_gui)
shading_entry.grid(row=4, column=1)

# Create and place the submit button
submit_button = tk.Button(surface_gui, text="Save as JSON", command=on_submit)
submit_button.grid(row=5, column=0, columnspan=2)

# Start the GUI event loop
surface_gui.mainloop()
