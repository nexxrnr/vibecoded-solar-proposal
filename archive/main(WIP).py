from ubill import *
from production import *
from co2 import *
import decimal
import json
import requests
import os
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials

decimal.getcontext().prec = 2



output_sample = {
    "customer_name": "Nenad Matic",
    "project_address": "Zdravka Jovanovica 44",
    
    "system": {
      	"cost" : 781000,
        "panel_power": 400,
        "inverter_brand" : "SolarEdge",
        "inverter_model" : "SE5000H-US",
        "panel_brand" : "Hanwha QCELLS",
        "panel_model" : "QPEAK DUO BLK G10+ 400",
        "panel_count": 22,
        "total_DC_power": 8.8
    },
        
  	"production" : {
        "annual": 11909
    },
  
  	"solar_percentage_of_usage": 70,
	"import_percentage_of_usage": 30,
  
    "monthly_costs_pre_solar": {
      "1" : 3000, 
      "2" : 2000, 
      "3" : 4000, 
      "4" : 5000, 
      "5" : 4500, 
      "6" : 3500, 
      "7" : 4000, 
      "8" : 6000, 
      "9" : 5000, 
      "10" : 3000, 
      "11" : 2500, 
      "12" : 3500 
		},
  	"monthly_costs_post_solar": {
      "1" : 2000, 
      "2" : 1000, 
      "3" : 2500, 
      "4" : 3000, 
      "5" : 2500, 
      "6" : 1500, 
      "7" : 2000, 
      "8" : 4000, 
      "9" : 3000, 
      "10" : 1500, 
      "11" : 1500, 
      "12" : 1500 
    },
  
  	"higher_tariff_percentage": 80,
  	"annual_costs_pre_solar": 77887,
  	"annual_costs_post_solar": 33444,
  	"annual_cost_difference": 44443,
  	"breakeven_time_string": "6 godina i 9 meseci",
  	"years_in_profit": 17,
  	"co2" : {
      "reduction_kg" : 7027,
  		"number_of_trees_equivalent" : 88,
  		"car_kilometres_equivalent": 53123
    },
		
  	"sales_rep" : {
      "name" : "Also Nenad Matic... weird, huh?",
      "phone" : "066406188",
      "email" : "nenad@solar.in.rs"
    },
  	
  	"sales_company": {
	  	"name" : "solar.in.rs",
  		"phone" : "0659220635",
  		"email" : "info@solar.in.rs",
  		"website" : "www.solar.in.rs"
    }
}

def main(data):
        
    try:
        production = Production(layout=data['layout'], panel_power=data['system']['panel_power'], coordinates=data['coordinates'])
        co2 = CO2(data['ubill']['annual_usage'], production.annual)
        
        monthly_ubills = {}
        monthly_solar_bills = {}
        excess_helper = 0
        
        for i in range(1, 301):
            month = i % 12 if i % 12 != 0 else 12
            year = (i-1)//12
            
            monthly_ubills[i] = Ubill(month, year, usage= data['ubill']['monthly_usage'][str(month)], higherTariffPercent= data['ubill']['higher_tariff_percentage'])
            
            monthly_solar_bills[i] = SolarBill(month, year, usage = data['ubill']['monthly_usage'][str(month)], production = production.month[month],
                                            excessFromPreviousMonth = excess_helper, higherTariffPercent = data['ubill']['higher_tariff_percentage'])
            excess_helper = monthly_solar_bills[i].excessForNextMonth
        
        
            
    except Exception as exception:
        print(f"An exception was raised: {exception}")
        return
    
    
    cummulative_ubill_cost = 0
    cummulative_solar_cost = int(data['system']['cost'])
    
    for i in range(1, 301):
        cummulative_solar_cost += monthly_solar_bills[i].cost
        cummulative_ubill_cost += monthly_ubills[i].cost
        
        if cummulative_solar_cost <= cummulative_ubill_cost:
            months_until_breakeven = i
            break
        
    
    
    # prepare variables here
    
    solar_percentage_of_usage = decimal.Decimal(production.annual) /decimal.Decimal(data['ubill']['annual_usage']) * 100
    if solar_percentage_of_usage >= 100:
        import_percentage_of_usage = 0
    if solar_percentage_of_usage < 100 and solar_percentage_of_usage >= 0:
        import_percentage_of_usage = 100 - solar_percentage_of_usage
    
    monthly_costs_pre_solar = {
        "1" : monthly_ubills[1].cost,
        "2" : monthly_ubills[2].cost,
        "3" : monthly_ubills[3].cost,
        "4" : monthly_ubills[4].cost,
        "5" : monthly_ubills[5].cost,
        "6" : monthly_ubills[6].cost,
        "7" : monthly_ubills[7].cost,
        "8" : monthly_ubills[8].cost,
        "9" : monthly_ubills[9].cost,
        "10" : monthly_ubills[10].cost,
        "11" : monthly_ubills[11].cost,
        "12" : monthly_ubills[12].cost
        }
    
    monthly_costs_post_solar = {
        "1" : monthly_solar_bills[1].cost,
        "2" : monthly_solar_bills[2].cost,
        "3" : monthly_solar_bills[3].cost,
        "4" : monthly_solar_bills[4].cost,
        "5" : monthly_solar_bills[5].cost,
        "6" : monthly_solar_bills[6].cost,
        "7" : monthly_solar_bills[7].cost,
        "8" : monthly_solar_bills[8].cost,
        "9" : monthly_solar_bills[9].cost,
        "10" : monthly_solar_bills[10].cost,
        "11" : monthly_solar_bills[11].cost,
        "12" : monthly_solar_bills[12].cost
        }
    
    higher_tariff_percentage = decimal.Decimal(data['ubill']['higher_tariff_percentage']) * 100

    annual_costs_pre_solar = 0
    annual_costs_post_solar = 0
    for i in range(1,13):
        annual_costs_pre_solar += monthly_ubills[i].cost
        annual_costs_post_solar += monthly_solar_bills[i].cost
        
    annual_cost_difference = annual_costs_pre_solar - annual_costs_post_solar
    
    whole_years_until_breakeven = months_until_breakeven // 12
    extra_months_until_breakeven = months_until_breakeven % 12 if months_until_breakeven % 12 != 0 else 0
    
    if extra_months_until_breakeven == 1:
        breakeven_time_string = f"{whole_years_until_breakeven} godina i {extra_months_until_breakeven} mesec"
    if extra_months_until_breakeven > 1 and extra_months_until_breakeven < 5:
        breakeven_time_string = f"{whole_years_until_breakeven} godina i {extra_months_until_breakeven} meseca"
    if extra_months_until_breakeven > 4:
        breakeven_time_string = f"{whole_years_until_breakeven} godina i {extra_months_until_breakeven} meseci"
    if extra_months_until_breakeven == 0:
        breakeven_time_string = f"{whole_years_until_breakeven} godina"
        years_in_profit = 25 - whole_years_until_breakeven
    years_in_profit = 25 - whole_years_until_breakeven - 1

    
    
    output_data = {
        "customer_name": data['customer_name'],
        "project_address": data['project_address'],
        
        "system": {
            "cost" : data['system']['cost'],
            "panel_power": data['system']['panel_power'],
            "inverter_brand" : data['system']['inverter_brand'],
            "inverter_model" : data['system']['inverter_model'],
            "panel_brand" : data['system']['panel_brand'],
            "panel_model" : data['system']['panel_model'],
            "panel_count": data['system']['panel_count'],
            "total_DC_power": data['system']['total_DC_power']
        },
            
        "production" : {
            "annual": production.annual
        },
      
        "solar_percentage_of_usage": str(solar_percentage_of_usage),
        "import_percentage_of_usage": str(import_percentage_of_usage),
      
        "monthly_costs_pre_solar": monthly_costs_pre_solar,
        "monthly_costs_post_solar": monthly_costs_post_solar,
      
        "higher_tariff_percentage": str(int(100*data['ubill']['higher_tariff_percentage'])),
        "annual_costs_pre_solar": annual_costs_pre_solar,
        "annual_costs_post_solar": annual_costs_post_solar,
        "annual_cost_difference": annual_cost_difference,
        "breakeven_time_string": breakeven_time_string,
        "years_in_profit": years_in_profit,
        "co2" : {
          "reduction_kg" : co2.reduction_kg,
            "number_of_trees_equivalent" : co2.number_of_trees_equivalent,
            "car_kilometres_equivalent": co2.car_kilometres_equivalent
        },
            
        "sales_rep" : data['sales_rep'],
        
        "sales_company": data['sales_company']
    }
    print(output_data)
      
#     api_key = '5d1aODQyNTo4NDYxOlhjVExtSHVjNWhsUVVDb1U'
#     template_id = 'cb377b23816e949c'
#     
#     output_data_json = json.dumps(output_data)
#     
#     json_payload = {
#       "data": output_data_json,
#       "output_file": "output.pdf",
#       "export_type": "json",
#       "expiration": 10,
#       "template_id": template_id
#     }
#     
#     header = {"X-API-KEY": F"{api_key}"}
#     
#     url = "https://api.craftmypdf.com/v1/create"
#     
#     request = requests.post(F"{url}", headers = header, json = json_payload)
#     
#     print(request.content)
#     
#     return 
    try:
        # Set up OAuth2 service account credentials
        # Define the file to upload and the folder in Google Drive where you want to store it
        file_path = 'output.pdf'
        drive_folder_id = '1vqlwzvfvUS3TiyUxc2VDi-LfP6k_7JP5'  # Replace with the actual folder ID in Google Drive

        # Load OAuth credentials from 'oauth.json' and 'token.json'
        creds = None 
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json')

        # If credentials are missing or expired, authenticate again
        if not creds or not creds.valid:
            # Authenticate and authorize the application
            # You'll need to implement the authentication flow here if it's not already done
            # For example, using the google-auth library to get credentials

            # Save the credentials for future runs
            with open('token.json', 'w') as token_file:
                token_file.write(creds.to_json())

        # Build the Google Drive API service
        service = build('drive', 'v3', credentials=creds)

        # Create a media upload request
        media = MediaFileUpload(file_path, mimetype='application/pdf')

        # Create the file metadata
        file_metadata = {
            'name': 'output.pdf',
            'parents': [drive_folder_id]
        }

        # Upload the file
        file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

        # Print the file ID of the uploaded file
        print(f'File ID: {file.get("id")}')

    except Exception as e:
        print(e)
        
    
#     print(breakeven_time_text)
            
    
#         monthly_ubills[i] = Ubill(month, year, usage['monthly_usage'][str(month)], usage['higher_tariff_percent'])
#         monthly_solar_bills[i] = SolarBill(month, year, usage['monthly_usage'][str(month)],
#                                            layout.monthly_production[month], excess_for_next_month_helper, usage.higher_tariff_percent)
#         if i == 1:
#             cummulative_ubill_costs[i] = monthly_ubills[i].cost
#             cummulative_solar_costs[i] = monthly_solar_bills[i].cost + system_cost
#         else:
#             cummulative_ubill_costs[i] = cummulative_ubill_costs[i-1] + monthly_ubills[i].cost
#             cummulative_solar_costs[i] = cummulative_solar_costs[i-1] + monthly_solar_bills[i].cost
#         if not found:
#             if cummulative_ubill_costs[i] > cummulative_solar_costs[i]:
#                 months_until_breakeven = i
#                 found = True
#                 
#         
#     whole_years_until_breakeven = months_until_breakeven // 12
#     extra_months = months_until_breakeven % 12 if months_until_breakeven % 12 != 0 else 0
#     print(f"Breakeven is in {whole_years_until_breakeven} years and {extra_months} months")
#     
#     months = range(1,301)
#     ubill_costs = list(cummulative_ubill_costs.values())
#     solar_costs = list(cummulative_solar_costs.values())
#     
#     # Plotting the Utility Bill Costs line
#     plt.plot(months, ubill_costs, '-', linewidth=2, label='Utility Bill Costs')
#     plt.fill_between(months, ubill_costs, color="blue", alpha=0.3)  # 30% opacity
# 
#     # Plotting the Solar Costs line
#     plt.plot(months, solar_costs, '-', linewidth=2, label='Solar Costs')
#     plt.fill_between(months, solar_costs, color="green", alpha=0.3)  # 30% opacity
# 
#     # Adding labels and title
#     plt.title("Yearly Costs Comparison Over 25 Years")
#     plt.xlabel("Year")
#     plt.ylabel("Cost")
#     plt.legend()
# 
#     # Display the plot
#     plt.show()

main(input_json)