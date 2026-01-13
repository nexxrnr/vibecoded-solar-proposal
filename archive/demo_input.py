# this represents what an input to the whole API should be
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
    
    # 12 usages
    # usage.twelve_monthly_usages
    # production
    # layout.monthly_production

    # create 12 regular ubills
    twelve_monthly_bills = {}
    for i in range(1,13):
        twelve_monthly_bills[i] = Ubill(i, usage.twelve_monthly_usages[i], usage.higher_tariff_percent)    
    
    # calculate 12 solar bills
    twelve_solar_bills = {}
    excess_for_next_month_helper = 0
    # what we gotta do is start with april bill with zero excess from previous and pass excess into next solar bill object

    for i in range(4,13):
        twelve_solar_bills[i] = SolarBill(i, usage.twelve_monthly_usages[i], layout.monthly_production[i], excess_for_next_month_helper, usage.higher_tariff_percent)
        excess_for_next_month_helper = twelve_solar_bills[i].excessForNextMonth
        
    for i in range(1,4):
        twelve_solar_bills[i] = SolarBill(i, usage.twelve_monthly_usages[i], layout.monthly_production[i], excess_for_next_month_helper, usage.higher_tariff_percent)
        excess_for_next_month_helper = twelve_solar_bills[i].excessForNextMonth
        

    # 12 month savings - process mock-up
    monthly_savings = {}
    annual_savings = 0
    
    annual_ubill_cost = 0
    annual_solar_cost = 0
    for i in range(1,13):
        monthly_savings[i] = int(twelve_monthly_bills[i].cost - twelve_solar_bills[i].cost)
        annual_savings += int(monthly_savings[i])
        annual_ubill_cost += int(twelve_monthly_bills[i].cost)
        annual_solar_cost += int(twelve_solar_bills[i].cost)
        
    ubill_average_kwh_cost = annual_ubill_cost / usage.annual_usage
    solar_average_kwh_cost = annual_solar_cost / usage.annual_usage
    
    print(f"Average kwh cost before solar: {ubill_average_kwh_cost}\nAverage kwh cost with solar: {solar_average_kwh_cost}")
    print(f"Current annual ubill costs: {annual_ubill_cost}")
    print(f"Proposed solar annual costs: {annual_solar_cost}")
    print(f"Total annual savings: {annual_savings}")
    
    print("\nnow calculating the 25 year outlook...")

    yearly_ubill_costs_25_years = {}
    yearly_solar_costs_25_years = {}
    ubill_costs_cummulative_25_years = {0: 0}
    solar_costs_cummulative_25_years = {0: system_cost}
    ubill_costs_combined_25_years = 0
    solar_costs_combined_25_years = 0
    cummulative_savings_25_years = {0: annual_ubill_cost - annual_solar_cost}
    
    for i in range(1,26):
        yearly_ubill_costs_25_years[i] = int(annual_ubill_cost * (1.05 ** i))
        yearly_solar_costs_25_years[i] = int(annual_solar_cost * (1.055 ** i))
        
        if i == 1:
            ubill_costs_cummulative_25_years[i] =  yearly_ubill_costs_25_years[i]
            solar_costs_cummulative_25_years[i] = system_cost + yearly_solar_costs_25_years[i]
        else:
            ubill_costs_cummulative_25_years[i] = ubill_costs_cummulative_25_years[i-1] + yearly_ubill_costs_25_years[i]
            solar_costs_cummulative_25_years[i] = solar_costs_cummulative_25_years[i-1] + yearly_solar_costs_25_years[i]            
        
        ubill_costs_combined_25_years += yearly_ubill_costs_25_years[i]
        solar_costs_combined_25_years += yearly_solar_costs_25_years[i]
        
    #print(f"yearly ubill costs over next 25 years: {yearly_ubill_costs_25_years}")
    #print(f"yearly solar costs over next 25 years: {yearly_solar_costs_25_years}")
    
   # print("Total difference:")
   # print(solar_costs_combined_25_years - ubill_costs_combined_25_years)
    
    years_to_meet = 0
    for i in range(0,26):
        if (ubill_costs_cummulative_25_years[i] > solar_costs_cummulative_25_years[i]):
            years_to_meet = i
            break
#     print(f"cummulative ubill costs: {ubill_costs_cummulative_25_years}")
#     print(f"cummulative solar costs: {solar_costs_cummulative_25_years}")
#     print(f"years to zero: {years_to_meet}")
    
    
    
    # plot stuff
    
    # Convert dictionary data to lists for plotting
    years = list(range(26))
    ubill_costs = list(ubill_costs_cummulative_25_years.values())
    solar_costs = list(solar_costs_cummulative_25_years.values())

    # Plotting the Utility Bill Costs line
    plt.plot(years, ubill_costs, '-', linewidth=2, label='Utility Bill Costs')
    plt.fill_between(years, ubill_costs, color="blue", alpha=0.3)  # 30% opacity

    # Plotting the Solar Costs line
    plt.plot(years, solar_costs, '-', linewidth=2, label='Solar Costs')
    plt.fill_between(years, solar_costs, color="green", alpha=0.3)  # 30% opacity

    # Adding labels and title
    plt.title("Yearly Costs Comparison Over 25 Years")
    plt.xlabel("Year")
    plt.ylabel("Cost")
    plt.legend()

    # Display the plot
    plt.show()
    
main()