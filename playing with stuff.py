import datetime
from ubill import *
from layout import *
from usage import *
import matplotlib.pyplot as plt

def main():

    lat = 44.0
    lon = 20.0
    system_cost = 500000
    # create a layout with system & production
    layout = Layout()
    layout.load_from_json("2 surface layout.json")
    layout.calculate_production(lat, lon)
    
    usage = Usage()
    usage.load_from_json("usage.json")
    
    monthly_ubills = {}
    monthly_solar_bills = {}
    excess_for_next_month_helper = 0
    
    cummulative_ubill_costs = {}
    cummulative_solar_costs = {}
    months_until_breakeven = 0
    found = False
    
    for i in range(1, 301):
        month = i % 12 if i % 12 != 0 else 12
        year = (i-1)//12
        monthly_ubills[i] = Ubill(month, year, usage.twelve_monthly_usages[month], usage.higher_tariff_percent)  
        monthly_solar_bills[i] = SolarBill(month, year, usage.twelve_monthly_usages[month],
                                           layout.monthly_production[month], excess_for_next_month_helper, usage.higher_tariff_percent)
        if i == 1:
            cummulative_ubill_costs[i] = monthly_ubills[i].cost
            cummulative_solar_costs[i] = monthly_solar_bills[i].cost + system_cost
        else:
            cummulative_ubill_costs[i] = cummulative_ubill_costs[i-1] + monthly_ubills[i].cost
            cummulative_solar_costs[i] = cummulative_solar_costs[i-1] + monthly_solar_bills[i].cost
        if not found:
            if cummulative_ubill_costs[i] > cummulative_solar_costs[i]:
                months_until_breakeven = i
                found = True
                
        
    whole_years_until_breakeven = months_until_breakeven // 12
    extra_months = months_until_breakeven % 12 if months_until_breakeven % 12 != 0 else 12
    print(f"Breakeven is in {whole_years_until_breakeven} years and {extra_months} months")
    
    months = range(1,301)
    ubill_costs = list(cummulative_ubill_costs.values())
    solar_costs = list(cummulative_solar_costs.values())
    
    # Plotting the Utility Bill Costs line
    plt.plot(months, ubill_costs, '-', linewidth=2, label='Utility Bill Costs')
    plt.fill_between(months, ubill_costs, color="blue", alpha=0.3)  # 30% opacity

    # Plotting the Solar Costs line
    plt.plot(months, solar_costs, '-', linewidth=2, label='Solar Costs')
    plt.fill_between(months, solar_costs, color="green", alpha=0.3)  # 30% opacity

    # Adding labels and title
    plt.title("Yearly Costs Comparison Over 25 Years")
    plt.xlabel("Year")
    plt.ylabel("Cost")
    plt.legend()

    # Display the plot
    plt.show()

main()