# ubill_playgrounds.py

from ubill import *
import sys

def main():
#     ubillMonth = sys.argv[1]
#     ubillUsage = sys.argv[2]
#     ubillCost = sys.argv[3]
#     
    #ubill = Ubill(ubillMonth, ubillUsage, ubillCost)
    ubill = Ubill(4,1200,0.75)
    print(ubill)
    print()
    #solarbill(ubillmonth, usage, production, excessfrom previous month, highertariff perent)
    solarBill = SolarBill(4,1000,1200,0,0.75)
    print(solarBill)
    print()
    solarBill.info()
    
main()



# argument order
# current month, current