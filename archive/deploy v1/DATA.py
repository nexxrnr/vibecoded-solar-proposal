input_json = {
    "project_id" : "",

    "project_address" : "Zdravka Jovanovica 44",
    "customer_name" : "Nenad Matic",
    
    "coordinates":{
        "lat": 44.0,
        "lon": 20.0
    },
    "system" : {
        "cost": 781000,
        "panel_power": 400,
        "inverter_brand" : "SolarEdge",
        "inverter_model" : "SE5000H-US",
        "panel_brand" : "Hanwha QCELLS",
        "panel_model" : "QPEAK DUO BLK G10+ 400",
        "panel_count" : 20,
        "total_DC_power": 8000
    },
    
    "layout": [
            {   
                "number_of_panels": 13,
                "orientation": 0,
                "slope": 35,
                "shading": 0.0
            },
            {
                "number_of_panels": 7,
                "orientation": 90,
                "slope": 35,
                "shading": 0.1
            }
         ],
    
    "ubill": {
        "monthly_usage": {
            "1" : 900,
            "2" : 900,
            "3" : 900,
            "4" : 900,
            "5" : 900,
            "6" : 900,
            "7" : 900,
            "8" : 900,
            "9" : 900,
            "10" : 900,
            "11" : 900,
            "12" : 900
            },
        "annual_usage": 10800,
        "bill_issued_month": 5,
        "higher_tariff_percentage": 0.90
        },
    
    "sales_rep" : {
        "name" : "Also Nenad Matic... weird huh?",
        "phone" : "066406188",
        "email" : "nenad@solar.in.rs"
        },
    
    "sales_company": {
        "name": "solar.in.rs",
        "phone" : "063123456789",
        "website" : "www.solar.in.rs"
        }
}

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